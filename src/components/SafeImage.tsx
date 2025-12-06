import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type AspectRatioType = '4:3' | '16:9' | '1:1' | '3:4' | 'auto';

const aspectRatioClasses: Record<AspectRatioType, string> = {
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-[16/9]',
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
  'auto': '',
};

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  enableParallax?: boolean;
  parallaxStrength?: number;
  aspectRatio?: AspectRatioType;
}

export const SafeImage = ({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder-estabelecimento.png',
  className,
  showSkeleton = true,
  enableParallax = false,
  parallaxStrength = 0.1,
  aspectRatio = 'auto',
  ...props 
}: SafeImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [showFallbackError, setShowFallbackError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageSrc = hasError ? fallbackSrc : src;

  // Intersection Observer para lazy loading - carrega 100px antes de aparecer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150px', threshold: 0.01 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Parallax com Framer Motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    enableParallax ? [-30 * parallaxStrength, 30 * parallaxStrength] : [0, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    enableParallax ? [1.05, 1, 1.05] : [1, 1, 1]
  );

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    } else {
      // Fallback também falhou
      setShowFallbackError(true);
      setIsLoaded(true);
    }
  };

  if (showSkeleton) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          'relative overflow-hidden bg-slate-800 rounded-xl',
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        {/* Skeleton shimmer - sempre visível até carregar */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-800">
            {/* Shimmer animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)'
                }}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {showFallbackError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-500">
            <ImageOff className="w-8 h-8 opacity-50" />
            <span className="text-xs mt-2 opacity-70">Imagem indisponível</span>
          </div>
        )}

        {/* Imagem real - só carrega quando está na view */}
        {isInView && !showFallbackError && (
          <motion.img
            src={imageSrc}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            loading="lazy"
            decoding="async"
            style={{ y, scale }}
            className={cn(
              'absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ease-out',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={cn(
        'relative overflow-hidden rounded-xl',
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      {isInView && (
        <motion.img
          src={imageSrc}
          alt={alt}
          onError={handleError}
          loading="lazy"
          decoding="async"
          style={enableParallax ? { y, scale } : undefined}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
    </div>
  );
};
