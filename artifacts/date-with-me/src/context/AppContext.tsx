import * as React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useGetSettings } from "@workspace/api-client-react"

type ResponseChoice = 'yes' | 'maybe' | 'not_now' | null;

interface AppState {
  hasResponded: boolean;
  responseChoice: ResponseChoice;
  isMusicPlaying: boolean;
  volume: number;
  musicPlayedOnce: boolean;
  setResponded: (choice: ResponseChoice) => void;
  setMusicPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  playMusicOnce: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hasResponded, setHasResponded] = useState(false);
  const [responseChoice, setResponseChoice] = useState<ResponseChoice>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [musicPlayedOnce, setMusicPlayedOnce] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { data: settings } = useGetSettings();
  
  const musicUrl = settings?.musicUrl || `${import.meta.env.BASE_URL}audio/romantic-theme.mp3`;

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(musicUrl);
      audioRef.current.loop = true;
    } else if (audioRef.current.src !== musicUrl && musicUrl) {
      const isPlaying = !audioRef.current.paused;
      audioRef.current.src = musicUrl;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  }, [musicUrl]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isMusicPlaying) {
      // Fade in
      audioRef.current.volume = 0;
      audioRef.current.play().catch(e => {
        console.log('Autoplay prevented:', e);
        setIsMusicPlaying(false);
      });
      
      let vol = 0;
      const interval = setInterval(() => {
        if (vol < volume) {
          vol += 0.05;
          if (vol > volume) vol = volume;
          if (audioRef.current) audioRef.current.volume = vol;
        } else {
          clearInterval(interval);
        }
      }, 100);
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const setResponded = (choice: ResponseChoice) => {
    setResponseChoice(choice);
    setHasResponded(true);
  };

  const playMusicOnce = () => {
    if (!musicPlayedOnce) {
      setMusicPlayedOnce(true);
      setIsMusicPlaying(true);
    }
  };

  return (
    <AppContext.Provider value={{
      hasResponded,
      responseChoice,
      isMusicPlaying,
      volume,
      musicPlayedOnce,
      setResponded,
      setMusicPlaying: setIsMusicPlaying,
      setVolume,
      playMusicOnce,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
