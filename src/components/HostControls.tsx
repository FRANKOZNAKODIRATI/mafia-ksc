import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Play, Vote, Sun, Moon, SkipForward } from 'lucide-react';
import { RoleType, ROLES } from '@/types/game';

interface HostControlsProps {
  phase: string;
  currentTurn: RoleType | null;
  onStartVoting: () => void;
  onEndVoting: () => void;
  onNextTurn: () => void;
  onStartNight: () => void;
  votingStarted: boolean;
}

const HostControls: React.FC<HostControlsProps> = ({
  phase,
  currentTurn,
  onStartVoting,
  onEndVoting,
  onNextTurn,
  onStartNight,
  votingStarted,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 z-50"
    >
      <div className="max-w-md mx-auto bg-card/95 backdrop-blur-sm border border-primary/50 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">👑</span>
          <span className="font-display text-sm text-primary">Kontrole Domaćina</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {phase === 'night' && currentTurn && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextTurn}
                className="flex-1"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Sljedeća Uloga
              </Button>
              <div className="w-full text-center text-xs text-muted-foreground mt-1">
                Trenutno: {ROLES[currentTurn]?.nameCro || currentTurn}
              </div>
            </>
          )}

          {phase === 'day' && !votingStarted && (
            <Button
              variant="mafia"
              size="sm"
              onClick={onStartVoting}
              className="flex-1"
            >
              <Vote className="w-4 h-4 mr-2" />
              Započni Glasanje
            </Button>
          )}

          {phase === 'voting' && votingStarted && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEndVoting}
              className="flex-1"
            >
              <Vote className="w-4 h-4 mr-2" />
              Završi Glasanje
            </Button>
          )}

          {phase === 'day' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartNight}
              className="flex-1"
            >
              <Moon className="w-4 h-4 mr-2" />
              Započni Noć
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HostControls;
