import { PublicLayout } from "@/components/PublicLayout";
import { motion } from "framer-motion";

export default function About() {
  return (
    <PublicLayout>
      <div className="container max-w-2xl mx-auto px-6 flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full"
        >
          <div className="glass-card p-10 md:p-16 text-center rounded-[2rem] relative overflow-hidden shadow-2xl shadow-primary/5 border-white/80">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-12 italic">
              Why I built this...
            </h1>

            <div className="space-y-8 text-lg md:text-xl text-foreground/70 font-light leading-relaxed">
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
              >
                Sometimes words aren't enough, and a simple text message doesn't feel special enough for someone like you.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 1 }}
              >
                I wanted to create something unique. A tiny corner of the internet dedicated entirely to asking you out, crafted with the same care and attention I'd want to put into our first date.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
              >
                This isn't a template or a forward. It's a handwritten digital letter, waiting for your answer.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}
              className="mt-16 pt-12 relative"
            >
              <p className="font-serif italic text-primary/80 text-3xl">
                I hope it made you smile.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
