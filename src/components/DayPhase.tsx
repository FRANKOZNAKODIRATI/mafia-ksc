import React from 'react';
import { motion } from 'framer-motion';
import { Player, ROLES } from '@/types/game';
import PlayerCircle from './PlayerCircle';
import { Sun, Users } from 'lucide-react';
import { Button } from './ui/button';

interface DayPhaseProps {
  players: Player[];
  currentPlayer: Player;
  isHost: boolean;
  onStartVoting: () => void;
}

const DayPhase: React.FC<DayPhaseProps> = ({
  players,
  currentPlayer,
  isHost,
  onStartVoting,
}) => {
  const alivePlayers = players.filter(p => p.isAlive);
  const deadPlayers = players.filter(p => !p.isAlive);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-4 pt-10"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sun className="w-16 h-16 text-yellow-500 mx-auto" />
          </motion.div>
          <h1 className="font-display text-4xl text-accent mt-4 mb-2">
            Dan
          </h1>
          <p className="text-muted-foreground">
            Grad se budi... Raspravljajte tko bi mogao biti mafija
          </p>
        </div>

        {/* Player circle */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {alivePlayers.length} živih igrača
            </span>
          </div>
          
          <PlayerCircle 
            players={players} 
            currentPlayerId={currentPlayer.id}
          />
        </div>

        {/* Dead players */}
        {deadPlayers.length > 0 && (
          <div className="glass-card p-4 mb-8">
            <h3 className="font-display text-lg text-muted-foreground mb-3">
              Eliminirani igrači
            </h3>
            <div className="flex flex-wrap gap-2">
              {deadPlayers.map(player => (
                <div 
                  key={player.id}
                  className="bg-secondary/50 px-3 py-1.5 rounded-lg flex items-center gap-2 opacity-60"
                >
                  <span>💀</span>
                  <span className="text-sm">{player.username}</span>
                  {player.role && (
                    <span className="text-xs text-muted-foreground">
                      ({ROLES[player.role]?.nameCro || player.role})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Host info or waiting message */}
        {isHost ? (
          <div className="text-center mb-20">
            <p className="text-muted-foreground mb-4">
              Kao domaćin, možeš započeti glasanje kada igrači završe raspravu
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              Čekaj da domaćin započne glasanje...
            </p>
          </div>
        )}

        {/* Current player role reminder (if not host) */}
        {!currentPlayer.isHost && currentPlayer.role && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <span className="text-xl">{ROLES[currentPlayer.role]?.icon}</span>
            <span className="text-sm text-muted-foreground">
              Ti si: <span className="text-foreground font-medium">{ROLES[currentPlayer.role]?.nameCro}</span>
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DayPhase;
