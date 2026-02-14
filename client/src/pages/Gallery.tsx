import { Navigation } from "@/components/Navigation";
import { useDesigns } from "@/hooks/use-designs";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Gallery() {
  const { data: designs, isLoading } = useDesigns();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">
              Curated <span className="text-gradient-gold">Collection</span>
            </h1>
            <p className="text-muted-foreground max-w-md">
              Explore AI-crafted concepts and extracted symbols inspired by stories from around the world.
            </p>
          </div>
          <Link href="/create" className="text-sm font-medium tracking-widest uppercase border-b border-primary text-primary pb-1 hover:text-primary/80 hover:border-primary/80 transition-colors">
            Create Your Own
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs?.map((design, idx) => (
              <motion.div
                key={design.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/design/${design.id}`}
                  className="group block rounded-2xl overflow-hidden bg-white/5 border border-white/5 hover:border-primary/30 transition-colors h-full"
                >
                  <div className="h-full p-6 md:p-7 flex flex-col">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                      Concept #{design.id}
                    </p>
                    <p className="text-lg font-serif text-white line-clamp-5 italic mb-6">
                      "{design.prompt}"
                    </p>
                    {!!design.symbols?.length && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(design.symbols as string[]).slice(0, 4).map((symbol, symbolIdx) => (
                          <span
                            key={`${design.id}-${symbol}-${symbolIdx}`}
                            className="text-xs px-3 py-1 rounded-full border border-primary/30 text-primary bg-primary/5"
                          >
                            {symbol}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center gap-2 text-primary text-xs uppercase tracking-widest font-medium">
                      View Concept <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* Empty State */}
            {designs?.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                <p className="text-muted-foreground mb-4">No designs created yet.</p>
                <Link href="/create" className="text-primary hover:underline">
                  Be the first to create one
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
