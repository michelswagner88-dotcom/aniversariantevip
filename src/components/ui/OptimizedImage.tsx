import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type AspectRatioType = '4:3' | '16:9' | '1:1' | '3:4';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  aspectRatio?: AspectRatioType;
}

const FALLBACK_IMAGE = '/placeholder-estabelecimento.png';

const aspectRatioClasses: Record<AspectRatioType, string> = {
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-[16/9]',
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
};

export const OptimizedImage = ({
  src,
  alt,
  className,
  fallbackSrc = FALLBACK_IMAGE,
  aspectRatio = '4:3',
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <div className={cn(
      'relative overflow-hidden bg-slate-800 rounded-xl',
      aspectRatioClasses[aspectRatio],
      className
    )}>
      {/* Skeleton com shimmer premium - mostra enquanto carrega */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
          {/* Shimmer animado */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
              }}
            />
          </div>
          {/* Ícone central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-slate-600 opacity-50" 
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

      {/* Fallback elegante se imagem falhar */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 text-slate-500">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs opacity-75">Imagem indisponível</span>
        </div>
      )}

      {/* Imagem real */}
      {!hasError && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
