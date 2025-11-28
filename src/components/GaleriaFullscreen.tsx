import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Props {
  fotos: string[];
  indexInicial: number;
  isOpen: boolean;
  onClose: () => void;
}

const GaleriaFullscreen = ({ fotos, indexInicial, isOpen, onClose }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(indexInicial);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCurrentIndex(indexInicial);
    setZoom(1);
  }, [indexInicial, isOpen]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < fotos.length - 1) setCurrentIndex(i => i + 1);
    },
    onSwipedRight: () => {
      if (currentIndex > 0) setCurrentIndex(i => i - 1);
    },
    trackMouse: true,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(fotos.length - 1, i + 1));
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fotos.length, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full h-screen p-0 bg-black/95 backdrop-blur-xl border-0">
        <div className="relative w-full h-full flex items-center justify-center" {...handlers}>
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Contador */}
          <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {fotos.length}
          </div>

          {/* Controles de zoom */}
          <div className="absolute bottom-24 right-4 z-50 flex flex-col gap-2">
            <button
              onClick={() => setZoom(z => Math.max(1, z - 0.5))}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={zoom <= 1}
              aria-label="Diminuir zoom"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.5))}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={zoom >= 3}
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Imagem */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={fotos[currentIndex]}
              alt={`Foto ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>

          {/* Navegação */}
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(i => i - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {currentIndex < fotos.length - 1 && (
            <button
              onClick={() => setCurrentIndex(i => i + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 overflow-x-auto max-w-full px-4">
            {fotos.map((foto, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  index === currentIndex ? 'border-violet-500 scale-110' : 'border-white/20 opacity-60'
                }`}
              >
                <img
                  src={foto}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GaleriaFullscreen;
