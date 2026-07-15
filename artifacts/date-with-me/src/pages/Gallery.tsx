import { PublicLayout } from "@/components/PublicLayout";
import { useGetSettings } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

export default function Gallery() {
  const { data: settings, isLoading } = useGetSettings();
  const photos = settings?.galleryPhotos || [];

  return (
    <PublicLayout>
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl sm:text-5xl font-serif text-foreground mb-4 italic"
          >
            Our Memories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-muted-foreground tracking-widest uppercase text-xs font-medium"
          >
            A small collection of beautiful moments
          </motion.p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-primary/5 animate-pulse" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-md mx-auto text-center py-20"
          >
            <div className="glass-card p-12 border-primary/10 rounded-[2rem] shadow-xl shadow-primary/5">
              <ImageIcon className="w-10 h-10 text-primary/30 mx-auto mb-8" strokeWidth={1} />
              <h3 className="text-3xl font-serif text-foreground mb-4 italic">No photos yet</h3>
              <p className="text-foreground/60 font-light leading-relaxed text-lg">
                I can't wait to fill this space with memories of us together.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 gap-8 space-y-8">
            {photos.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="break-inside-avoid relative group"
              >
                <div className="overflow-hidden glass-card rounded-2xl shadow-sm group-hover:shadow-2xl transition-all duration-700 p-2 sm:p-3 border-white/60">
                  <div className="overflow-hidden rounded-xl bg-muted/20">
                    <img
                      src={url}
                      alt={`Memory ${i + 1}`}
                      className="w-full h-auto object-cover transform group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
