import { Navigation } from "@/components/Navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useCreateDesign } from "@/hooks/use-designs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertDesignSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// Frontend validation schema
const formSchema = insertDesignSchema.extend({
  prompt: z.string().min(10, "Your story must be at least 10 characters long").max(1000, "Please keep your story under 1000 characters"),
});

export default function Create() {
  const mutation = useCreateDesign();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  if (mutation.isPending) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
              Design Your <span className="text-gradient-gold">Masterpiece</span>
            </h1>
            <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
              Describe a memory, a relationship, or a feeling. The AI will extract symbols and textures to craft a unique piece of jewelry just for you.
            </p>
          </div>

          <div className="bg-card border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-serif tracking-wide text-primary">Your Story</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. We met at a coffee shop in rainy Seattle, and we love stargazing..."
                          className="min-h-[200px] bg-black/40 border-white/10 text-lg resize-none focus:border-primary/50 transition-all rounded-xl p-6 leading-relaxed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-right text-muted-foreground mt-2">
                        {field.value.length}/1000 characters
                      </p>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full font-medium transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:-translate-y-1"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      "Crafting..." 
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Generate Design
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Prompt suggestions */}
          <div className="mt-16">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6 text-center">Inspiration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                "A walk through a snowy pine forest at twilight.",
                "The chaotic energy of Tokyo streets at night.",
                "A calm ocean wave crashing against ancient rocks."
              ].map((text, i) => (
                <button
                  key={i}
                  onClick={() => form.setValue("prompt", text)}
                  className="text-left p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-sm leading-relaxed text-muted-foreground hover:text-foreground"
                >
                  "{text}"
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
