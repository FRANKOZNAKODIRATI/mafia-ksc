import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Play, BookOpen, Heart, Star } from 'lucide-react';
import SupportDialog from '@/components/SupportDialog';
import SoundToggle from '@/components/SoundToggle';
import markokofsProfile from '@/assets/markokofs-profile.webp';
import dinomoranjkicProfile from '@/assets/dinomoranjkic-profile.jpg';
import yukitsunodaProfile from '@/assets/yukitsunoda-profile.jpg';

const Index = () => {
  const navigate = useNavigate();
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <SoundToggle />
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating cards decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-10"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + Math.sin(i) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            🎭
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo / Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.span 
            className="text-8xl block mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🎭
          </motion.span>
          <h1 className="font-display text-7xl md:text-8xl text-foreground mb-2">
            <span className="text-primary text-glow">MAFIA</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl tracking-wide">
            Tko je ubojica među vama?
          </p>
        </motion.div>

        {/* Menu buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col gap-4 w-full max-w-md"
        >
          <Button
            variant="mafia"
            size="xl"
            onClick={() => navigate('/create')}
            className="group"
          >
            <Play className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
            Pokreni Igru
          </Button>

          <Button
            variant="glass"
            size="xl"
            onClick={() => navigate('/join')}
            className="group"
          >
            <Users className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
            Pridruži se Igri
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/tutorial')}
            className="mt-4 group"
          >
            <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Tutorial
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowSupport(true)}
            className="group"
          >
            <Heart className="w-5 h-5 mr-2 text-red-500 group-hover:scale-110 transition-transform" />
            Podrška
          </Button>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 w-full max-w-2xl"
        >
          <h2 className="text-center text-muted-foreground text-sm uppercase tracking-widest mb-6">Recenzije</h2>
          <div className="flex flex-col gap-4">
            {[
              {
                name: "MarkoKofs",
                image: markokofsProfile,
                text: "Pa igrica je dobra, a igrica ti je više onak aplikaciski kao board games. Super je! Neznam točno kako se igra kužiš, ali vjerujem da će biti onak fora. Samo trebate nastavit",
                rating: 5
              },
              {
                name: "dinomoranjkic",
                image: dinomoranjkicProfile,
                text: "Odlična igra za ekipu! Preporučujem svima.",
                rating: 5
              },
              {
                name: "yukitsunoda",
                image: yukitsunodaProfile,
                text: "Zabavna i napeta igra, savršena za party!",
                rating: 5
              }
            ].map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.15 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 flex gap-4"
              >
                <img 
                  src={review.image} 
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{review.name}</span>
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{review.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 mb-8 text-muted-foreground text-sm"
        >
          4+ igrača preporučeno
        </motion.p>
      </div>

      <SupportDialog isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
};

export default Index;
