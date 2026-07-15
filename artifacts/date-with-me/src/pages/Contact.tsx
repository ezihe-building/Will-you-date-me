import { PublicLayout } from "@/components/PublicLayout";
import { motion } from "framer-motion";
import { Mail, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <PublicLayout>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl sm:text-5xl font-serif text-foreground mb-4 italic"
          >
            Reach Out
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-muted-foreground font-light tracking-widest uppercase text-xs"
          >
            If you want to talk before you decide, I'm always here.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="glass-card p-10 text-center h-full rounded-[2rem] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 group border-white/80">
              <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-8 group-hover:bg-primary/5 group-hover:scale-105 transition-all duration-500">
                <MessageCircle className="w-6 h-6 text-primary" strokeWidth={1} />
              </div>
              <h3 className="text-3xl font-serif mb-4 italic text-foreground">Text Me</h3>
              <p className="text-foreground/60 font-light leading-relaxed mb-10 text-lg">
                Just reply to the message I sent you the link in.
              </p>
              <div className="inline-flex items-center text-[10px] tracking-[0.2em] uppercase font-medium text-primary/70 bg-primary/5 px-6 py-2.5 rounded-full border border-primary/10">
                I reply fast
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="glass-card p-10 text-center h-full rounded-[2rem] hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 group border-white/80">
              <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-8 group-hover:bg-primary/5 group-hover:scale-105 transition-all duration-500">
                <Mail className="w-6 h-6 text-primary" strokeWidth={1} />
              </div>
              <h3 className="text-3xl font-serif mb-4 italic text-foreground">Take Your Time</h3>
              <p className="text-foreground/60 font-light leading-relaxed mb-10 text-lg">
                Use the booking form on the home page when you're ready.
              </p>
              <div className="inline-flex items-center text-[10px] tracking-[0.2em] uppercase font-medium text-primary/70 bg-primary/5 px-6 py-2.5 rounded-full border border-primary/10">
                No rush at all
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
}
