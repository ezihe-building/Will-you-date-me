import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetProposal,
  useVerifyProposal,
  useCreateResponse,
  useCreateBooking,
  useRecordVisit,
} from "@workspace/api-client-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DATE_LOCATIONS = [
  { value: "coffee_shop", label: "☕ Coffee date" },
  { value: "cinema", label: "🎬 Movies" },
  { value: "restaurant", label: "🍽️ Dinner out" },
  { value: "beach", label: "🌊 Beach walk" },
  { value: "park", label: "🌿 Park picnic" },
  { value: "custom", label: "✨ Surprise me" },
];

export default function ProposalPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const { data: proposal, isLoading, isError } = useGetProposal(slug);
  const verifyMutation = useVerifyProposal();
  const createResponse = useCreateResponse();
  const createBooking = useCreateBooking();
  const recordVisit = useRecordVisit();
  const { setResponded, responseChoice, hasResponded, setMusicPlaying } = useApp();

  // Name verification
  const [nameInput, setNameInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedProposal, setVerifiedProposal] = useState<{ id: number; recipientName: string; welcomeMessage: string | null } | null>(null);
  const [nameError, setNameError] = useState('');

  // Booking
  const [bookingStep, setBookingStep] = useState<'idle' | 'picking' | 'booked'>('idle');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleVerify = () => {
    setNameError('');
    verifyMutation.mutate(
      { slug, data: { name: nameInput } },
      {
        onSuccess: (data: { id: number; recipientName: string; welcomeMessage: string | null }) => {
          setVerifiedProposal(data);
          setIsVerified(true);
          recordVisit.mutate();
        },
        onError: (err: unknown) => {
          const msg = (err as { data?: { error?: string } })?.data?.error;
          setNameError(msg || "That doesn't seem right. Try again?");
        },
      }
    );
  };

  const handleResponse = (choice: 'yes' | 'maybe' | 'not_now') => {
    createResponse.mutate(
      { data: { response: choice, proposalId: verifiedProposal?.id ?? null } },
      {
        onSuccess: () => {
          setResponded(choice);
          if (choice === 'yes') setMusicPlaying(true);
        }
      }
    );
  };

  const handleBook = () => {
    if (!selectedLocation || !selectedDate || !selectedTime) return;
    createBooking.mutate(
      {
        data: {
          date: selectedDate,
          time: selectedTime,
          location: selectedLocation as "coffee_shop" | "cinema" | "restaurant" | "beach" | "park" | "custom",
          customLocation: selectedLocation === 'custom' ? customLocation : null,
          proposalId: verifiedProposal?.id ?? null,
        }
      },
      { onSuccess: () => setBookingStep('booked') }
    );
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
        </div>
      </PublicLayout>
    );
  }

  if (isError || !proposal || !proposal.isActive) {
    return (
      <PublicLayout>
        <div className="container max-w-lg mx-auto px-6 flex items-center justify-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="glass-card p-10 sm:p-14 rounded-[2.5rem] text-center shadow-xl shadow-primary/5 border-white/80 w-full"
          >
            <h2 className="text-3xl font-serif italic text-foreground mb-4">Hmm…</h2>
            <p className="text-foreground/60 font-light text-lg leading-relaxed">
              This proposal has expired or wasn't meant for you. But if someone sent you here, I'm sure it was beautiful.
            </p>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container max-w-2xl mx-auto px-6 flex items-center justify-center min-h-[70vh]">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {!isVerified ? (
              // Name verification gate
              <motion.div
                key="gate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1 }}
                className="text-center"
              >
                <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-primary/5 border-white/80 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8 font-medium">
                    This is a personal message
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-4 italic">
                    Are you the right person?
                  </h2>
                  <p className="text-foreground/60 font-light text-lg leading-relaxed mb-10">
                    Type your first name to unlock this message.
                  </p>
                  <div className="flex flex-col gap-4 max-w-xs mx-auto">
                    <input
                      type="text"
                      placeholder="Your name..."
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleVerify()}
                      className="p-4 text-center rounded-2xl border border-border bg-white/50 text-foreground placeholder:text-muted-foreground text-base outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    {nameError && (
                      <p className="text-sm text-destructive/80 font-light">{nameError}</p>
                    )}
                    <Button
                      onClick={handleVerify}
                      disabled={!nameInput.trim() || verifyMutation.isPending}
                      className="h-12 rounded-full text-sm tracking-[0.15em] uppercase font-medium shadow-lg shadow-primary/20"
                    >
                      {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock"}
                    </Button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
              </motion.div>
            ) : !hasResponded ? (
              // The proposal
              <motion.div
                key="proposal"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="mb-12">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="text-xs tracking-[0.3em] uppercase text-primary/60 font-medium mb-4"
                  >
                    For {verifiedProposal?.recipientName}
                  </motion.p>
                  
                  <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-primary/5 border-white/80 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground/90 leading-relaxed italic font-light">
                      "{verifiedProposal?.welcomeMessage || "I have something special to ask you..."}"
                    </p>
                    <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  </div>
                </div>

                <motion.h2
                  className="text-3xl sm:text-4xl font-serif text-foreground mb-12 italic leading-tight"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 1 }}
                >
                  Will you go on a date with me?
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button size="lg" onClick={() => handleResponse('yes')} disabled={createResponse.isPending}
                    className="h-14 px-12 text-sm tracking-[0.15em] uppercase rounded-full font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500">
                    <Heart className="w-4 h-4 mr-3 fill-current" />
                    Yes, absolutely
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => handleResponse('maybe')} disabled={createResponse.isPending}
                    className="h-14 px-10 text-sm tracking-[0.15em] uppercase rounded-full font-medium border-primary/20 hover:border-primary/40 transition-all duration-500">
                    Maybe…
                  </Button>
                  <Button size="lg" variant="ghost" onClick={() => handleResponse('not_now')} disabled={createResponse.isPending}
                    className="h-14 px-10 text-sm tracking-[0.15em] uppercase rounded-full font-light text-muted-foreground transition-all duration-500">
                    Not now
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              // Post-response
              <motion.div
                key="response"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                {responseChoice === 'yes' ? (
                  <>
                    <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-2xl shadow-primary/5 border-white/80 relative overflow-hidden mb-10">
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
                        <Heart className="w-7 h-7 text-primary fill-primary/20" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-4 italic">
                        You made me the happiest person.
                      </h2>
                      <p className="text-foreground/60 font-light text-lg leading-relaxed mt-6">
                        Let's plan something unforgettable.
                      </p>
                    </div>

                    {bookingStep === 'idle' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        <Button size="lg" onClick={() => setBookingStep('picking')}
                          className="h-14 px-12 text-sm tracking-[0.15em] uppercase rounded-full font-medium shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500">
                          <Calendar className="w-4 h-4 mr-3" />
                          Pick our date
                        </Button>
                      </motion.div>
                    )}

                    {bookingStep === 'picking' && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                        className="glass-card p-8 sm:p-10 rounded-[2rem] border-white/80 text-left shadow-xl shadow-primary/5">
                        <h3 className="text-xl font-serif italic text-foreground mb-6 text-center">Where to?</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                          {DATE_LOCATIONS.map(loc => (
                            <button key={loc.value} onClick={() => setSelectedLocation(loc.value)}
                              className={cn("py-4 px-3 rounded-2xl text-sm font-medium transition-all duration-300 border text-center",
                                selectedLocation === loc.value
                                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                  : "bg-white/40 hover:bg-white/70 border-white/60 text-foreground/70 hover:text-foreground")}>
                              {loc.label}
                            </button>
                          ))}
                        </div>
                        {selectedLocation === 'custom' && (
                          <input type="text" placeholder="Your idea..." value={customLocation}
                            onChange={e => setCustomLocation(e.target.value)}
                            className="w-full mb-6 p-4 rounded-2xl border border-border bg-white/50 text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-1 focus:ring-primary/30" />
                        )}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div>
                            <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Date</label>
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full p-4 rounded-2xl border border-border bg-white/50 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary/30" />
                          </div>
                          <div>
                            <label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Time</label>
                            <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)}
                              className="w-full p-4 rounded-2xl border border-border bg-white/50 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary/30" />
                          </div>
                        </div>
                        <Button className="w-full h-14 rounded-2xl text-sm tracking-[0.1em] uppercase font-medium shadow-lg shadow-primary/20"
                          onClick={handleBook}
                          disabled={!selectedLocation || !selectedDate || !selectedTime || createBooking.isPending}>
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Confirm
                        </Button>
                      </motion.div>
                    )}

                    {bookingStep === 'booked' && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
                        className="glass-card p-10 rounded-[2rem] border-white/80 text-center shadow-xl shadow-primary/5">
                        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                          <Check className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-serif italic text-foreground mb-4">It's official!</h3>
                        <p className="text-foreground/60 font-light text-lg leading-relaxed">
                          I can't wait for{" "}
                          {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "our date"}.
                        </p>
                      </motion.div>
                    )}
                  </>
                ) : responseChoice === 'maybe' ? (
                  <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-xl shadow-primary/5 border-white/80">
                    <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-6 italic">A "maybe" is more than enough.</h2>
                    <p className="text-foreground/60 font-light text-xl leading-relaxed">I'll wait as long as you need.</p>
                  </div>
                ) : (
                  <div className="glass-card p-10 sm:p-14 rounded-[2.5rem] shadow-xl shadow-primary/5 border-white/80">
                    <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-6 italic">That's okay. Truly.</h2>
                    <p className="text-foreground/60 font-light text-xl leading-relaxed">Thank you for reading this. That alone means the world.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PublicLayout>
  );
}
