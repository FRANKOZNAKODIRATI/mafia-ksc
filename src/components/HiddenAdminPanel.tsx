import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VALID_PASSWORDS = ['1234', '5678'];

const HiddenAdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSecretClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }
    
    clickTimer.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);

    if (clickCount >= 4) {
      setIsOpen(true);
      setClickCount(0);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(password)) {
      setIsAuthenticated(true);
      toast.success('Pristup odobren');
    } else {
      toast.error('Pogrešna lozinka');
      setPassword('');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsAuthenticated(false);
    setPassword('');
    setName('');
    setText('');
    setImageUrl('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      toast.error('Ime i tekst su obavezni');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        name: name.trim(),
        text: text.trim(),
        image_url: imageUrl.trim() || null,
        rating: 5,
        is_approved: true
      });

      if (error) throw error;

      toast.success('Recenzija dodana!');
      setName('');
      setText('');
      setImageUrl('');
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Greška pri dodavanju recenzije');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hidden trigger area - bottom left corner */}
      <div
        className="fixed bottom-0 left-0 w-12 h-12 z-50 cursor-default"
        onClick={handleSecretClick}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-md relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </Button>

              {!isAuthenticated ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground text-center mb-4">
                    Admin Pristup
                  </h2>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Unesite lozinku (brojevi)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-center text-lg tracking-widest"
                    autoFocus
                  />
                  <Button type="submit" className="w-full">
                    Pristupi
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground text-center mb-4">
                    Dodaj Recenziju
                  </h2>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Ime"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Tekst recenzije..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="URL slike profila (opcionalno)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    {imageUrl && (
                      <div className="flex justify-center">
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          className="w-16 h-16 rounded-full object-cover"
                          onError={() => toast.error('Slika se ne može učitati')}
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Dodavanje...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Dodaj Recenziju
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HiddenAdminPanel;