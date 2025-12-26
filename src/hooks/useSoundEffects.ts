import { useCallback, useRef, useState, useEffect } from 'react';

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

// Background music URLs (longer ambient tracks)
const MUSIC = {
  night: 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3', // Dark suspense
  day: 'https://assets.mixkit.co/active_storage/sfx/2514/2514-preview.mp3', // Peaceful ambient
};

type SoundType = keyof typeof SOUNDS;
type MusicType = keyof typeof MUSIC;

// Global mute state to persist across hook instances
let globalMuted = false;

export const useSoundEffects = () => {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const musicRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [isMuted, setIsMutedState] = useState(globalMuted);
  const currentMusic = useRef<MusicType | null>(null);

  const preloadSound = useCallback((type: SoundType) => {
    if (!audioRefs.current.has(type)) {
      const audio = new Audio(SOUNDS[type]);
      audio.preload = 'auto';
      audio.volume = 0.5;
      audioRefs.current.set(type, audio);
    }
  }, []);

  const preloadMusic = useCallback((type: MusicType) => {
    if (!musicRefs.current.has(type)) {
      const audio = new Audio(MUSIC[type]);
      audio.preload = 'auto';
      audio.volume = 0.2;
      audio.loop = true;
      musicRefs.current.set(type, audio);
    }
  }, []);

  const playSound = useCallback((type: SoundType, volume: number = 0.5) => {
    if (globalMuted) return;

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
        console.log('Sound play blocked:', err);
      });
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  }, []);

  const playMusic = useCallback((type: MusicType) => {
    if (globalMuted) return;

    // Stop current music if different
    if (currentMusic.current && currentMusic.current !== type) {
      const oldMusic = musicRefs.current.get(currentMusic.current);
      if (oldMusic) {
        oldMusic.pause();
        oldMusic.currentTime = 0;
      }
    }

    try {
      let audio = musicRefs.current.get(type);
      
      if (!audio) {
        audio = new Audio(MUSIC[type]);
        audio.preload = 'auto';
        audio.loop = true;
        musicRefs.current.set(type, audio);
      }
      
      audio.volume = 0.15;
      currentMusic.current = type;
      audio.play().catch(err => {
        console.log('Music play blocked:', err);
      });
    } catch (err) {
      console.error('Error playing music:', err);
    }
  }, []);

  const stopMusic = useCallback(() => {
    musicRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    currentMusic.current = null;
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
    musicRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    currentMusic.current = null;
  }, []);

  const toggleMute = useCallback(() => {
    globalMuted = !globalMuted;
    setIsMutedState(globalMuted);
    if (globalMuted) {
      stopAllSounds();
    }
  }, [stopAllSounds]);

  const setMuted = useCallback((muted: boolean) => {
    globalMuted = muted;
    setIsMutedState(muted);
    if (muted) {
      stopAllSounds();
    }
  }, [stopAllSounds]);

  // Preload all sounds and music
  const preloadAll = useCallback(() => {
    Object.keys(SOUNDS).forEach(key => {
      preloadSound(key as SoundType);
    });
    Object.keys(MUSIC).forEach(key => {
      preloadMusic(key as MusicType);
    });
  }, [preloadSound, preloadMusic]);

  return {
    playSound,
    stopSound,
    stopAllSounds,
    setMuted,
    toggleMute,
    isMuted,
    preloadAll,
    playMusic,
    stopMusic,
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
    },
    music: {
      playNightMusic: () => playMusic('night'),
      playDayMusic: () => playMusic('day'),
      stop: stopMusic,
    }
  };
};
