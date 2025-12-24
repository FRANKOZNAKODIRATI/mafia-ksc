import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, RoleType, ROLES } from '@/types/game';
import PlayerCircle from './PlayerCircle';
import { Button } from './ui/button';

interface NightPhaseProps {
  players: Player[];
  currentPlayer: Player;
  currentTurn: RoleType;
  onAction: (targetId: string) => void;
  mafiaVotes?: Record<string, string>;
  isHost?: boolean;
}

const NightPhase: React.FC<NightPhaseProps> = ({
  players,
  currentPlayer,
  currentTurn,
  onAction,
  mafiaVotes = {},
  isHost = false,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [showingSleep, setShowingSleep] = useState(true);
  const [hasActed, setHasActed] = useState(false);
  
  const isMyTurn = currentPlayer.role === currentTurn || 
    (currentTurn === 'mafia' && currentPlayer.role === 'dame');
  
  const currentRole = ROLES[currentTurn];
  
  useEffect(() => {
    if (isMyTurn) {
      const timer = setTimeout(() => setShowingSleep(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isMyTurn, currentTurn]);

  // Reset hasActed when turn changes
  useEffect(() => {
    setHasActed(false);
    setSelectedTarget(null);
    setShowingSleep(true);
  }, [currentTurn]);

  // Exclude host from being targeted
  const selectablePlayers = players.filter(p => 
    p.isAlive && p.id !== currentPlayer.id && !p.isHost
  );

  const handleConfirm = () => {
    if (selectedTarget && !hasActed) {
      onAction(selectedTarget);
      setHasActed(true);
      setSelectedTarget(null);
    }
  };

  // Host sees narrator view
  if (isHost) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-[hsl(var(--night-overlay))] flex flex-col items-center justify-center z-40 p-4"
      >
        <div className="max-w-2xl w-full text-center">
          <span className="text-6xl mb-4 block">{currentRole?.icon || '🌙'}</span>
          <h1 
            className="font-display text-4xl mb-2"
            style={{ color: currentRole?.color || 'hsl(var(--primary))' }}
          >
            {currentRole?.nameCro || currentTurn} se budi
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Čekaj da {currentRole?.nameCro || currentTurn} završi svoj potez...
          </p>
          
          <div className="bg-card/50 rounded-xl p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Kao domaćin, možeš preskočiti na sljedeću ulogu pomoću kontrola dolje.
            </p>
          </div>
        </div>
        
        {/* Stars animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-foreground/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Sleeping screen for non-active players
  if (!isMyTurn) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-[hsl(var(--night-overlay))] flex flex-col items-center justify-center z-50"
      >
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-center"
        >
          <span className="text-8xl mb-8 block">🌙</span>
          <h1 className="font-display text-5xl text-foreground/80 mb-4">
            Grad Spava
          </h1>
          <p className="text-muted-foreground text-lg">
            Zatvori oči i čekaj svoj red...
          </p>
        </motion.div>
        
        {/* Stars animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-foreground/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Wake up transition
  if (showingSleep) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        onAnimationComplete={() => setShowingSleep(false)}
        className="fixed inset-0 bg-[hsl(var(--night-overlay))] flex flex-col items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <h1 
            className="font-display text-5xl mb-4"
            style={{ color: currentRole.color }}
          >
            {currentRole.nameCro} se budi
          </h1>
          <span className="text-8xl">{currentRole.icon}</span>
        </motion.div>
      </motion.div>
    );
  }

  // Show confirmation if already acted
  if (hasActed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4"
      >
        <div className="text-center">
          <span className="text-6xl mb-4 block">✅</span>
          <h1 className="font-display text-3xl mb-2 text-foreground">
            Potez zabilježen
          </h1>
          <p className="text-muted-foreground">
            Čekaj ostale igrače...
          </p>
        </div>
      </motion.div>
    );
  }

  // Active role screen
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4"
    >
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">{currentRole.icon}</span>
          <h1 
            className="font-display text-4xl mb-2"
            style={{ color: currentRole.color }}
          >
            {currentRole.nameCro}
          </h1>
          <p className="text-muted-foreground">
            {currentTurn === 'mafia' && 'Odaberi koga želiš eliminirati'}
            {currentTurn === 'doctor' && 'Odaberi koga želiš zaštititi'}
            {currentTurn === 'detective' && 'Odaberi čiju ulogu želiš vidjeti'}
            {currentTurn === 'dame' && 'Odaberi koga želiš utišati'}
          </p>
        </div>

        <PlayerCircle
          players={players.filter(p => !p.isHost)}
          currentPlayerId={currentPlayer.id}
          onPlayerClick={setSelectedTarget}
          selectablePlayerIds={selectablePlayers.map(p => p.id)}
          selectedPlayerId={selectedTarget || undefined}
        />

        <AnimatePresence>
          {selectedTarget && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-center mt-8"
            >
              <Button 
                variant="mafia" 
                size="xl"
                onClick={handleConfirm}
              >
                Potvrdi
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show other mafia votes if current player is mafia */}
        {currentTurn === 'mafia' && Object.keys(mafiaVotes).length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Glasovi mafije:</p>
            <div className="flex justify-center gap-2">
              {Object.entries(mafiaVotes).map(([mafiaId, targetId]) => {
                const mafia = players.find(p => p.id === mafiaId);
                const target = players.find(p => p.id === targetId);
                return (
                  <span key={mafiaId} className="text-sm bg-card px-3 py-1 rounded-full">
                    {mafia?.username} → {target?.username}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NightPhase;
