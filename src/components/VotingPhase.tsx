import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@/types/game';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface VotingPhaseProps {
  players: Player[];
  currentPlayer: Player;
  votes: Record<string, string>;
  onVote: (targetId: string) => void;
  onTimeUp?: () => void;
  duration?: number;
}

const VotingPhase: React.FC<VotingPhaseProps> = ({
  players,
  currentPlayer,
  votes,
  onVote,
  onTimeUp,
  duration = 15,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUp]);

  // Exclude host from being voted and exclude self
  const votablePlayers = players.filter(p => p.isAlive && p.id !== currentPlayer.id && !p.isHost);
  
  // Add "skip" option as a virtual target
  const SKIP_VOTE_ID = 'SKIP_VOTE';
  
  // Count votes per player (including skip)
  const voteCounts: Record<string, number> = {};
  Object.values(votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  // Host can't vote, just observes
  const canVote = !currentPlayer.isHost && !currentPlayer.isMuted && currentPlayer.isAlive;

  const handleVote = () => {
    if (selectedTarget && !hasVoted && canVote) {
      onVote(selectedTarget);
      setHasVoted(true);
    }
  };

  // Check if voting for skip
  const isSkipVote = selectedTarget === SKIP_VOTE_ID;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-4 pt-20"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-6xl">⚖️</span>
          </motion.div>
          <h1 className="font-display text-4xl text-accent mt-4 mb-2">
            Vrijeme Glasanja
          </h1>
          <p className="text-muted-foreground">
            Glasaj tko je po tebi mafija
          </p>
          
          {/* Timer */}
          <div className="mt-4 flex justify-center">
            <div className="bg-card border border-border rounded-full px-6 py-2 flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span className="font-display text-2xl text-primary">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Host indicator */}
        {currentPlayer.isHost && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/20 border border-accent/50 rounded-lg p-4 mb-6 text-center"
          >
            <span className="text-2xl">👑</span>
            <p className="text-accent mt-2">Ti si domaćin - promatraj glasanje i završi ga pomoću kontrola dolje</p>
          </motion.div>
        )}

        {/* Muted indicator */}
        {currentPlayer.isMuted && !currentPlayer.isHost && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/20 border border-primary/50 rounded-lg p-4 mb-6 text-center"
          >
            <span className="text-2xl">🤐</span>
            <p className="text-primary mt-2">Utišan/a si - ne možeš glasati ovu rundu</p>
          </motion.div>
        )}

        {/* Player list */}
        <div className="space-y-3 mb-6">
          {votablePlayers.map((player, index) => (
            <motion.button
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => canVote && !hasVoted && setSelectedTarget(player.id)}
              disabled={hasVoted || !canVote}
              className={cn(
                "w-full p-4 rounded-xl border transition-all duration-300 flex items-center justify-between",
                selectedTarget === player.id 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-card hover:border-primary/50",
                (hasVoted || !canVote) && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                  👤
                </div>
                <span className="font-medium">{player.username}</span>
              </div>
              
              {/* Vote count */}
              <div className="flex items-center gap-2">
                {voteCounts[player.id] > 0 && (
                  <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {voteCounts[player.id]} {voteCounts[player.id] === 1 ? 'glas' : 'glasova'}
                  </span>
                )}
                {selectedTarget === player.id && (
                  <span className="text-primary text-xl">✓</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Skip vote option */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: votablePlayers.length * 0.1 }}
          onClick={() => canVote && !hasVoted && setSelectedTarget(SKIP_VOTE_ID)}
          disabled={hasVoted || !canVote}
          className={cn(
            "w-full p-4 rounded-xl border-2 border-dashed transition-all duration-300 flex items-center justify-between mb-24",
            selectedTarget === SKIP_VOTE_ID 
              ? "border-yellow-500 bg-yellow-500/10" 
              : "border-border bg-card/50 hover:border-yellow-500/50",
            (hasVoted || !canVote) && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl">
              ⏭️
            </div>
            <span className="font-medium text-yellow-500">Preskoči glasanje</span>
          </div>
          
          <div className="flex items-center gap-2">
            {voteCounts[SKIP_VOTE_ID] > 0 && (
              <span className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full">
                {voteCounts[SKIP_VOTE_ID]} {voteCounts[SKIP_VOTE_ID] === 1 ? 'glas' : 'glasova'}
              </span>
            )}
            {selectedTarget === SKIP_VOTE_ID && (
              <span className="text-yellow-500 text-xl">✓</span>
            )}
          </div>
        </motion.button>

        {/* Vote button */}
        <AnimatePresence>
          {selectedTarget && !hasVoted && canVote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-4 right-4 flex justify-center"
            >
              <Button 
                variant="mafia" 
                size="xl"
                onClick={handleVote}
                className="w-full max-w-md"
              >
                Glasaj
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {hasVoted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <span className="text-4xl">✅</span>
            <p className="text-muted-foreground mt-2">Glas zabilježen. Čekaj ostale...</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VotingPhase;
