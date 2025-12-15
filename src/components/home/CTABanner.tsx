import { memo, useCallback, useState, useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Gift, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

type CTAVariant = "register" | "partner" | "benefits";

interface CTABannerProps {
  variant?: CTAVariant;
  onCTAClick?: (variant: CTAVariant) => void;
}

interface CTAContent {
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  icon: typeof Sparkles;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CTA_CONTENT: Record<CTAVariant, CTAContent> = {
  register: {
    title: "Seu aniversário está chegando?",
    subtitle: "Cadastre-se grátis e descubra benefícios exclusivos perto de você!",
    cta: "Criar minha conta",
    link: "/auth",
    icon: Sparkles,
  },
  partner: {
    title: "Tem um estabelecimento?",
    subtitle: "Atraia aniversariantes e aumente suas vendas com benefícios exclusivos!",
    cta: "Seja parceiro",
    link: "/seja-parceiro",
    icon: Star,
  },
  benefits: {
    title: "Mais de 500 benefícios esperando você",
    subtitle: "Restaurantes, bares, spas e muito mais oferecendo vantagens no seu dia!",
    cta: "Explorar agora",
    link: "/explorar",
    icon: Gift,
  },
};

const GRADIENT_CLASSES: Record<CTAVariant, string> = {
  register: "bg-gradient-to-br from-[#240046] to-[#3C096C]",
  partner: "bg-gradient-to-br from-[#3C096C] to-[#240046]",
  benefits: "bg-gradient-to-br from-[#240046] to-[#3C096C]",
};

// =============================================================================
// HOOKS
// =============================================================================

const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const useInView = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
};

// =============================================================================
// UTILS
// =============================================================================

const haptic = (pattern: number[] = [10, 30, 10]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export const CTABanner = memo(({ variant = "register", onCTAClick }: CTABannerProps) => {
  const reducedMotion = useReducedMotion();
  const { ref, isInView } = useInView();
  const descriptionId = useId();

  const { title, subtitle, cta, link, icon: Icon } = CTA_CONTENT[variant];
  const gradientClass = GRADIENT_CLASSES[variant];

  const handleClick = useCallback(() => {
    haptic();
    onCTAClick?.(variant);
  }, [variant, onCTAClick]);

  return (
    <section className="py-4 sm:py-6" aria-labelledby={`cta-title-${variant}`}>
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl p-5 sm:p-6 lg:p-8",
          gradientClass,
          !reducedMotion && "transition-all duration-500",
          !reducedMotion && isInView && "animate-in fade-in slide-in-from-bottom-4",
          !reducedMotion && !isInView && "opacity-0 translate-y-4",
        )}
        role="banner"
      >
        {/* Decorative blurs - usando blur-2xl para melhor performance */}
        <div
          className={cn(
            "absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl",
            !reducedMotion && "animate-pulse",
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl",
            !reducedMotion && "animate-pulse",
          )}
          style={{ animationDelay: "1s" }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            {/* Icon */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Icon
                className={cn("w-5 h-5 text-white/80", !reducedMotion && "animate-in zoom-in duration-500 delay-200")}
                aria-hidden="true"
              />
            </div>

            {/* Title */}
            <h3
              id={`cta-title-${variant}`}
              className={cn(
                "text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1",
                !reducedMotion && isInView && "animate-in slide-in-from-left duration-500 delay-100",
              )}
            >
              {title}
            </h3>

            {/* Subtitle */}
            <p
              id={descriptionId}
              className={cn(
                "text-white/80 text-sm sm:text-base",
                !reducedMotion && isInView && "animate-in slide-in-from-left duration-500 delay-150",
              )}
            >
              {subtitle}
            </p>
          </div>

          {/* CTA Button */}
          <Link
            to={link}
            onClick={handleClick}
            aria-label={cta}
            aria-describedby={descriptionId}
            className={cn(
              "group flex items-center gap-2",
              "bg-white text-[#240046] font-bold",
              "px-6 py-3 rounded-full",
              "shadow-lg",
              "whitespace-nowrap text-sm sm:text-base",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#240046]",
              !reducedMotion && "transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl",
              !reducedMotion && isInView && "animate-in slide-in-from-right duration-500 delay-200",
            )}
          >
            <span>{cta}</span>
            <ArrowRight
              className={cn("w-4 h-4", !reducedMotion && "transition-transform group-hover:translate-x-1")}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
});

CTABanner.displayName = "CTABanner";

export default CTABanner;
