import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  type: 'heart' | 'petal' | 'sparkle';
}

export function AmbientEffects() {
  const { responseChoice } = useApp();
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Continuous gentle ambient effect
  useEffect(() => {
    let particleId = 0;
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      
      // Less particles if not "yes", more if "yes"
      const maxParticles = responseChoice === 'yes' ? 30 : 10;
      
      setParticles(prev => {
        if (prev.length >= maxParticles) return prev;
        
        const newParticle: Particle = {
          id: particleId++,
          x: Math.random() * 100, // vw
          y: -10, // Start above screen
          size: Math.random() * 15 + 10,
          duration: Math.random() * 10 + 10,
          type: Math.random() > 0.5 ? 'petal' : (Math.random() > 0.5 ? 'heart' : 'sparkle')
        };
        
        return [...prev, newParticle];
      });
    }, responseChoice === 'yes' ? 800 : 2000);
    
    return () => clearInterval(interval);
  }, [responseChoice]);

  // Cleanup off-screen particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles(prev => prev.slice(-40)); // Keep max 40 in memory
    }, 5000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 0, 
              y: '-10vh', 
              x: `${p.x}vw`,
              rotate: 0,
              scale: 0
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: '110vh',
              x: `${p.x + (Math.random() * 20 - 10)}vw`,
              rotate: Math.random() * 360,
              scale: [0, 1, 1, 0.5]
            }}
            transition={{ 
              duration: p.duration,
              ease: "linear"
            }}
            onAnimationComplete={() => {
              setParticles(prev => prev.filter(particle => particle.id !== p.id));
            }}
            className="absolute text-primary/30 select-none"
            style={{ fontSize: p.size }}
          >
            {p.type === 'heart' ? '❤' : p.type === 'petal' ? '🌸' : '✨'}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
