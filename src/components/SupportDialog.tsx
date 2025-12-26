import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Heart } from 'lucide-react';
import yukitsunodaProfile from '@/assets/yukitsunoda-profile.jpg';
import dinomoranjkicProfile from '@/assets/dinomoranjkic-profile.jpg';

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const instagramAccounts = [
  {
    username: '_dinomoranjkic_',
    displayName: 'Dino Moranjkić',
    profilePic: dinomoranjkicProfile,
  },
  {
    username: 'Yukitsunoda_fan',
    displayName: 'Yuki Tsunoda Fan',
    profilePic: yukitsunodaProfile,
  },
];

const SupportDialog: React.FC<SupportDialogProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block mb-2"
              >
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </motion.div>
              <h2 className="font-display text-2xl text-foreground">Podrška</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Pratite nas na Instagramu!
              </p>
            </div>

            {/* Instagram accounts */}
            <div className="space-y-3">
              {instagramAccounts.map((account) => (
                <a
                  key={account.username}
                  href={`https://instagram.com/${account.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 bg-background/50 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-background transition-all group"
                >
                  <div className="relative">
                    <img
                      src={account.profilePic}
                      alt={account.displayName}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 rounded-full p-1">
                      <Instagram className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {account.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{account.username}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              Hvala vam na podršci! 💜
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupportDialog;
