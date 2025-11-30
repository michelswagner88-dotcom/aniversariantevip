import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import GaleriaFullscreen from './GaleriaFullscreen';

interface GaleriaFotosViewerProps {
  fotoPrincipal: string | null;
  galeriaFotos: string[];
}

const GaleriaFotosViewer = ({ fotoPrincipal, galeriaFotos }: GaleriaFotosViewerProps) => {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const todasFotos = [fotoPrincipal, ...(galeriaFotos || [])].filter(Boolean);
  
  if (todasFotos.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  }

  // Máximo de 4 fotos visíveis no grid
  const maxVisivel = 4;
  const fotosVisiveis = todasFotos.slice(0, maxVisivel);
  const fotosExtras = todasFotos.length - maxVisivel;

  return (
    <>
      {/* Grid de Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {fotosVisiveis.map((foto, index) => (
          <button
            key={index}
            onClick={() => {
              setFullscreenIndex(index);
              setFullscreenOpen(true);
            }}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-violet-500 transition-all duration-300 group cursor-pointer"
          >
            {/* Skeleton com shimmer - aparece até imagem carregar */}
            {!loadedImages[index] && (
              <div className="absolute inset-0 bg-muted overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
            )}
            
            <img 
              src={foto} 
              alt={`Foto ${index + 1} do estabelecimento`}
              onLoad={() => setLoadedImages(prev => ({ ...prev, [index]: true }))}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                loadedImages[index] ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
            />
            
            {/* Overlay "+X" na última foto se houver mais */}
            {index === maxVisivel - 1 && fotosExtras > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/70">
                <span className="text-white text-lg font-bold">+{fotosExtras}</span>
              </div>
            )}
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {/* Modal Fullscreen */}
      <GaleriaFullscreen
        fotos={todasFotos as string[]}
        indexInicial={fullscreenIndex}
        isOpen={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
      />
    </>
  );
};

export default GaleriaFotosViewer;
