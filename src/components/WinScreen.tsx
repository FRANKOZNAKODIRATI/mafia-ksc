import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface WinScreenProps {
  winner: 'mafia' | 'citizens';
  onPlayAgain: () => void;
  onExit: () => void;
}

const WinScreen: React.FC<WinScreenProps> = ({
  winner,
  onPlayAgain,
  onExit,
}) => {
  const { sounds } = useSoundEffects();

  useEffect(() => {
    if (winner === 'mafia') {
      sounds.playMafiaWin();
    } else {
      sounds.playCitizenWin();
    }
  }, [winner, sounds]);

  const isMafia = winner === 'mafia';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isMafia 
          ? 'linear-gradient(to bottom, hsl(0 70% 10%), hsl(0 50% 5%))'
          : 'linear-gradient(to bottom, hsl(200 70% 20%), hsl(200 50% 10%))'
      }}
    >
      {/* Confetti / particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              backgroundColor: isMafia 
                ? `hsl(0 ${60 + Math.random() * 40}% ${50 + Math.random() * 30}%)`
                : `hsl(${180 + Math.random() * 60} ${60 + Math.random() * 40}% ${50 + Math.random() * 30}%)`
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, (Math.random() - 0.5) * 200],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15,
            delay: 0.2 
          }}
          className="text-[120px] mb-8"
        >
          {isMafia ? '🔫' : '🏆'}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display text-5xl md:text-7xl mb-4"
          style={{ 
            color: isMafia ? 'hsl(0 80% 60%)' : 'hsl(200 80% 60%)',
            textShadow: isMafia 
              ? '0 0 40px hsl(0 80% 50% / 0.5)'
              : '0 0 40px hsl(200 80% 50% / 0.5)'
          }}
        >
          {isMafia ? 'Mafija je Pobijedila!' : 'Građani su Pobijedili!'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-foreground/70 text-xl mb-12"
        >
          {isMafia 
            ? 'Grad je pao pod kontrolu mafije...' 
            : 'Pravda je pobijedila i mafija je poražena!'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="mafia"
            size="xl"
            onClick={onPlayAgain}
          >
            Igraj Ponovo
          </Button>
          <Button
            variant="outline"
            size="xl"
            onClick={onExit}
          >
            Izlaz
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WinScreen;
