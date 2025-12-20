import { useState, useEffect, useRef } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScrollToTopButtonProps {
  showAfter?: number;
  smooth?: boolean;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ showAfter = 400, smooth = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      setIsVisible(scrollTop > showAfter);
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

      // Marcar como scrolling e desabilitar cliques
      setIsScrolling(true);

      // Limpar timeout anterior
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reabilitar cliques após 250ms sem scroll
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 250);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [showAfter]);

  const scrollToTop = () => {
    // Proteção extra: não executar se estiver scrollando
    if (isScrolling) return;

    window.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          whileHover={{ y: -2, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          className="fixed z-[900] w-12 h-12 flex items-center justify-center bg-background/95 backdrop-blur-sm border border-border/50 rounded-full shadow-lg hover:shadow-xl cursor-pointer transition-shadow"
          style={{
            // Posição mais alta para evitar conflito com footer/bottom nav
            bottom: "max(32px, calc(96px + env(safe-area-inset-bottom)))",
            right: "24px",
            // Desabilitar pointer events durante scroll
            pointerEvents: isScrolling ? "none" : "auto",
            // Feedback visual quando desabilitado
            opacity: isScrolling ? 0.6 : 1,
          }}
        >
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
            {/* Background circle */}
            <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="2" opacity="0.3" />
            {/* Progress circle */}
            <circle
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-100 ease-out"
            />
          </svg>

          {/* Icon */}
          <ChevronUp size={20} className="relative z-10 text-foreground" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
