import { useState, useMemo } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type AspectRatioType = '4:3' | '16:9' | '1:1' | '3:4';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  aspectRatio?: AspectRatioType;
  sizes?: string;
  priority?: boolean; // Para imagens above-the-fold
}

const FALLBACK_IMAGE = '/placeholder-estabelecimento.png';

const aspectRatioClasses: Record<AspectRatioType, string> = {
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-[16/9]',
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
};

/**
 * Gera URL otimizada baseado no provider de imagens
 */
const getOptimizedUrl = (
  url: string, 
  width: number, 
  format: 'webp' | 'jpeg' = 'webp'
): string => {
  if (!url) return '';
  
  // Se for Supabase Storage
  if (url.includes('supabase.co') || url.includes('supabase.in')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&format=${format}&quality=80`;
  }
  
  // Se for Cloudinary
  if (url.includes('cloudinary.com')) {
    const formatStr = format === 'webp' ? 'f_webp' : 'f_jpg';
    return url.replace('/upload/', `/upload/w_${width},${formatStr},q_80/`);
  }
  
  // Se for Google Places
  if (url.includes('googleusercontent.com') || url.includes('places.googleapis.com')) {
    if (url.includes('maxwidth=')) {
      return url.replace(/maxwidth=\d+/, `maxwidth=${width}`);
    }
    return `${url}${url.includes('?') ? '&' : '?'}maxwidth=${width}`;
  }
  
  // URL genérica - retorna como está
  return url;
};

/**
 * Gera srcset para diferentes tamanhos de tela
 */
const generateSrcSet = (src: string, format: 'webp' | 'jpeg'): string => {
  const widths = [320, 480, 640, 800, 1024, 1280];
  return widths
    .map(w => `${getOptimizedUrl(src, w, format)} ${w}w`)
    .join(', ');
};

export const OptimizedImage = ({
  src,
  alt,
  className,
  fallbackSrc = FALLBACK_IMAGE,
  aspectRatio = '4:3',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Gerar srcsets memoizados
  const { webpSrcSet, jpegSrcSet, defaultSrc } = useMemo(() => ({
    webpSrcSet: generateSrcSet(src, 'webp'),
    jpegSrcSet: generateSrcSet(src, 'jpeg'),
    defaultSrc: getOptimizedUrl(src, 640, 'jpeg'),
  }), [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

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
              className="absolute inset-0 -translate-x-full animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
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

      {/* Picture com WebP + fallback JPEG */}
      {!hasError && (
        <picture>
          {/* WebP para navegadores modernos */}
          <source
            type="image/webp"
            srcSet={webpSrcSet}
            sizes={sizes}
          />
          
          {/* JPEG como fallback */}
          <source
            type="image/jpeg"
            srcSet={jpegSrcSet}
            sizes={sizes}
          />
          
          {/* Imagem padrão */}
          <img
            src={defaultSrc || fallbackSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        </picture>
      )}
    </div>
  );
};

export default OptimizedImage;
