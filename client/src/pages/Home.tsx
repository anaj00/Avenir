import { Hero } from "@/components/Hero";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { Diamond, PenTool, Printer } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero />
      
      {/* Features Section */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <PenTool className="w-8 h-8" />,
                title: "You Tell the Story",
                desc: "Share a memory, a feeling, or a moment. Our AI interprets the nuances of your narrative."
              },
              {
                icon: <Diamond className="w-8 h-8" />,
                title: "AI Crafts the Design",
                desc: "We extract symbols and textures from your text to generate a unique jewelry concept."
              },
              {
                icon: <Printer className="w-8 h-8" />,
                title: "Ready for Reality",
                desc: "Get a high-fidelity 3D model ready for printing or digital collection."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group"
              >
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-serif mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
