import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROLES, RoleType } from '@/types/game';
import { ArrowLeft, Plus, Minus, Check, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '@/hooks/useGame';

const CreateGame = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'settings' | 'username' | 'code'>('settings');
  const [mafiaCount, setMafiaCount] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);
  const [username, setUsername] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { createGame } = useGame(null);

  const specialRoles: RoleType[] = ['doctor', 'detective', 'dame'];

  const toggleRole = (role: RoleType) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleGenerateCode = async () => {
    setIsCreating(true);
    try {
      const code = await createGame(username, mafiaCount, selectedRoles);
      setGameCode(code);
      setStep('code');
      toast.success('Igra stvorena!');
    } catch (err: any) {
      toast.error('Greška pri stvaranju igre');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(gameCode);
    toast.success('Kod kopiran!');
  };

  const enterLobby = () => {
    navigate(`/lobby/${gameCode}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => step === 'settings' ? navigate('/') : setStep('settings')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Natrag
      </motion.button>

      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Game Settings */}
          {step === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="font-display text-4xl text-primary text-center mb-8">
                Postavke Igre
              </h1>

              {/* Mafia count */}
              <div className="glass-card p-6 mb-6">
                <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                  <span>🔫</span> Broj Mafije
                </h3>
                <div className="flex items-center justify-center gap-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMafiaCount(Math.max(1, mafiaCount - 1))}
                    disabled={mafiaCount <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-display text-5xl text-primary w-16 text-center">
                    {mafiaCount}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMafiaCount(Math.min(5, mafiaCount + 1))}
                    disabled={mafiaCount >= 5}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Preporučeno: 1 mafija na 4-5 igrača
                </p>
              </div>

              {/* Special roles */}
              <div className="glass-card p-6 mb-8">
                <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                  <span>✨</span> Specijalne Uloge
                </h3>
                <div className="space-y-3">
                  {specialRoles.map(roleId => {
                    const role = ROLES[roleId];
                    const isSelected = selectedRoles.includes(roleId);
                    
                    return (
                      <button
                        key={roleId}
                        onClick={() => toggleRole(roleId)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                          isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border bg-card hover:border-primary/50'
                        }`}
                      >
                        <span className="text-3xl">{role.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-semibold" style={{ color: role.color }}>
                            {role.nameCro}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                variant="mafia"
                size="xl"
                onClick={() => setStep('username')}
                className="w-full"
              >
                Dalje
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
                onClick={handleGenerateCode}
                disabled={username.trim().length < 2 || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Stvaranje...
                  </>
                ) : (
                  'Generiraj Kod'
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 3: Game Code */}
          {step === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mb-8"
              >
                <span className="text-7xl">🎲</span>
              </motion.div>

              <h1 className="font-display text-3xl text-foreground mb-2">
                Kod Igre
              </h1>
              <p className="text-muted-foreground mb-6">
                Podijeli ovaj kod s prijateljima
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-8 mb-8"
              >
                <div className="flex items-center justify-center gap-4">
                  <span className="font-display text-5xl tracking-[0.3em] text-accent text-glow-gold">
                    {gameCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              <Button
                variant="mafia"
                size="xl"
                onClick={enterLobby}
                className="w-full"
              >
                Uđi u Čekaonicu
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateGame;
