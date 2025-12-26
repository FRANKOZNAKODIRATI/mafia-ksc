import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const SoundToggle: React.FC = () => {
  const { isMuted, toggleMute } = useSoundEffects();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      className="fixed top-4 right-4 z-40 p-3 bg-card/80 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-card transition-colors"
      aria-label={isMuted ? 'Uključi zvuk' : 'Isključi zvuk'}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Volume2 className="w-5 h-5 text-primary" />
      )}
    </motion.button>
  );
};

export default SoundToggle;
