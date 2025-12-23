import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import RoleSpinner from '@/components/RoleSpinner';
import { RoleType, ROLES } from '@/types/game';

const JoinGame = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'code' | 'username' | 'spinning' | 'result'>('code');
  const [gameCode, setGameCode] = useState('');
  const [username, setUsername] = useState('');
  const [assignedRole, setAssignedRole] = useState<RoleType | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleJoin = () => {
    // In a real app, validate the code with backend
    setStep('username');
  };

  const handleUsernameSubmit = () => {
    setStep('spinning');
    setTimeout(() => setIsSpinning(true), 500);
  };

  const handleSpinComplete = (role: RoleType) => {
    setAssignedRole(role);
    setStep('result');
  };

  const enterLobby = () => {
    navigate('/lobby', {
      state: {
        gameCode,
        username,
        role: assignedRole,
        isHost: false,
      },
    });
  };

  const role = assignedRole ? ROLES[assignedRole] : null;

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => {
          if (step === 'code') navigate('/');
          else if (step === 'username') setStep('code');
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
                onClick={handleJoin}
                disabled={gameCode.length !== 6}
                className="w-full"
              >
                Pridruži se
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
                onClick={handleUsernameSubmit}
                disabled={username.trim().length < 2}
                className="w-full"
              >
                Zavrti Kotač!
              </Button>
            </motion.div>
          )}

          {/* Step 3: Spinning */}
          {step === 'spinning' && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center pt-12"
            >
              <h1 className="font-display text-3xl text-foreground mb-8">
                Tvoja Sudbina...
              </h1>
              
              <RoleSpinner
                availableRoles={['citizen', 'mafia', 'doctor', 'detective', 'dame']}
                mafiaCount={1}
                onComplete={handleSpinComplete}
                isSpinning={isSpinning}
              />
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 'result' && role && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center pt-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <span className="text-8xl block mb-6">{role.icon}</span>
              </motion.div>
              
              <h1 
                className="font-display text-5xl mb-4"
                style={{ color: role.color }}
              >
                {role.nameCro}
              </h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 mb-8"
              >
                <p className="text-muted-foreground">{role.description}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-sm text-muted-foreground mb-4">
                  🤫 Drži svoju ulogu u tajnosti!
                </p>
                <Button
                  variant="mafia"
                  size="xl"
                  onClick={enterLobby}
                  className="w-full"
                >
                  Uđi u Igru
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JoinGame;
