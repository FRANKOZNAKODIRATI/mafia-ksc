import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RoleType } from '@/types/game';
import GameLobby from '@/components/GameLobby';
import NightPhase from '@/components/NightPhase';
import VotingPhase from '@/components/VotingPhase';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '@/hooks/useGame';

const GameLobbyPage = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  
  const {
    game,
    players,
    currentPlayer,
    loading,
    error,
    startGame,
    submitNightAction,
    submitVote,
  } = useGame(gameCode || null);

  // Redirect if error
  useEffect(() => {
    if (error) {
      toast.error('Igra nije pronađena');
      navigate('/');
    }
  }, [error, navigate]);

  // Redirect if no current player (not joined)
  useEffect(() => {
    if (!loading && game && !currentPlayer) {
      // Player hasn't joined this game yet
      navigate(`/join?code=${gameCode}`);
    }
  }, [loading, game, currentPlayer, gameCode, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Učitavanje igre...</p>
        </div>
      </div>
    );
  }

  if (!game || !currentPlayer) {
    return null;
  }

  const phase = game.phase as 'lobby' | 'night' | 'day' | 'voting' | 'results';
  const currentTurn = game.current_turn as RoleType | null;
  const isHost = currentPlayer.isHost;

  const handleStartGame = async () => {
    await startGame();
  };

  const handleNightAction = async (targetId: string) => {
    const target = players.find(p => p.id === targetId);
    toast.success(`Odabrao si: ${target?.username}`);
    await submitNightAction(targetId);
  };

  const handleVote = async (targetId: string) => {
    await submitVote(targetId);
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
          gameCode={game.code}
          players={players}
          currentPlayer={currentPlayer}
          isHost={isHost}
          mafiaCount={game.mafia_count}
          selectedRoles={(game.selected_roles || []) as RoleType[]}
          onStartGame={handleStartGame}
        />
      </>
    );
  }

  if (phase === 'night' && currentTurn) {
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
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Napusti
        </motion.button>
        
        <VotingPhase
          players={players}
          currentPlayer={currentPlayer}
          votes={game.votes}
          onVote={handleVote}
        />
      </>
    );
  }

  return null;
};

export default GameLobbyPage;
