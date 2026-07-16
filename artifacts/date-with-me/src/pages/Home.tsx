import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useRecordVisit, useCreateResponse, useCreateBooking, useGetSettings } from "@workspace/api-client-react";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check, Heart, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const FLOWERS = ['🌹', '🌸', '🌷', '🌺', '🌻', '🌼', '🪻', '💐'];

type FloatingItem = {
  id: number;
  emoji: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
};

const DATE_LOCATIONS = [
  { value: "coffee_shop", label: "☕ Coffee date", emoji: "☕" },
  { value: "cinema", label: "🎬 Movies", emoji: "🎬" },
  { value: "restaurant", label: "🍽️ Dinner out", emoji: "🍽️" },
  { value: "beach", label: "🌊 Beach walk", emoji: "🌊" },
  { value: "park", label: "🌿 Park picnic", emoji: "🌿" },
  { value: "custom", label: "✨ Surprise me", emoji: "✨" },
];

export default function Home() {
  const { data: settings } = useGetSettings();
  const recordVisit = useRecordVisit();
  const createResponse = useCreateResponse();
  const createBooking = useCreateBooking();
  const { hasResponded, responseChoice, setResponded, playMusicOnce } = useApp();

  // Booking form
  const [bookingStep, setBookingStep] = useState<'idle' | 'picking' | 'booked'>('idle');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [flowers, setFlowers] = useState<FloatingItem[]>([]);
  const [nextFlowerId, setNextFlowerId] = useState(0);

  useEffect(() => {
    recordVisit.mutate();
  }, []);

  const recipientName = settings?.recipientName || "you";
  const welcomeMessage = settings?.welcomeMessage || "I've been wanting to ask you something for a long time...";

  const spawnFlowers = () => {
    const count = 24;
    const newFlowers: FloatingItem[] = [];
    for (let i = 0; i < count; i++) {
      newFlowers.push({
        id: nextFlowerId + i,
        emoji: FLOWERS[Math.floor(Math.random() * FLOWERS.length)],
        x: Math.random() * 100,
        size: 1.5 + Math.random() * 2.5,
        duration: 2 + Math.random() * 2.5,
        delay: Math.random() * 0.8,
        rotate: Math.random() * 360,
      });
    }
    setNextFlowerId(prev => prev + count);
    setFlowers(prev => [...prev, ...newFlowers]);
    // Cleanup after animations complete
    setTimeout(() => {
      setFlowers(prev => prev.filter(f => !newFlowers.find(nf => nf.id === f.id)));
    }, 6000);
  };

  const handleResponse = async (choice: 'yes' | 'maybe' | 'not_now') => {
    createResponse.mutate({ data: { response: choice, proposalId: null } });
    setResponded(choice);
    if (choice === 'yes') {
      playMusicOnce();
      spawnFlowers();
    }
  };

  const handleBook = async () => {
    if (!selectedLocation || !selectedDate || !selectedTime) return;
    
    createBooking.mutate({
      data: {
        date: selectedDate,
        time: selectedTime,
        location: selectedLocation as "coffee_shop" | "cinema" | "restaurant" | "beach" | "park" | "custom",
        customLocation: selectedLocation === 'custom' ? customLocation : null,
        proposalId: null,
      }
    }, {
      onSuccess: () => setBookingStep('booked'),
      onError: (e: unknown) => console.error('Booking error:', e),
    });
  };

  const mainContent = (
    <div className="container max-w-2xl mx-auto px-6 flex items-center justify-center min-h-[70vh]">
      <div className="w-full">
        {!hasResponded ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="mb-16">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-12 font-medium">
                A personal message
              </p>
              <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-primary/5 border-white/80 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground/90 leading-relaxed italic font-light">
                  "{welcomeMessage}"
                </p>
                <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </div>
            </div>

            <motion.h2
              className="text-3xl sm:text-4xl font-serif text-foreground mb-12 italic leading-tight"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              {recipientName ? `${recipientName}, will you go on a date with me?` : "Will you go on a date with me?"}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => handleResponse('yes')}
                disabled={createResponse.isPending}
                className="h-14 px-12 text-sm tracking-[0.15em] uppercase rounded-full font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500"
              >
                <Heart className="w-4 h-4 mr-3 fill-current" />
                Yes, absolutely
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleResponse('maybe')}
                disabled={createResponse.isPending}
                className="h-14 px-10 text-sm tracking-[0.15em] uppercase rounded-full font-medium border-primary/20 hover:border-primary/40 transition-all duration-500"
              >
                Maybe…
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => handleResponse('not_now')}
                disabled={createResponse.isPending}
                className="h-14 px-10 text-sm tracking-[0.15em] uppercase rounded-full font-light text-muted-foreground transition-all duration-500"
              >
                Not now
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {responseChoice === 'yes' && (
              <motion.div
                key="yes"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-primary/5 border-white/80 relative overflow-hidden mb-10">
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
                    <Heart className="w-7 h-7 text-primary fill-primary/20" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-4 italic leading-tight">
                    You made me the happiest person.
                  </h2>
                  <p className="text-foreground/60 font-light text-lg leading-relaxed mt-6">
                    I knew you'd say yes. Let's plan something special.
                  </p>
                  <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                </div>

                {/* Booking section */}
                {bookingStep === 'idle' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                    <Button
                      size="lg"
                      onClick={() => setBookingStep('picking')}
                      className="h-14 px-12 text-sm tracking-[0.15em] uppercase rounded-full font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500"
                    >
                      <Calendar className="w-4 h-4 mr-3" />
                      Book our first date
                    </Button>
                  </motion.div>
                )}

                {bookingStep === 'picking' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="glass-card p-8 sm:p-10 rounded-[2rem] border-white/80 text-left shadow-xl shadow-primary/5"
                  >
                    <h3 className="text-xl font-serif italic text-foreground mb-6 text-center">Where should we go?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                      {DATE_LOCATIONS.map(loc => (
                        <button
                          key={loc.value}
                          onClick={() => setSelectedLocation(loc.value)}
                          className={cn(
                            "py-4 px-3 rounded-2xl text-sm font-medium transition-all duration-300 border text-center",
                            selectedLocation === loc.value
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                              : "bg-white/40 hover:bg-white/70 border-white/60 text-foreground/70 hover:text-foreground"
                          )}
                        >
                          {loc.label}
                        </button>
                      ))}
                    </div>

                    {selectedLocation === 'custom' && (
                      <input
                        type="text"
                        placeholder="Tell me your idea..."
                        value={customLocation}
                        onChange={e => setCustomLocation(e.target.value)}
                        className="w-full mb-6 p-4 rounded-2xl border border-border bg-white/50 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div>
                        <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-4 rounded-2xl border border-border bg-white/50 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Time</label>
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={e => setSelectedTime(e.target.value)}
                          className="w-full p-4 rounded-2xl border border-border bg-white/50 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full h-14 rounded-2xl text-sm tracking-[0.1em] uppercase font-medium shadow-lg shadow-primary/20"
                      onClick={handleBook}
                      disabled={!selectedLocation || !selectedDate || !selectedTime || createBooking.isPending}
                    >
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Confirm our date
                    </Button>
                  </motion.div>
                )}

                {bookingStep === 'booked' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="glass-card p-10 rounded-[2rem] border-white/80 text-center shadow-xl shadow-primary/5"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-serif italic text-foreground mb-4">It's official!</h3>
                    <p className="text-foreground/60 font-light text-lg leading-relaxed">
                      I can't wait for{" "}
                      {selectedDate
                        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                        : "our date"}.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {responseChoice === 'maybe' && (
              <motion.div
                key="maybe"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="text-center"
              >
                <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-xl shadow-primary/5 border-white/80">
                  <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-6 italic leading-tight">
                    A "maybe" is more than enough.
                  </h2>
                  <p className="text-foreground/60 font-light text-xl leading-relaxed">
                    I'll wait as long as you need. The offer stands whenever you're ready.
                  </p>
                </div>
              </motion.div>
            )}

            {responseChoice === 'not_now' && (
              <motion.div
                key="not_now"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2 }}
                className="text-center"
              >
                <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-xl shadow-primary/5 border-white/80">
                  <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-6 italic leading-tight">
                    That's okay. Truly.
                  </h2>
                  <p className="text-foreground/60 font-light text-xl leading-relaxed">
                    Thank you for at least coming here and reading this. That alone means the world to me.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  return (
    <PublicLayout>
      {mainContent}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {flowers.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: '110vh', x: `${f.x}vw`, rotate: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: '-10vh', x: `${f.x + (Math.random() - 0.5) * 20}vw`, rotate: f.rotate, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: f.duration, delay: f.delay, ease: 'easeOut' }}
              className="absolute"
              style={{ fontSize: `${f.size}rem` }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </PublicLayout>
  );
}
