import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROLES, RoleType, Player } from '@/types/game';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import PlayerCircle from '@/components/PlayerCircle';
import NightPhase from '@/components/NightPhase';
import VotingPhase from '@/components/VotingPhase';

const tutorialSteps = [
  {
    id: 'intro',
    title: 'Dobrodošao u Mafiju!',
    icon: '🎭',
    content: 'Mafia je društvena igra u kojoj građani pokušavaju pronaći skrivene ubojice među sobom. Igra se odvija u ciklusima noći i dana.',
  },
  {
    id: 'roles-citizen',
    title: 'Građanin',
    icon: '👤',
    role: 'citizen' as RoleType,
    content: 'Građani su većina igrača. Nemaju posebne moći, ali mogu glasati tijekom dana kako bi eliminirali sumnjive igrače.',
  },
  {
    id: 'roles-mafia',
    title: 'Mafija',
    icon: '🔫',
    role: 'mafia' as RoleType,
    content: 'Mafija se budi noću i zajedno odlučuju koga će eliminirati. Njihov cilj je ostati neprimijećeni i eliminirati sve građane.',
  },
  {
    id: 'roles-doctor',
    title: 'Doktor',
    icon: '💉',
    role: 'doctor' as RoleType,
    content: 'Doktor se budi noću i odabire jednog igrača za zaštitu. Ako mafija pokuša eliminirati tog igrača, on će preživjeti!',
  },
  {
    id: 'roles-detective',
    title: 'Drot (Detektiv)',
    icon: '🔍',
    role: 'detective' as RoleType,
    content: 'Drot se budi noću i može provjeriti ulogu jednog igrača. Ova informacija mu pomaže voditi građane tijekom glasanja.',
  },
  {
    id: 'roles-dame',
    title: 'Dama',
    icon: '💋',
    role: 'dame' as RoleType,
    content: 'Dama se budi zajedno s mafijom. Može utišati jednog igrača koji sljedeći dan ne smije glasati. Ako sva mafija bude eliminirana, Dama postaje nova mafija!',
  },
  {
    id: 'night',
    title: 'Noćna Faza',
    icon: '🌙',
    content: 'Tijekom noći svi "spavaju" - ekran im je crn. Uloge se bude jedna po jedna i izvršavaju svoje akcije.',
  },
  {
    id: 'day',
    title: 'Dnevna Faza',
    icon: '☀️',
    content: 'Ujutro se svi bude i saznaju tko je (ako je netko) eliminiran tijekom noći. Tada počinje rasprava i glasanje.',
  },
  {
    id: 'voting',
    title: 'Glasanje',
    icon: '⚖️',
    content: 'Igrači glasaju za osobu koju smatraju mafijom. Osoba s najviše glasova biva eliminirana. Budi oprezan - možda glasaš za nevinog!',
  },
  {
    id: 'win',
    title: 'Pobjeda',
    icon: '🏆',
    content: 'Građani pobjeđuju kad eliminiraju svu mafiju. Mafija pobjeđuje kad njihov broj bude jednak ili veći od broja preostalih građana.',
  },
];

const Tutorial = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTestGame, setShowTestGame] = useState(false);
  const [testPhase, setTestPhase] = useState<'night' | 'voting'>('night');
  const [testRole, setTestRole] = useState<RoleType>('mafia');
  
  const step = tutorialSteps[currentStep];
  const role = step.role ? ROLES[step.role] : null;

  const testPlayers: Player[] = [
    { id: '1', username: 'Ti', role: testRole, isAlive: true, isMuted: false, isHost: false },
    { id: '2', username: 'Ana', role: 'citizen', isAlive: true, isMuted: false, isHost: false },
    { id: '3', username: 'Marko', role: 'doctor', isAlive: true, isMuted: false, isHost: false },
    { id: '4', username: 'Petra', role: 'detective', isAlive: true, isMuted: false, isHost: false },
    { id: '5', username: 'Ivan', role: 'citizen', isAlive: true, isMuted: false, isHost: false },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTestGame = (role: RoleType) => {
    setTestRole(role);
    setTestPhase('night');
    setShowTestGame(true);
  };

  if (showTestGame) {
    return (
      <div className="min-h-screen bg-background">
        {/* Exit button */}
        <button
          onClick={() => setShowTestGame(false)}
          className="fixed top-4 left-4 z-[100] flex items-center gap-2 text-muted-foreground hover:text-foreground bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Izađi iz Testa
        </button>

        {/* Phase toggle */}
        <div className="fixed top-4 right-4 z-[100] flex gap-2">
          <Button
            variant={testPhase === 'night' ? 'mafia' : 'outline'}
            size="sm"
            onClick={() => setTestPhase('night')}
          >
            🌙 Noć
          </Button>
          <Button
            variant={testPhase === 'voting' ? 'mafia' : 'outline'}
            size="sm"
            onClick={() => setTestPhase('voting')}
          >
            ⚖️ Glasanje
          </Button>
        </div>

        {testPhase === 'night' ? (
          <NightPhase
            players={testPlayers}
            currentPlayer={testPlayers[0]}
            currentTurn={testRole}
            onAction={(targetId) => {
              console.log('Action on:', targetId);
            }}
          />
        ) : (
          <VotingPhase
            players={testPlayers}
            currentPlayer={testPlayers[0]}
            votes={{}}
            onVote={(targetId) => {
              console.log('Voted for:', targetId);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Natrag
      </motion.button>

      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {tutorialSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= currentStep ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
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
              {step.icon}
            </motion.span>

            <h1 
              className="font-display text-4xl mb-4"
              style={{ color: role?.color || 'hsl(var(--foreground))' }}
            >
              {step.title}
            </h1>

            <div className="glass-card p-6 mb-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {step.content}
              </p>
            </div>

            {/* Test button for roles */}
            {role && (
              <Button
                variant="glass"
                size="lg"
                onClick={() => startTestGame(step.role!)}
                className="mb-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Testiraj ulogu {role.nameCro}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Prethodno
          </Button>

          {currentStep === tutorialSteps.length - 1 ? (
            <Button variant="mafia" onClick={() => navigate('/')}>
              Započni Igru!
            </Button>
          ) : (
            <Button variant="mafia" onClick={nextStep}>
              Sljedeće
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Quick role test buttons */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-center text-muted-foreground mb-4">
            Brzi test uloga:
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {(['mafia', 'doctor', 'detective', 'dame'] as RoleType[]).map(roleId => {
              const r = ROLES[roleId];
              return (
                <Button
                  key={roleId}
                  variant="outline"
                  size="sm"
                  onClick={() => startTestGame(roleId)}
                  style={{ borderColor: r.color, color: r.color }}
                >
                  {r.icon} {r.nameCro}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
