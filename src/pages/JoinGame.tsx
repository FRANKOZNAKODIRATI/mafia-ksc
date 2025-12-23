import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '@/hooks/useGame';

const JoinGame = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'code' | 'username'>('code');
  const [gameCode, setGameCode] = useState('');
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const { checkGameExists, joinGame } = useGame(gameCode.length === 6 ? gameCode : null);

  const handleValidateCode = async () => {
    setIsValidating(true);
    try {
      const exists = await checkGameExists(gameCode);
      if (exists) {
        setStep('username');
      } else {
        toast.error('Igra nije pronađena');
      }
    } catch (err) {
      toast.error('Greška pri provjeri koda');
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await joinGame(username);
      navigate(`/lobby/${gameCode}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Greška pri pridruživanju igri');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => {
          if (step === 'code') navigate('/');
          else setStep('code');
        }}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Natrag
      </motion.button>

      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Enter Code */}
          {step === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <motion.span
                className="text-7xl block mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎫
              </motion.span>
              <h1 className="font-display text-4xl text-primary mb-4">
                Pridruži se Igri
              </h1>
              <p className="text-muted-foreground mb-8">
                Unesi kod koji ti je dao domaćin
              </p>

              <Input
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                className="text-center text-3xl h-16 tracking-[0.3em] font-display mb-8"
                maxLength={6}
              />

              <Button
                variant="mafia"
                size="xl"
                onClick={handleValidateCode}
                disabled={gameCode.length !== 6 || isValidating}
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Provjera...
                  </>
                ) : (
                  'Pridruži se'
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Username */}
          {step === 'username' && (
            <motion.div
              key="username"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h1 className="font-display text-4xl text-primary mb-4">
                Tvoje Ime
              </h1>
              <p className="text-muted-foreground mb-8">
                Kako te drugi igrači trebaju zvati?
              </p>

              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Unesi korisničko ime..."
                className="text-center text-xl h-14 mb-8"
                maxLength={15}
              />

              <Button
                variant="mafia"
                size="xl"
                onClick={handleJoin}
                disabled={username.trim().length < 2 || isJoining}
                className="w-full"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Pridruživanje...
                  </>
                ) : (
                  'Uđi u Igru'
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JoinGame;
