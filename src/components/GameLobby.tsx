import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Player, RoleType } from '@/types/game';
import PlayerCircle from './PlayerCircle';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

interface GameLobbyProps {
  gameCode: string;
  players: Player[];
  currentPlayer: Player;
  isHost: boolean;
  mafiaCount: number;
  selectedRoles: RoleType[];
  onStartGame: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({
  gameCode,
  players,
  currentPlayer,
  isHost,
  mafiaCount,
  selectedRoles,
  onStartGame,
}) => {
  const copyCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast.success('Kod kopiran!');
  };

  const minPlayers = mafiaCount + selectedRoles.length + 2;
  const canStart = players.length >= minPlayers;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-4 pt-10"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-primary mb-2">Čekaonica</h1>
          
          {/* Game code */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="bg-card border border-border rounded-lg px-4 py-2 flex items-center gap-3">
              <span className="text-muted-foreground text-sm">Kod igre:</span>
              <span className="font-display text-2xl text-accent tracking-widest">{gameCode}</span>
              <button 
                onClick={copyCode}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Players circle */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {players.length} igrača {!canStart && `(min. ${minPlayers})`}
            </span>
          </div>
          
          <PlayerCircle 
            players={players} 
            currentPlayerId={currentPlayer.id}
          />
        </div>

        {/* Game settings display */}
        <div className="glass-card p-4 mb-8">
          <h3 className="font-display text-xl text-foreground mb-3">Postavke igre</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Broj mafije:</span>
              <span className="ml-2 text-primary font-semibold">{mafiaCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Specijalne uloge:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedRoles.length > 0 ? selectedRoles.map(role => (
                  <span key={role} className="bg-secondary px-2 py-0.5 rounded text-xs">
                    {role}
                  </span>
                )) : (
                  <span className="text-muted-foreground">Nema</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Start button (host only) */}
        {isHost ? (
          <div className="text-center">
            <Button
              variant="mafia"
              size="xl"
              onClick={onStartGame}
              disabled={!canStart}
              className="w-full max-w-md"
            >
              {canStart ? 'Započni Igru' : `Čekaj još ${minPlayers - players.length} igrača`}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              Čekaj da domaćin započne igru...
            </p>
          </div>
        )}

        {/* Waiting animation */}
        <motion.div
          className="flex justify-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-primary rounded-full"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameLobby;
