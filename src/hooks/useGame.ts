import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, RoleType } from '@/types/game';
import { toast } from 'sonner';

// Generate a unique client ID for this session
const getClientId = () => {
  let clientId = sessionStorage.getItem('mafia_client_id');
  if (!clientId) {
    clientId = crypto.randomUUID();
    sessionStorage.setItem('mafia_client_id', clientId);
  }
  return clientId;
};

export interface GameData {
  id: string;
  code: string;
  host_id: string;
  phase: string;
  current_turn: string | null;
  mafia_count: number;
  selected_roles: string[];
  mafia_target: string | null;
  doctor_target: string | null;
  detective_target: string | null;
  dame_target: string | null;
  votes: Record<string, string>;
}

export interface PlayerData {
  id: string;
  game_id: string;
  username: string;
  role: string | null;
  is_alive: boolean;
  is_muted: boolean;
  is_host: boolean;
  client_id: string;
}

export type WinnerType = 'mafia' | 'citizens' | null;

export const useGame = (gameCode: string | null) => {
  const [game, setGame] = useState<GameData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<WinnerType>(null);

  const clientId = getClientId();

  // Check win conditions
  const checkWinCondition = useCallback((playersList: PlayerData[]): WinnerType => {
    const alivePlayers = playersList.filter(p => p.is_alive);
    
    // Don't check win condition if roles aren't assigned yet (lobby phase)
    const playersWithRoles = alivePlayers.filter(p => p.role !== null);
    if (playersWithRoles.length === 0) {
      return null;
    }
    
    // Mafia team: mafia + dame
    const mafiaTeam = alivePlayers.filter(p => p.role === 'mafia' || p.role === 'dame');
    // Citizens team: citizen + doctor + detective (and host who has no role but is alive)
    const citizensTeam = alivePlayers.filter(p => 
      p.role === 'citizen' || p.role === 'doctor' || p.role === 'detective' || p.role === null
    );

    // Mafia wins when mafia team equals or outnumbers citizens team
    if (mafiaTeam.length >= citizensTeam.length && mafiaTeam.length > 0) {
      return 'mafia';
    }

    // Citizens win when all mafia (not dame) are eliminated
    const aliveMafia = alivePlayers.filter(p => p.role === 'mafia');
    if (aliveMafia.length === 0) {
      return 'citizens';
    }

    return null;
  }, []);

  // Fetch game and players
  const fetchGameData = useCallback(async () => {
    if (!gameCode) return;

    try {
      // Fetch game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('code', gameCode)
        .single();

      if (gameError) throw gameError;
      
      setGame({
        ...gameData,
        votes: (gameData.votes as Record<string, string>) || {}
      });

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameData.id)
        .order('created_at', { ascending: true });

      if (playersError) throw playersError;
      
      setPlayers(playersData || []);
      
      // Find current player
      const current = playersData?.find(p => p.client_id === clientId);
      if (current) {
        setCurrentPlayer(current);
      }

      // Check win condition
      const winResult = checkWinCondition(playersData || []);
      if (winResult && gameData.phase !== 'lobby') {
        setWinner(winResult);
      }
    } catch (err: any) {
      console.error('Error fetching game:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [gameCode, clientId, checkWinCondition]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!gameCode) return;

    fetchGameData();

    // Subscribe to game changes
    const gameChannel = supabase
      .channel(`game-${gameCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          console.log('Game update:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newGame = payload.new as any;
            setGame({
              ...newGame,
              votes: (newGame.votes as Record<string, string>) || {}
            });
          }
        }
      )
      .subscribe();

    // Subscribe to player changes for this game
    const playersChannel = supabase
      .channel(`players-${gameCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        async (payload) => {
          console.log('Players update:', payload);
          // Refetch players when any change happens
          if (game?.id) {
            const { data: playersData } = await supabase
              .from('players')
              .select('*')
              .eq('game_id', game.id)
              .order('created_at', { ascending: true });
            
            if (playersData) {
              setPlayers(playersData);
              const current = playersData.find(p => p.client_id === clientId);
              if (current) {
                setCurrentPlayer(current);
              }

              // Check win condition on player update
              const winResult = checkWinCondition(playersData);
              if (winResult) {
                setWinner(winResult);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [gameCode, fetchGameData, clientId, game?.id, checkWinCondition]);

  // Create a new game
  const createGame = async (
    username: string,
    mafiaCount: number,
    selectedRoles: RoleType[],
    maxPlayers: number = 8
  ): Promise<string> => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      // Create game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          code,
          host_id: clientId,
          mafia_count: mafiaCount,
          selected_roles: selectedRoles,
          phase: 'lobby',
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Create host player
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: gameData.id,
          username,
          is_host: true,
          client_id: clientId,
        });

      if (playerError) throw playerError;

      return code;
    } catch (err: any) {
      console.error('Error creating game:', err);
      throw err;
    }
  };

  // Join an existing game
  const joinGame = async (username: string): Promise<boolean> => {
    if (!game) return false;

    try {
      const { error } = await supabase
        .from('players')
        .insert({
          game_id: game.id,
          username,
          is_host: false,
          client_id: clientId,
        });

      if (error) throw error;
      
      await fetchGameData();
      return true;
    } catch (err: any) {
      console.error('Error joining game:', err);
      throw err;
    }
  };

  // Check if game exists
  const checkGameExists = async (code: string): Promise<boolean> => {
    const { data } = await supabase
      .from('games')
      .select('id')
      .eq('code', code)
      .single();
    
    return !!data;
  };

  // Start the game (host only)
  const startGame = async () => {
    if (!game || !currentPlayer?.is_host) return;

    try {
      // Get non-host players for role assignment
      const nonHostPlayers = players.filter(p => !p.is_host);
      
      // Assign roles to non-host players only (host is narrator)
      const availableRoles: string[] = [
        ...Array(game.mafia_count).fill('mafia'),
        ...(game.selected_roles || []),
      ];
      
      // Fill remaining with citizens
      while (availableRoles.length < nonHostPlayers.length) {
        availableRoles.push('citizen');
      }

      // Shuffle roles
      const shuffled = [...availableRoles].sort(() => Math.random() - 0.5);

      // Update each non-host player with their role
      for (let i = 0; i < nonHostPlayers.length; i++) {
        await supabase
          .from('players')
          .update({ role: shuffled[i] })
          .eq('id', nonHostPlayers[i].id);
      }

      // Host gets special narrator role
      await supabase
        .from('players')
        .update({ role: 'narrator' })
        .eq('id', currentPlayer.id);

      // Update game phase
      await supabase
        .from('games')
        .update({ 
          phase: 'night',
          current_turn: 'mafia',
        })
        .eq('id', game.id);

      toast.success('Igra je počela! Noć pada na grad...');
    } catch (err: any) {
      console.error('Error starting game:', err);
      toast.error('Greška pri pokretanju igre');
    }
  };

  // Host controls: advance to next turn
  const advanceToNextTurn = async () => {
    if (!game || !currentPlayer?.is_host) return;

    const turnOrder: RoleType[] = ['mafia', 'dame', 'doctor', 'detective'];
    const currentIndex = turnOrder.indexOf(game.current_turn as RoleType);
    let nextTurn: RoleType | null = null;

    // Find next available role
    for (let i = currentIndex + 1; i < turnOrder.length; i++) {
      const hasRole = players.some(p => p.role === turnOrder[i] && p.is_alive && !p.is_host);
      if (hasRole) {
        nextTurn = turnOrder[i];
        break;
      }
    }

    if (nextTurn) {
      await supabase
        .from('games')
        .update({ current_turn: nextTurn })
        .eq('id', game.id);
    } else {
      // End night, start day
      await resolveNight();
    }
  };

  // Resolve night actions
  const resolveNight = async () => {
    if (!game) return;

    // Check if target was saved by doctor
    const targetId = game.mafia_target;
    const savedId = game.doctor_target;

    if (targetId && targetId !== savedId) {
      // Mark player as dead (unless they are host)
      const targetPlayer = players.find(p => p.id === targetId);
      if (targetPlayer && !targetPlayer.is_host) {
        await supabase
          .from('players')
          .update({ is_alive: false })
          .eq('id', targetId);
        
        toast.info(`${targetPlayer.username} je eliminiran tijekom noći!`);
      }
    }

    // Apply mute from dame
    if (game.dame_target) {
      await supabase
        .from('players')
        .update({ is_muted: true })
        .eq('id', game.dame_target);
    }

    // Reset night actions and move to day
    await supabase
      .from('games')
      .update({
        phase: 'day',
        current_turn: null,
        mafia_target: null,
        doctor_target: null,
        detective_target: null,
        dame_target: null,
      })
      .eq('id', game.id);
  };

  // Host controls: start voting
  const startVoting = async () => {
    if (!game || !currentPlayer?.is_host) return;

    await supabase
      .from('games')
      .update({ 
        phase: 'voting',
        votes: {},
      })
      .eq('id', game.id);
    
    toast.success('Glasanje je počelo!');
  };

  // Host controls: end voting and eliminate
  const endVoting = async () => {
    if (!game || !currentPlayer?.is_host) return;

    // Count votes
    const voteCounts: Record<string, number> = {};
    Object.values(game.votes).forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // Find player with most votes (exclude host from elimination)
    let maxVotes = 0;
    let eliminated: string | null = null;
    
    Object.entries(voteCounts).forEach(([playerId, count]) => {
      const player = players.find(p => p.id === playerId);
      if (count > maxVotes && player && !player.is_host) {
        maxVotes = count;
        eliminated = playerId;
      }
    });

    if (eliminated) {
      const eliminatedPlayer = players.find(p => p.id === eliminated);
      await supabase
        .from('players')
        .update({ is_alive: false })
        .eq('id', eliminated);
      
      toast.info(`${eliminatedPlayer?.username} je eliminiran glasanjem!`);
    }

    // Reset muted status for next round
    await supabase
      .from('players')
      .update({ is_muted: false })
      .eq('game_id', game.id);

    // Check win condition after elimination
    const updatedPlayers = players.map(p => 
      p.id === eliminated ? { ...p, is_alive: false } : p
    );
    const winResult = checkWinCondition(updatedPlayers);

    if (winResult) {
      setWinner(winResult);
      await supabase
        .from('games')
        .update({ phase: 'results' })
        .eq('id', game.id);
    } else {
      // Start new night
      await supabase
        .from('games')
        .update({
          phase: 'night',
          current_turn: 'mafia',
          votes: {},
        })
        .eq('id', game.id);
    }
  };

  // Host controls: start night
  const startNight = async () => {
    if (!game || !currentPlayer?.is_host) return;

    await supabase
      .from('games')
      .update({
        phase: 'night',
        current_turn: 'mafia',
        votes: {},
      })
      .eq('id', game.id);
  };

  // Submit night action
  const submitNightAction = async (targetId: string) => {
    if (!game || !currentPlayer) return;

    const role = currentPlayer.role;
    const updateData: Partial<GameData> = {};

    if (role === 'mafia') {
      updateData.mafia_target = targetId;
    } else if (role === 'dame') {
      updateData.dame_target = targetId;
    } else if (role === 'doctor') {
      updateData.doctor_target = targetId;
    } else if (role === 'detective') {
      updateData.detective_target = targetId;
    }

    try {
      await supabase
        .from('games')
        .update(updateData)
        .eq('id', game.id);
    } catch (err: any) {
      console.error('Error submitting night action:', err);
    }
  };

  // Submit vote (exclude host from being voted)
  const submitVote = async (targetId: string) => {
    if (!game || !currentPlayer) return;

    // Can't vote for host
    const targetPlayer = players.find(p => p.id === targetId);
    if (targetPlayer?.is_host) {
      toast.error('Ne možeš glasati za domaćina!');
      return;
    }

    const newVotes = { ...game.votes, [currentPlayer.id]: targetId };

    try {
      await supabase
        .from('games')
        .update({ votes: newVotes })
        .eq('id', game.id);
    } catch (err: any) {
      console.error('Error submitting vote:', err);
    }
  };

  // Reset game for play again
  const resetGame = async () => {
    if (!game || !currentPlayer?.is_host) return;

    try {
      // Reset all players
      await supabase
        .from('players')
        .update({ 
          is_alive: true, 
          is_muted: false,
          role: null,
        })
        .eq('game_id', game.id);

      // Reset game state
      await supabase
        .from('games')
        .update({
          phase: 'lobby',
          current_turn: null,
          mafia_target: null,
          doctor_target: null,
          detective_target: null,
          dame_target: null,
          votes: {},
        })
        .eq('id', game.id);

      setWinner(null);
    } catch (err: any) {
      console.error('Error resetting game:', err);
    }
  };

  // Convert database player to frontend Player type
  const convertToPlayer = (p: PlayerData): Player => ({
    id: p.id,
    username: p.username,
    role: p.role as RoleType | undefined,
    isAlive: p.is_alive,
    isMuted: p.is_muted,
    isHost: p.is_host,
  });

  return {
    game,
    players: players.map(convertToPlayer),
    currentPlayer: currentPlayer ? convertToPlayer(currentPlayer) : null,
    loading,
    error,
    clientId,
    winner,
    createGame,
    joinGame,
    checkGameExists,
    startGame,
    submitNightAction,
    submitVote,
    refetch: fetchGameData,
    // Host controls
    advanceToNextTurn,
    startVoting,
    endVoting,
    startNight,
    resetGame,
  };
};
