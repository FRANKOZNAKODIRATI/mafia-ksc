import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROLES, RoleType } from '@/types/game';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface RoleSpinnerProps {
  availableRoles: RoleType[];
  mafiaCount: number;
  onComplete: (role: RoleType) => void;
  isSpinning: boolean;
}

const RoleSpinner: React.FC<RoleSpinnerProps> = ({
  availableRoles,
  mafiaCount,
  onComplete,
  isSpinning,
}) => {
  const [currentRole, setCurrentRole] = useState<RoleType>('citizen');
  const [finalRole, setFinalRole] = useState<RoleType | null>(null);
  const [spinSpeed, setSpinSpeed] = useState(50);
  const { sounds } = useSoundEffects();

  useEffect(() => {
    if (!isSpinning) return;

    // Weighted random selection
    const selectRole = (): RoleType => {
      const random = Math.random() * 100;
      
      // Very low chance for mafia (10%)
      if (random < 10 && availableRoles.includes('mafia')) {
        return 'mafia';
      }
      // Low chance for special roles (25%)
      if (random < 35) {
        const specialRoles = availableRoles.filter(r => r !== 'citizen' && r !== 'mafia');
        if (specialRoles.length > 0) {
          return specialRoles[Math.floor(Math.random() * specialRoles.length)];
        }
      }
      // High chance for citizen
      return 'citizen';
    };

    let elapsed = 0;
    const duration = 3000;
    const interval = setInterval(() => {
      elapsed += spinSpeed;
      
      // Cycle through roles for visual effect
      const allRoles = Object.keys(ROLES) as RoleType[];
      setCurrentRole(allRoles[Math.floor(Math.random() * allRoles.length)]);
      
      // Slow down over time
      if (elapsed > duration * 0.6) {
        setSpinSpeed(prev => Math.min(prev + 20, 300));
      }
      
      if (elapsed >= duration) {
        clearInterval(interval);
        const selected = selectRole();
        setFinalRole(selected);
        setCurrentRole(selected);
        sounds.playRoleReveal();
        onComplete(selected);
      } else {
        // Play tick sound during spinning
        sounds.playTick();
      }
    }, spinSpeed);

    return () => clearInterval(interval);
  }, [isSpinning, availableRoles, mafiaCount, onComplete]);

  const displayRole = finalRole || currentRole;
  const role = ROLES[displayRole];

  return (
    <div className="relative flex flex-col items-center">
      {/* Spinner wheel background */}
      <div className="relative w-64 h-64 mb-8">
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, 
              hsl(var(--mafia-red)), 
              hsl(var(--citizen-blue)), 
              hsl(var(--doctor-green)), 
              hsl(var(--detective-purple)), 
              hsl(var(--dame-pink)), 
              hsl(var(--mafia-red)))`,
          }}
          animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
          transition={isSpinning ? { 
            duration: 0.5, 
            repeat: Infinity, 
            ease: "linear" 
          } : { duration: 0.5 }}
        />
        
        {/* Inner dark circle */}
        <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayRole}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex flex-col items-center"
            >
              <span className="text-6xl mb-2">{role.icon}</span>
              <span 
                className="font-display text-2xl tracking-wider"
                style={{ color: role.color }}
              >
                {role.nameCro}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-accent" 
               style={{ borderTopWidth: '16px' }} />
        </div>
      </div>

      {/* Role description */}
      <AnimatePresence>
        {finalRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <p className="text-muted-foreground">{role.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSpinner;
