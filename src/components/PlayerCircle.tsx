import React from 'react';
import { motion } from 'framer-motion';
import { Player, ROLES } from '@/types/game';
import { cn } from '@/lib/utils';

interface PlayerCircleProps {
  players: Player[];
  currentPlayerId?: string;
  showRoles?: boolean;
  onPlayerClick?: (playerId: string) => void;
  selectablePlayerIds?: string[];
  selectedPlayerId?: string;
}

const PlayerCircle: React.FC<PlayerCircleProps> = ({
  players,
  currentPlayerId,
  showRoles = false,
  onPlayerClick,
  selectablePlayerIds = [],
  selectedPlayerId,
}) => {
  const radius = Math.min(140, 100 + players.length * 10);
  
  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      {/* Center decoration */}
      <div className="absolute w-24 h-24 rounded-full bg-card border-2 border-border flex items-center justify-center">
        <span className="font-display text-3xl text-primary">🎭</span>
      </div>
      
      {players.map((player, index) => {
        const angle = (index / players.length) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const isSelectable = selectablePlayerIds.includes(player.id);
        const isSelected = selectedPlayerId === player.id;
        const isCurrentPlayer = player.id === currentPlayerId;
        const role = player.role ? ROLES[player.role] : null;
        
        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <button
              onClick={() => isSelectable && onPlayerClick?.(player.id)}
              disabled={!isSelectable}
              className={cn(
                "relative flex flex-col items-center transition-all duration-300",
                isSelectable && "cursor-pointer hover:scale-110",
                !isSelectable && !isSelected && "cursor-default",
                !player.isAlive && "opacity-40"
              )}
            >
              {/* Player avatar */}
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-300",
                  isCurrentPlayer ? "border-accent" : "border-border",
                  isSelected && "border-primary ring-4 ring-primary/30",
                  isSelectable && "hover:border-primary",
                  !player.isAlive && "bg-red-500/30 border-red-500"
                )}
                style={{
                  backgroundColor: !player.isAlive 
                    ? undefined 
                    : (showRoles && role ? role.color + '33' : 'hsl(var(--card))'),
                  borderColor: !player.isAlive 
                    ? undefined 
                    : (isSelected ? role?.color : undefined),
                }}
              >
                {showRoles && role ? (
                  <span>{role.icon}</span>
                ) : (
                  <span>👤</span>
                )}
              </div>
              
              {/* Username */}
              <span className={cn(
                "mt-1 text-xs font-medium max-w-16 truncate",
                isCurrentPlayer && "text-accent",
                player.isMuted && "line-through text-muted-foreground"
              )}>
                {player.username}
                {player.isHost && " 👑"}
              </span>
              
              {/* Dead indicator */}
              {!player.isAlive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">💀</span>
                </div>
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlayerCircle;
