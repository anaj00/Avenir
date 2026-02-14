import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Gem, Layers } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
            <Gem className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-serif text-xl tracking-wide text-foreground group-hover:text-primary transition-colors">
              Generative Jeweler
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/gallery" className={cn(
            "text-sm tracking-widest uppercase font-medium transition-colors hover:text-primary flex items-center gap-2",
            location === "/gallery" ? "text-primary" : "text-muted-foreground"
          )}>
            <Layers className="w-4 h-4" />
            Gallery
          </Link>
          
          <Link href="/create" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-full transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0">
            Craft Piece
          </Link>
        </div>
      </div>
    </nav>
  );
}
