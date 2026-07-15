import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function MusicPlayer() {
  const { isMusicPlaying, setMusicPlaying, volume, setVolume, hasResponded } = useApp()
  const [isHovered, setIsHovered] = useState(false)

  // Don't show until they've responded YES or if they start it manually (but they can only start it after popup)
  if (!hasResponded) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-white/50"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-primary"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full shadow-xl shadow-primary/10 border-primary/20 bg-white/90"
        onClick={() => setMusicPlaying(!isMusicPlaying)}
      >
        {isMusicPlaying ? (
          <Pause className="h-5 w-5 text-primary fill-primary" />
        ) : (
          <Play className="h-5 w-5 text-primary fill-primary ml-1" />
        )}
      </Button>
    </div>
  )
}
