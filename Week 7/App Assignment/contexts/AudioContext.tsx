import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { Song } from '../data/types';
import { songs, getSongById } from '../data/playlistData';

interface AudioContextType {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  currentTrack: Song | null;
  positionMillis: number;
  durationMillis: number;
  currentWaveformData: number[] | null; // 当前歌曲的波形数据
  loadAudio: (song?: Song) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  unloadAudio: () => Promise<void>;
  loadSong: (song: Song) => Promise<void>;
  playSong: (song: Song) => Promise<void>;
  nextSong: () => Promise<void>;
  previousSong: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// 计算波形 bar 数量
// 使用较大的固定值，确保有足够的数据点用于插值适配不同屏幕尺寸
const calculateBarCount = (): number => {
  // 使用较大的固定值（1000），Waveform 组件会根据实际屏幕宽度进行插值
  // 这样可以确保在任何屏幕尺寸下都有足够的波形数据
  return 1000;
};

// 生成基于 songId 的波形数据（确保同一首歌每次都生成相同的波形）
const generateWaveformData = (songId: number, barCount: number): number[] => {
  const data: number[] = [];
  
  for (let i = 0; i < barCount; i++) {
    const progress = i / barCount;
    
    // 使用 songId 和索引生成伪随机种子，确保同一首歌生成相同波形
    let seed = (songId * 12345 + i * 7919) % 233280;
    const normalizedSeed = seed / 233280;
    
    // 根据 songId 调整频率，使不同歌曲有不同的波形特征
    const freq1 = 3 + (songId % 5);
    const freq2 = 8 + (songId % 7);
    const freq3 = 15 + (songId % 10);
    
    // 生成多个频率的正弦波组合
    const sine1 = Math.sin(progress * Math.PI * freq1) * 0.4;
    const sine2 = Math.sin(progress * Math.PI * freq2) * 0.3;
    const sine3 = Math.sin(progress * Math.PI * freq3) * 0.2;
    
    // 使用种子生成随机值（确保可重复性）
    const random = normalizedSeed * 0.35;
    
    // 根据 songId 调整基础值，使不同歌曲有不同的整体振幅
    const variation = ((songId % 10) / 10) * 0.2;
    const baseValue = 0.4 + variation;
    
    const value = Math.max(0.1, Math.min(1, baseValue + sine1 + sine2 + sine3 + random));
    data.push(value);
  }
  
  return data;
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Song | null>(songs[0] || null); // Default to first song
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [currentWaveformData, setCurrentWaveformData] = useState<number[] | null>(null);
  const [waveformCache, setWaveformCache] = useState<Map<number, number[]>>(new Map()); // 缓存波形数据
  const soundRef = useRef<Audio.Sound | null>(null);

  // 生成或获取波形数据
  const getOrGenerateWaveform = (songId: number): number[] => {
    // 先检查缓存
    if (waveformCache.has(songId)) {
      return waveformCache.get(songId)!;
    }
    
    // 生成新的波形数据
    const barCount = calculateBarCount();
    const waveform = generateWaveformData(songId, barCount);
    
    // 存储到缓存
    setWaveformCache(prev => {
      const newCache = new Map(prev);
      newCache.set(songId, waveform);
      return newCache;
    });
    
    return waveform;
  };

  // Set audio mode
  const setAudioMode = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  };

  // Load audio file
  const loadAudio = async (song?: Song) => {
    try {
      const trackToLoad = song || currentTrack || songs[0];
      
      if (!trackToLoad) {
        return;
      }

      // 生成或获取该歌曲的波形数据
      const waveform = getOrGenerateWaveform(trackToLoad.id);
      setCurrentWaveformData(waveform);

      // Unload previous audio if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Set audio mode
      await setAudioMode();

      // Load the audio file
      const { sound: audioSound } = await Audio.Sound.createAsync(
        trackToLoad.audioFile,
        { shouldPlay: false }
      );

      setSound(audioSound);
      soundRef.current = audioSound;
      setCurrentTrack(trackToLoad);

      // Get initial duration
      const status = await audioSound.getStatusAsync();
      if (status.isLoaded) {
        setDurationMillis(status.durationMillis || 0);
      }

      // Set up playback status listener
      audioSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          setPositionMillis(status.positionMillis || 0);
          setDurationMillis(status.durationMillis || 0);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPositionMillis(0);
            // Auto play next song if available
            setTimeout(async () => {
              const track = currentTrack || trackToLoad;
              const currentIndex = songs.findIndex(s => s.id === track.id);
              const nextIndex = (currentIndex + 1) % songs.length;
              const nextSongItem = songs[nextIndex];
              if (nextSongItem) {
                await loadAudio(nextSongItem);
                setTimeout(async () => {
                  await play();
                }, 100);
              }
            }, 100);
          }
        }
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  // Play audio
  const play = async () => {
    try {
      const currentSound = soundRef.current || sound;
      
      if (!currentSound) {
        await loadAudio();
        // Wait a bit for audio to load
        setTimeout(async () => {
          const newSound = soundRef.current;
          if (newSound) {
            await newSound.setPositionAsync(0);
            await newSound.playAsync();
            setIsPlaying(true);
          }
        }, 100);
        return;
      }

      const status = await currentSound.getStatusAsync();
      
      if (status.isLoaded) {
        if (status.positionMillis === status.durationMillis || status.positionMillis === 0) {
          await currentSound.setPositionAsync(0);
        }
        await currentSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Pause audio
  const pause = async () => {
    try {
      const currentSound = soundRef.current || sound;
      
      if (!currentSound) {
        return;
      }

      const status = await currentSound.getStatusAsync();
      
      if (status.isLoaded && status.isPlaying) {
        await currentSound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    try {
      const currentSound = soundRef.current || sound;
      
      if (!currentSound) {
        await play();
        return;
      }

      const status = await currentSound.getStatusAsync();
      
      if (status.isLoaded) {
        if (status.isPlaying) {
          await pause();
        } else {
          await play();
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  // Unload audio
  const unloadAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setSound(null);
        setIsPlaying(false);
        setPositionMillis(0);
        setDurationMillis(0);
      }
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  };

  // Load a specific song
  const loadSong = async (song: Song) => {
    await loadAudio(song);
  };

  // Play a specific song (load and play)
  const playSong = async (song: Song) => {
    await loadAudio(song);
    // Wait a bit for audio to load
    setTimeout(async () => {
      await play();
    }, 100);
  };

  // Play next song
  const nextSong = async () => {
    const track = currentTrack || songs[0];
    if (!track) return;
    
    const currentIndex = songs.findIndex(s => s.id === track.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSongItem = songs[nextIndex];
    
    if (nextSongItem) {
      await playSong(nextSongItem);
    }
  };

  // Play previous song
  const previousSong = async () => {
    const track = currentTrack || songs[0];
    if (!track) return;
    
    const currentIndex = songs.findIndex(s => s.id === track.id);
    const previousIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    const previousSongItem = songs[previousIndex];
    
    if (previousSongItem) {
      await playSong(previousSongItem);
    }
  };

  // Load audio on mount
  useEffect(() => {
    loadAudio();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const value: AudioContextType = {
    sound,
    isPlaying,
    currentTrack,
    positionMillis,
    durationMillis,
    currentWaveformData,
    loadAudio,
    play,
    pause,
    togglePlayPause,
    unloadAudio,
    loadSong,
    playSong,
    nextSong,
    previousSong,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

