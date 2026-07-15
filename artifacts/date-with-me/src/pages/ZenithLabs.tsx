import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ZenithLabs() {
  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden selection:bg-white/20 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0,transparent_100%)] z-0" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="mb-14">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] font-medium mb-8"
          >
            Designed & Developed By
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="text-3xl sm:text-4xl font-serif text-white tracking-[0.2em] my-10 font-light"
          >
            ZENITH LABS
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-zinc-400 font-light text-sm mb-12 leading-loose px-4"
          >
            Crafting bespoke digital experiences and specialized web applications.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="flex flex-col gap-6 items-center"
        >
          <a 
            href="https://zenith-labs-ten.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap text-xs uppercase tracking-[0.2em] transition-all duration-500 hover:text-black text-zinc-300 border border-zinc-700 hover:border-zinc-200 bg-zinc-900/50 hover:bg-zinc-200 h-14 px-12 w-full rounded-none"
          >
            Visit Portfolio
          </a>
          
          <Link href="/">
            <Button variant="ghost" className="text-zinc-600 hover:text-white hover:bg-transparent tracking-widest uppercase text-[10px] mt-4 transition-colors duration-500 rounded-none h-10">
              <ArrowLeft className="w-3 h-3 mr-3" /> Return
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
