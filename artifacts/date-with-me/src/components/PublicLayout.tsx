import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import { Heart } from "lucide-react"

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation()
  const [tapCount, setTapCount] = useState(0)
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSecretTap = () => {
    const next = tapCount + 1
    setTapCount(next)

    if (tapTimer.current) clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => setTapCount(0), 2000)

    if (next >= 7) {
      setTapCount(0)
      if (tapTimer.current) clearTimeout(tapTimer.current)
      navigate("/dashboard")
    }
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <div className="min-h-[100dvh] flex flex-col relative font-sans selection:bg-primary/20 selection:text-primary">
      <div className="noise-overlay" />
      <div className="ambient-bg" />
      <header className="absolute top-0 left-0 right-0 z-40 p-6 sm:p-8 flex justify-center">
        <nav className="flex items-center gap-1 sm:gap-2 glass-card px-2 sm:px-4 py-1.5 sm:py-2 rounded-full">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "px-3 sm:px-5 py-2 rounded-full text-[10px] sm:text-xs uppercase tracking-widest font-medium transition-all duration-500",
                location === item.href 
                  ? "bg-foreground/5 text-primary shadow-sm" 
                  : "text-foreground/60 hover:text-primary hover:bg-foreground/5"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="w-[1px] h-4 bg-border mx-1 sm:mx-2" />
          <Link 
            href="/zenith-labs"
            className={cn(
              "px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-500 opacity-60 hover:opacity-100 uppercase tracking-widest",
              location === "/zenith-labs" 
                ? "bg-foreground/5 text-foreground shadow-sm opacity-100" 
                : "text-foreground hover:bg-foreground/5"
            )}
            title="Studio Credit"
          >
            ZL
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col relative z-10 pt-32 pb-16">
        {children}
      </main>

      <footer className="py-8 text-center text-[10px] sm:text-xs tracking-widest uppercase text-muted-foreground relative z-10 flex flex-col items-center gap-3">
        <p
          className="opacity-50 hover:opacity-100 transition-opacity cursor-default select-none flex items-center justify-center gap-2"
          onClick={handleSecretTap}
          title="A secret lies herein"
        >
          Crafted with <Heart className="w-3.5 h-3.5 inline-block text-primary/60 fill-primary/10" /> <span className="px-1">•</span> 
          <Link href="/zenith-labs" className="hover:text-primary transition-colors duration-500">Zenith Labs</Link>
        </p>
      </footer>
    </div>
  )
}
