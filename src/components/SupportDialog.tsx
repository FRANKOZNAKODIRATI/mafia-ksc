import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bug, MessageSquare, Instagram, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { toast } from 'sonner';
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
  const [activeTab, setActiveTab] = useState<'bug' | 'contact'>('bug');
  const [bugDescription, setBugDescription] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleBugSubmit = () => {
    if (!bugDescription.trim()) {
      toast.error('Molimo opišite bug');
      return;
    }
    // In a real app, this would send to a backend
    toast.success('Hvala na prijavi buga! Razmotrit ćemo ga.');
    setBugDescription('');
    onClose();
  };

  const handleContactSubmit = () => {
    if (!contactMessage.trim()) {
      toast.error('Molimo unesite poruku');
      return;
    }
    toast.success('Poruka poslana! Hvala vam.');
    setContactMessage('');
    setEmail('');
    onClose();
  };

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
            className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
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
              <h2 className="font-display text-2xl text-foreground">Podrška</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Prijavite bug ili nas kontaktirajte
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('bug')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  activeTab === 'bug'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background/50 text-muted-foreground hover:bg-background'
                }`}
              >
                <Bug className="w-4 h-4" />
                <span>Prijavi Bug</span>
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  activeTab === 'contact'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background/50 text-muted-foreground hover:bg-background'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kontakt</span>
              </button>
            </div>

            {/* Bug Report Tab */}
            {activeTab === 'bug' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Opišite bug koji ste pronašli
                  </label>
                  <Textarea
                    placeholder="Npr. Kada kliknem na dugme, ništa se ne dogodi..."
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    className="min-h-[120px] bg-background/50 border-border/50"
                    maxLength={1000}
                  />
                </div>
                <Button onClick={handleBugSubmit} className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Pošalji Prijavu
                </Button>
              </motion.div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Email (opcionalno)
                  </label>
                  <Input
                    type="email"
                    placeholder="vas@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-border/50"
                    maxLength={255}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Vaša poruka
                  </label>
                  <Textarea
                    placeholder="Napišite vašu poruku..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="min-h-[100px] bg-background/50 border-border/50"
                    maxLength={1000}
                  />
                </div>
                <Button onClick={handleContactSubmit} className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Pošalji Poruku
                </Button>

                {/* Instagram accounts section */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Ili nas kontaktirajte na Instagramu
                  </p>
                  <div className="space-y-2">
                    {instagramAccounts.map((account) => (
                      <a
                        key={account.username}
                        href={`https://instagram.com/${account.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 bg-background/50 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-background transition-all group"
                      >
                        <div className="relative">
                          <img
                            src={account.profilePic}
                            alt={account.displayName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary transition-all"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 rounded-full p-0.5">
                            <Instagram className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {account.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{account.username}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupportDialog;
