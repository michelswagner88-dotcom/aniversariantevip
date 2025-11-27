import { useState, useEffect } from "react";
import { Gift, Star, Calendar, Trophy, Sparkles, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MENSAGENS = [
  {
    icon: Gift,
    text: "Descontos exclusivos em restaurantes, bares e muito mais!",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Star,
    text: "Acesso VIP a centenas de estabelecimentos parceiros",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Calendar,
    text: "Benefícios válidos durante todo o seu mês de aniversário",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Trophy,
    text: "Promoções especiais e sorteios exclusivos para membros",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Sparkles,
    text: "Cadastro 100% gratuito e acesso imediato aos cupons",
    color: "from-rose-500 to-red-500"
  },
  {
    icon: Heart,
    text: "Transforme seu aniversário em uma experiência inesquecível",
    color: "from-indigo-500 to-violet-500"
  }
];

export const BenefitsBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MENSAGENS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = MENSAGENS[currentIndex];
  const Icon = currentMessage.icon;

  return (
    <section className="relative py-6 overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          animate={{
            x: ["-50%", "150%"],
            y: ["-50%", "50%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative"
            >
              <div className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-lg border border-primary/20 shadow-xl">
                {/* Icon with gradient background */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.1
                  }}
                  className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br ${currentMessage.color} shadow-lg`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </motion.div>

                {/* Message text */}
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base sm:text-lg md:text-xl font-display font-bold text-foreground text-center uppercase tracking-wide"
                >
                  {currentMessage.text}
                </motion.p>

                {/* Sparkle decoration */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="flex-shrink-0"
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                </motion.div>
              </div>

              {/* Dots indicator */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {MENSAGENS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? 'w-8 h-2 bg-primary'
                        : 'w-2 h-2 bg-primary/30 hover:bg-primary/50'
                    }`}
                    aria-label={`Ver mensagem ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};
