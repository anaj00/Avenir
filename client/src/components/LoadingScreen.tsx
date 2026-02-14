import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LOADING_PHASES = [
  "Analyzing your story...",
  "Extracting precious symbols...",
  "Shaping concept directions...",
  "Refining emotional motifs...",
  "Balancing the final concept...",
  "Finalizing your concept..."
];

export function LoadingScreen() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % LOADING_PHASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-2 border-primary/20 border-t-primary"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-primary/10 border-b-primary/50"
        />
        
        {/* Center Gem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-4 h-4 bg-primary rotate-45 shadow-[0_0_20px_rgba(212,175,55,0.6)]"
          />
        </div>
      </div>

      <div className="mt-12 h-8 relative w-full text-center">
        <motion.p
          key={phaseIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="font-serif text-xl text-primary tracking-wide absolute left-0 right-0"
        >
          {LOADING_PHASES[phaseIndex]}
        </motion.p>
      </div>
      
      <p className="mt-4 text-sm text-muted-foreground font-light tracking-widest uppercase">
        AI Artisan at Work
      </p>
    </div>
  );
}
