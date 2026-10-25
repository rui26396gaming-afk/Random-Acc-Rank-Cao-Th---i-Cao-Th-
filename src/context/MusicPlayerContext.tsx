import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  size?: number; // bytes
  duration?: number; // seconds
  type?: string;
  addedAt: Date;
  isPreset?: boolean;
}

export type LoopMode = 'off' | 'all' | 'one';

interface MusicPlayerContextType {
  playlist: AudioTrack[];
  currentTrackIndex: number;
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  loopMode: LoopMode;
  isShuffled: boolean;
  isExpanded: boolean;
  
  // Actions
  addFiles: (files: FileList | File[], autoPlay?: boolean) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (timeInSeconds: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
  setSpeed: (rate: number) => void;
  toggleLoopMode: () => void;
  toggleShuffle: () => void;
  removeTrack: (id: string) => void;
  clearPlaylist: () => void;
  setIsExpanded: (expanded: boolean) => void;
  loadSampleTracks: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// Sample preset audio tracks using reliable public royalty-free ambient and synthesized audio
const PRESET_TRACKS: AudioTrack[] = [
  {
    id: 'preset-lofi-chill',
    name: 'Coffee Shop Lofi Chillout Beat (Study & Focus)',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    size: 2450000,
    duration: 145,
    isPreset: true,
    addedAt: new Date(),
  },
  {
    id: 'preset-ambient-space',
    name: 'Deep Focus Ambient Atmosphere (Zero Distraction)',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    size: 3100000,
    duration: 180,
    isPreset: true,
    addedAt: new Date(),
  },
  {
    id: 'preset-synth-night',
    name: 'Synthwave Night Drive (Cyber Flow State)',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3',
    size: 2800000,
    duration: 160,
    isPreset: true,
    addedAt: new Date(),
  },
];

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [loopMode, setLoopMode] = useState<LoopMode>('all');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onError = (e: any) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const currentTrack = currentTrackIndex >= 0 && currentTrackIndex < playlist.length 
    ? playlist[currentTrackIndex] 
    : null;

  // Handle track end according to loop and shuffle settings
  const handleTrackEnded = useCallback(() => {
    if (playlist.length === 0) return;

    if (loopMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.warn);
      }
      return;
    }

    if (isShuffled && playlist.length > 1) {
      let randomIndex = Math.floor(Math.random() * playlist.length);
      while (randomIndex === currentTrackIndex && playlist.length > 1) {
        randomIndex = Math.floor(Math.random() * playlist.length);
      }
      playTrack(randomIndex);
      return;
    }

    if (currentTrackIndex + 1 < playlist.length) {
      playTrack(currentTrackIndex + 1);
    } else if (loopMode === 'all') {
      playTrack(0);
    } else {
      setIsPlaying(false);
    }
  }, [playlist, currentTrackIndex, loopMode, isShuffled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('ended', handleTrackEnded);
    return () => {
      audio.removeEventListener('ended', handleTrackEnded);
    };
  }, [handleTrackEnded]);

  // Update volume & playback rate on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Play a specific track index
  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= playlist.length) return;
    const track = playlist[index];
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTrackIndex(index);
    audio.src = track.url;
    audio.playbackRate = playbackRate;
    audio.volume = isMuted ? 0 : volume;

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.warn('Autoplay prevented or failed:', err);
    });
  }, [playlist, playbackRate, isMuted, volume]);

  // Add files to playlist with immediate auto-play
  const addFiles = useCallback((files: FileList | File[], autoPlay: boolean = true) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name));
    
    if (fileArray.length === 0) {
      return;
    }

    const newTracks: AudioTrack[] = fileArray.map((file) => {
      const url = URL.createObjectURL(file);
      // Clean filename for title
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      return {
        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: cleanName,
        url,
        size: file.size,
        type: file.type,
        addedAt: new Date(),
        isPreset: false,
      };
    });

    setPlaylist((prevPlaylist) => {
      const startIndex = prevPlaylist.length;
      const updated = [...prevPlaylist, ...newTracks];

      // Auto play immediately if requested
      if (autoPlay && newTracks.length > 0) {
        setTimeout(() => {
          const audio = audioRef.current;
          if (audio) {
            setCurrentTrackIndex(startIndex);
            audio.src = newTracks[0].url;
            audio.playbackRate = playbackRate;
            audio.volume = isMuted ? 0 : volume;
            audio.play().then(() => {
              setIsPlaying(true);
            }).catch((err) => {
              console.warn('Playback error on added file:', err);
            });
          }
        }, 50);
      }

      return updated;
    });
  }, [playbackRate, isMuted, volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (currentTrackIndex === -1 && playlist.length > 0) {
        playTrack(0);
      } else if (audio.src) {
        audio.play().then(() => setIsPlaying(true)).catch(console.warn);
      } else if (playlist.length > 0) {
        playTrack(0);
      }
    }
  }, [isPlaying, currentTrackIndex, playlist, playTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    } else if (playlist.length > 0) {
      playTrack(currentTrackIndex >= 0 ? currentTrackIndex : 0);
    }
  }, [playlist, currentTrackIndex, playTrack]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    if (isShuffled && playlist.length > 1) {
      let nextIdx = Math.floor(Math.random() * playlist.length);
      while (nextIdx === currentTrackIndex && playlist.length > 1) {
        nextIdx = Math.floor(Math.random() * playlist.length);
      }
      playTrack(nextIdx);
    } else {
      const nextIdx = (currentTrackIndex + 1) % playlist.length;
      playTrack(nextIdx);
    }
  }, [playlist, currentTrackIndex, isShuffled, playTrack]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    const audio = audioRef.current;
    // If more than 3 seconds in, restart track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prevIdx);
  }, [playlist, currentTrackIndex, playTrack]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current && Number.isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolumeLevel = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
  }, []);

  const toggleLoopMode = useCallback(() => {
    setLoopMode((prev) => {
      if (prev === 'all') return 'one';
      if (prev === 'one') return 'off';
      return 'all';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const removeTrack = useCallback((id: string) => {
    setPlaylist((prev) => {
      const removeIndex = prev.findIndex((t) => t.id === id);
      if (removeIndex === -1) return prev;

      const trackToRemove = prev[removeIndex];
      // Revoke blob URL if not preset
      if (!trackToRemove.isPreset && trackToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(trackToRemove.url);
      }

      const updated = prev.filter((t) => t.id !== id);

      // If removed current playing track
      if (removeIndex === currentTrackIndex) {
        if (updated.length === 0) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
          }
          setCurrentTrackIndex(-1);
          setIsPlaying(false);
        } else {
          const nextIdx = removeIndex >= updated.length ? 0 : removeIndex;
          setTimeout(() => playTrack(nextIdx), 50);
        }
      } else if (removeIndex < currentTrackIndex) {
        setCurrentTrackIndex((prevIdx) => prevIdx - 1);
      }

      return updated;
    });
  }, [currentTrackIndex, playTrack]);

  const clearPlaylist = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    playlist.forEach((track) => {
      if (!track.isPreset && track.url.startsWith('blob:')) {
        URL.revokeObjectURL(track.url);
      }
    });
    setPlaylist([]);
    setCurrentTrackIndex(-1);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [playlist]);

  const loadSampleTracks = useCallback(() => {
    setPlaylist((prev) => {
      const existingIds = new Set(prev.map(t => t.id));
      const newPresets = PRESET_TRACKS.filter(t => !existingIds.has(t.id));
      if (newPresets.length === 0) return prev;
      
      const updated = [...prev, ...newPresets];
      // Auto play the first loaded preset if nothing was playing
      if (currentTrackIndex === -1 && audioRef.current) {
        setTimeout(() => {
          playTrack(prev.length);
        }, 50);
      }
      return updated;
    });
  }, [currentTrackIndex, playTrack]);

  return (
    <MusicPlayerContext.Provider
      value={{
        playlist,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        loopMode,
        isShuffled,
        isExpanded,
        addFiles,
        playTrack,
        togglePlay,
        pause,
        resume,
        nextTrack,
        prevTrack,
        seekTo,
        setVolumeLevel,
        toggleMute,
        setSpeed,
        toggleLoopMode,
        toggleShuffle,
        removeTrack,
        clearPlaylist,
        setIsExpanded,
        loadSampleTracks,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
