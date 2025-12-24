import { useCallback, useRef } from 'react';

// Pre-defined sound URLs using free sound effects
const SOUNDS = {
  nightFall: 'https://assets.mixkit.co/active_storage/sfx/2523/2523-preview.mp3', // Creepy ambience
  wakeUp: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Bell chime
  vote: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Click
  elimination: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', // Dramatic hit
  mafiaWin: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Evil laugh
  citizenWin: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3', // Victory fanfare
  roleReveal: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Magic reveal
  transition: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Whoosh
  tick: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Tick
};

type SoundType = keyof typeof SOUNDS;

export const useSoundEffects = () => {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const isMuted = useRef(false);

  const preloadSound = useCallback((type: SoundType) => {
    if (!audioRefs.current.has(type)) {
      const audio = new Audio(SOUNDS[type]);
      audio.preload = 'auto';
      audio.volume = 0.5;
      audioRefs.current.set(type, audio);
    }
  }, []);

  const playSound = useCallback((type: SoundType, volume: number = 0.5) => {
    if (isMuted.current) return;

    try {
      let audio = audioRefs.current.get(type);
      
      if (!audio) {
        audio = new Audio(SOUNDS[type]);
        audio.preload = 'auto';
        audioRefs.current.set(type, audio);
      }
      
      audio.volume = Math.min(1, Math.max(0, volume));
      audio.currentTime = 0;
      audio.play().catch(err => {
        // Auto-play may be blocked by browser
        console.log('Sound play blocked:', err);
      });
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  }, []);

  const stopSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current.get(type);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    audioRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    isMuted.current = muted;
    if (muted) {
      stopAllSounds();
    }
  }, [stopAllSounds]);

  // Preload all sounds
  const preloadAll = useCallback(() => {
    Object.keys(SOUNDS).forEach(key => {
      preloadSound(key as SoundType);
    });
  }, [preloadSound]);

  return {
    playSound,
    stopSound,
    stopAllSounds,
    setMuted,
    preloadAll,
    sounds: {
      playNightFall: () => playSound('nightFall', 0.3),
      playWakeUp: () => playSound('wakeUp', 0.5),
      playVote: () => playSound('vote', 0.4),
      playElimination: () => playSound('elimination', 0.6),
      playMafiaWin: () => playSound('mafiaWin', 0.7),
      playCitizenWin: () => playSound('citizenWin', 0.7),
      playRoleReveal: () => playSound('roleReveal', 0.5),
      playTransition: () => playSound('transition', 0.4),
      playTick: () => playSound('tick', 0.3),
    }
  };
};
