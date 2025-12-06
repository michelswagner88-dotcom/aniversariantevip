import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const imageSrc = hasError ? fallbackSrc : src;

  // Intersection Observer para lazy loading
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
      { rootMargin: '100px', threshold: 0.01 }
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

  if (showSkeleton) {
    return (
      <div 
        ref={containerRef}
        className={cn('relative overflow-hidden bg-slate-800', aspectRatioClasses[aspectRatio], className)}
      >
        {/* Blur placeholder + skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
            {/* Animated shimmer overlay */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                }}
              />
            </div>
            {/* Blurred preview icon */}
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <svg 
                className="w-10 h-10 text-slate-400 dark:text-slate-600 opacity-50" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>
        )}

        {/* Actual image with parallax */}
        {isInView && (
          <motion.img
            src={imageSrc}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={() => { setHasError(true); setIsLoaded(true); }}
            loading="lazy"
            decoding="async"
            style={{ y, scale }}
            className={cn(
              'absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      {isInView && (
        <motion.img
          src={imageSrc}
          alt={alt}
          onError={() => setHasError(true)}
          loading="lazy"
          decoding="async"
          style={enableParallax ? { y, scale } : undefined}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
    </div>
  );
};
