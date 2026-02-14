import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium tracking-wider uppercase mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Custom Jewelry</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight mb-8">
            Weave your story into <br />
            <span className="text-gradient-gold italic">eternal silver.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            The Generative Jeweler transforms your memories into one-of-a-kind 3D designs. 
            Tell us a story, and watch it become a wearable masterpiece.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/create" className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-medium transition-all hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.4)] overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Start Designing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            
            <Link href="/gallery" className="px-8 py-4 bg-transparent border border-white/10 text-foreground hover:bg-white/5 rounded-full text-lg transition-colors">
              View Gallery
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}
