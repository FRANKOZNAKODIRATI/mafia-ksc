import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Player, RoleType } from '@/types/game';
import GameLobby from '@/components/GameLobby';
import NightPhase from '@/components/NightPhase';
import VotingPhase from '@/components/VotingPhase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type GamePhase = 'lobby' | 'night' | 'day' | 'voting' | 'results';

const GameLobbyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    gameCode: string;
    mafiaCount?: number;
    selectedRoles?: RoleType[];
    username: string;
    isHost: boolean;
    role?: RoleType;
  } | null;

  // Redirect if no state
  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [currentTurn, setCurrentTurn] = useState<RoleType>('mafia');
  const [votes, setVotes] = useState<Record<string, string>>({});
  
  // Mock players for demo
  const [players, setPlayers] = useState<Player[]>(() => {
    if (!state) return [];
    
    const mockPlayers: Player[] = [
      { 
        id: 'host', 
        username: state.username, 
        role: state.isHost ? undefined : state.role, 
        isAlive: true, 
        isMuted: false, 
        isHost: state.isHost 
      },
    ];

    // Add some mock players for demo
    if (state.isHost) {
      mockPlayers.push(
        { id: '2', username: 'Ana', isAlive: true, isMuted: false, isHost: false },
        { id: '3', username: 'Marko', isAlive: true, isMuted: false, isHost: false },
        { id: '4', username: 'Petra', isAlive: true, isMuted: false, isHost: false },
        { id: '5', username: 'Ivan', isAlive: true, isMuted: false, isHost: false },
      );
    }

    return mockPlayers;
  });

  if (!state) return null;

  const currentPlayer = players.find(p => p.id === 'host') || players[0];

  const handleStartGame = () => {
    // Assign roles to players
    const availableRoles: RoleType[] = [
      ...Array(state.mafiaCount || 1).fill('mafia'),
      ...(state.selectedRoles || []),
    ];
    
    // Fill remaining with citizens
    while (availableRoles.length < players.length) {
      availableRoles.push('citizen');
    }

    // Shuffle and assign
    const shuffled = [...availableRoles].sort(() => Math.random() - 0.5);
    const updatedPlayers = players.map((player, i) => ({
      ...player,
      role: shuffled[i],
    }));

    setPlayers(updatedPlayers);
    setPhase('night');
    toast.success('Igra je počela! Noć pada na grad...');
  };

  const handleNightAction = (targetId: string) => {
    const target = players.find(p => p.id === targetId);
    toast.success(`Odabrao si: ${target?.username}`);
    
    // Move to next turn or day phase
    const turnOrder: RoleType[] = ['mafia', 'dame', 'doctor', 'detective'];
    const currentIndex = turnOrder.indexOf(currentTurn);
    
    if (currentIndex < turnOrder.length - 1) {
      const nextTurn = turnOrder[currentIndex + 1];
      // Check if any player has this role
      const hasRole = players.some(p => p.role === nextTurn && p.isAlive);
      if (hasRole) {
        setCurrentTurn(nextTurn);
      } else {
        // Skip to next or day
        setPhase('voting');
      }
    } else {
      setPhase('voting');
    }
  };

  const handleVote = (targetId: string) => {
    setVotes(prev => ({
      ...prev,
      [currentPlayer.id]: targetId,
    }));
    toast.success('Glas zabilježen!');
  };

  // Render based on phase
  if (phase === 'lobby') {
    return (
      <>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Napusti
        </motion.button>
        
        <GameLobby
          gameCode={state.gameCode}
          players={players}
          currentPlayer={currentPlayer}
          isHost={state.isHost}
          mafiaCount={state.mafiaCount || 1}
          selectedRoles={state.selectedRoles || []}
          onStartGame={handleStartGame}
        />
      </>
    );
  }

  if (phase === 'night') {
    return (
      <NightPhase
        players={players}
        currentPlayer={currentPlayer}
        currentTurn={currentTurn}
        onAction={handleNightAction}
      />
    );
  }

  if (phase === 'voting') {
    return (
      <>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setPhase('night')}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          (Demo) Natrag na Noć
        </motion.button>
        
        <VotingPhase
          players={players}
          currentPlayer={currentPlayer}
          votes={votes}
          onVote={handleVote}
        />
      </>
    );
  }

  return null;
};

export default GameLobbyPage;
