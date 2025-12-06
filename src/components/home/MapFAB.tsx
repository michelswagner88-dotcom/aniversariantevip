import { useState } from 'react';
import { Map, X } from 'lucide-react';
import { MapaEstabelecimentos } from '@/components/MapaEstabelecimentos';
import { cn } from '@/lib/utils';

interface MapFABProps {
  estabelecimentos: any[];
  className?: string;
}

export const MapFAB = ({ estabelecimentos, className }: MapFABProps) => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Filtrar estabelecimentos com coordenadas válidas
  const estabelecimentosComCoordenadas = estabelecimentos.filter(
    est => est.latitude && est.longitude && est.latitude !== 0
  );

  if (estabelecimentosComCoordenadas.length === 0) return null;

  return (
    <>
      {/* FAB Button - visível apenas no mobile */}
      <button
        onClick={() => setIsMapOpen(true)}
        className={cn(
          "fixed bottom-24 left-1/2 -translate-x-1/2 z-40",
          "flex items-center gap-2 px-5 py-3",
          "bg-slate-900 dark:bg-white text-white dark:text-slate-900",
          "rounded-full shadow-lg hover:shadow-xl",
          "font-medium text-sm",
          "transition-all hover:scale-105 active:scale-95",
          "md:hidden", // Oculto no desktop
          className
        )}
      >
        <Map className="w-4 h-4" />
        <span>Mostrar mapa</span>
      </button>

      {/* Modal de Mapa Fullscreen */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950">
          {/* Header do mapa */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-white dark:from-slate-950 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Mapa
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {estabelecimentosComCoordenadas.length} lugares
                </p>
              </div>
              <button
                onClick={() => setIsMapOpen(false)}
                className="flex items-center justify-center w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <X className="w-5 h-5 text-slate-900 dark:text-white" />
              </button>
            </div>
          </div>

          {/* Mapa */}
          <MapaEstabelecimentos
            estabelecimentos={estabelecimentosComCoordenadas}
            height="100vh"
          />

          {/* Botão de fechar no rodapé */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={() => setIsMapOpen(false)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-lg font-medium hover:scale-105 transition-transform"
            >
              <span>Mostrar lista</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};