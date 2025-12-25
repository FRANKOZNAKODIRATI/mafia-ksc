import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RoleType } from '@/types/game';
import GameLobby from '@/components/GameLobby';
import NightPhase from '@/components/NightPhase';
import VotingPhase from '@/components/VotingPhase';
import DayPhase from '@/components/DayPhase';
import WinScreen from '@/components/WinScreen';
import HostControls from '@/components/HostControls';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '@/hooks/useGame';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const GameLobbyPage = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const [votingStarted, setVotingStarted] = useState(false);
  const { sounds, preloadAll } = useSoundEffects();
  
  const {
    game,
    players,
    currentPlayer,
    loading,
    error,
    winner,
    startGame,
    submitNightAction,
    submitVote,
    advanceToNextTurn,
    startVoting,
    endVoting,
    startNight,
    resetGame,
  } = useGame(gameCode || null);

  // Preload sounds on mount
  useEffect(() => {
    preloadAll();
  }, [preloadAll]);

  // Play sounds on phase changes
  useEffect(() => {
    if (!game) return;
    
    if (game.phase === 'night') {
      sounds.playNightFall();
    } else if (game.phase === 'voting') {
      sounds.playTransition();
      setVotingStarted(true);
    } else if (game.phase === 'day') {
      sounds.playTransition();
      setVotingStarted(false);
    }
  }, [game?.phase, sounds]);

  // Play sound on role wake up
  useEffect(() => {
    if (game?.phase === 'night' && game.current_turn) {
      const isMyTurn = currentPlayer?.role === game.current_turn;
      if (isMyTurn) {
        sounds.playWakeUp();
      }
    }
  }, [game?.current_turn, game?.phase, currentPlayer?.role, sounds]);

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
    sounds.playRoleReveal();
    await startGame();
  };

  const handleNightAction = async (targetId: string) => {
    const target = players.find(p => p.id === targetId);
    toast.success(`Odabrao si: ${target?.username}`);
    sounds.playTick();
    await submitNightAction(targetId);
  };

  const handleVote = async (targetId: string) => {
    sounds.playVote();
    await submitVote(targetId);
    toast.success('Glas zabilježen!');
  };

  const handlePlayAgain = async () => {
    await resetGame();
  };

  const handleExit = () => {
    navigate('/');
  };

  const handleStartVoting = async () => {
    await startVoting();
    setVotingStarted(true);
  };

  const handleEndVoting = async () => {
    sounds.playElimination();
    await endVoting();
    setVotingStarted(false);
  };

  // Show win screen
  if (winner) {
    return (
      <WinScreen
        winner={winner}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    );
  }

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
      <>
        <NightPhase
          players={players}
          currentPlayer={currentPlayer}
          currentTurn={currentTurn}
          onAction={handleNightAction}
          isHost={isHost}
        />
        {isHost && (
          <HostControls
            phase={phase}
            currentTurn={currentTurn}
            onStartVoting={handleStartVoting}
            onEndVoting={handleEndVoting}
            onNextTurn={advanceToNextTurn}
            onStartNight={startNight}
            votingStarted={votingStarted}
          />
        )}
      </>
    );
  }

  if (phase === 'day') {
    return (
      <>
        <DayPhase
          players={players}
          currentPlayer={currentPlayer}
          isHost={isHost}
          onStartVoting={handleStartVoting}
        />
        {isHost && (
          <HostControls
            phase={phase}
            currentTurn={null}
            onStartVoting={handleStartVoting}
            onEndVoting={handleEndVoting}
            onNextTurn={advanceToNextTurn}
            onStartNight={startNight}
            votingStarted={votingStarted}
          />
        )}
      </>
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
          onTimeUp={handleEndVoting}
          duration={15}
        />
        {isHost && (
          <HostControls
            phase={phase}
            currentTurn={null}
            onStartVoting={handleStartVoting}
            onEndVoting={handleEndVoting}
            onNextTurn={advanceToNextTurn}
            onStartNight={startNight}
            votingStarted={votingStarted}
          />
        )}
      </>
    );
  }

  return null;
};

export default GameLobbyPage;
