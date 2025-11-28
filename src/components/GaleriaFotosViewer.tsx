import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import GaleriaFullscreen from './GaleriaFullscreen';

interface GaleriaFotosViewerProps {
  fotoPrincipal: string | null;
  galeriaFotos: string[];
}

const GaleriaFotosViewer = ({ fotoPrincipal, galeriaFotos }: GaleriaFotosViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const todasFotos = [fotoPrincipal, ...(galeriaFotos || [])].filter(Boolean);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex(i => Math.min(i + 1, todasFotos.length - 1)),
    onSwipedRight: () => setCurrentIndex(i => Math.max(i - 1, 0)),
    trackMouse: true,
  });

  if (todasFotos.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div {...handlers} className="relative select-none">
        {/* Foto atual */}
        <div 
          className="aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
          onClick={() => {
            setFullscreenIndex(currentIndex);
            setFullscreenOpen(true);
          }}
        >
          <img 
            src={todasFotos[currentIndex]} 
            alt={`Foto ${currentIndex + 1} do estabelecimento`}
            className="w-full h-full object-cover"
          />
        </div>
      
      {/* Indicadores de posição (bolinhas) */}
      {todasFotos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {todasFotos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Ver foto ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Setas de navegação */}
      {todasFotos.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex(i => i === 0 ? todasFotos.length - 1 : i - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setCurrentIndex(i => i === todasFotos.length - 1 ? 0 : i + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}
      
      {/* Contador */}
      {todasFotos.length > 1 && (
        <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
          {currentIndex + 1}/{todasFotos.length}
        </span>
      )}
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
