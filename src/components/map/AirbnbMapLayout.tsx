import React, { useState, useRef, useCallback, useMemo } from 'react';
import { MapPin, X, Navigation, Loader2, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MapDesktopSplit } from './MapDesktopSplit';
import { MapMobileFullscreen } from './MapMobileFullscreen';

export interface Establishment {
  id: string;
  nome_fantasia: string;
  categoria: string[];
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  descricao_beneficio: string;
  cidade: string;
  estado: string;
  slug: string | null;
}

interface AirbnbMapLayoutProps {
  establishments: Establishment[];
  onEstablishmentClick: (establishment: Establishment) => void;
  userLocation?: { lat: number; lng: number } | null;
  children: React.ReactNode;
  showMap?: boolean;
  listHeader?: React.ReactNode;
  className?: string;
}

export const AirbnbMapLayout: React.FC<AirbnbMapLayoutProps> = ({
  establishments,
  onEstablishmentClick,
  userLocation,
  children,
  showMap = true,
  listHeader,
  className,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filtrar estabelecimentos com coordenadas válidas
  const validEstablishments = useMemo(() => 
    establishments.filter(est => 
      est.latitude && 
      est.longitude && 
      est.latitude !== 0 && 
      est.longitude !== 0
    ), [establishments]
  );

  // Scroll para card quando clicar no pin
  const scrollToCard = useCallback((id: string) => {
    const cardElement = cardRefs.current[id];
    if (cardElement) {
      cardElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Highlight temporário
      cardElement.classList.add('ring-2', 'ring-violet-500', 'ring-offset-2', 'ring-offset-slate-950');
      setTimeout(() => {
        cardElement.classList.remove('ring-2', 'ring-violet-500', 'ring-offset-2', 'ring-offset-slate-950');
      }, 2000);
    }
  }, []);

  // Handler quando clicar no pin do mapa
  const handlePinClick = useCallback((id: string) => {
    scrollToCard(id);
    setHoveredId(id);
  }, [scrollToCard]);

  // Verificar se API key está disponível
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidEstablishments = validEstablishments.length > 0;
  const canShowMap = showMap && apiKey && hasValidEstablishments;

  // Context para passar para os cards filhos
  const contextValue = useMemo(() => ({
    cardRefs,
    hoveredId,
    setHoveredId,
  }), [hoveredId]);

  return (
    <div className={cn("relative", className)}>
      {/* DESKTOP: Split View (≥1024px) */}
      {canShowMap && (
        <div className="hidden lg:block">
          <MapDesktopSplit
            establishments={validEstablishments}
            onEstablishmentClick={onEstablishmentClick}
            userLocation={userLocation}
            hoveredId={hoveredId}
            onPinClick={handlePinClick}
            onPinHover={setHoveredId}
            listHeader={listHeader}
            cardRefs={cardRefs}
            onCardHover={setHoveredId}
          >
            {children}
          </MapDesktopSplit>
        </div>
      )}

      {/* Desktop fallback quando não pode mostrar mapa */}
      {!canShowMap && (
        <div className="hidden lg:block">
          {listHeader}
          {children}
        </div>
      )}

      {/* MOBILE/TABLET: Lista + FAB (< 1024px) */}
      <div className="lg:hidden">
        {listHeader}
        {children}
        
        {/* FAB para abrir mapa */}
        {canShowMap && (
          <Button
            onClick={() => setIsMapOpen(true)}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 shadow-2xl px-6 py-6 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/10 hover:bg-slate-800/90 hover:scale-105 active:scale-95 flex items-center gap-2 transition-all duration-200"
          >
            <MapPin className="w-5 h-5 text-violet-400" />
            <span className="font-semibold">Ver Mapa</span>
          </Button>
        )}

        {/* Mapa fullscreen mobile */}
        {canShowMap && isMapOpen && (
          <MapMobileFullscreen
            establishments={validEstablishments}
            onEstablishmentClick={onEstablishmentClick}
            userLocation={userLocation}
            onClose={() => setIsMapOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

// Context para compartilhar refs dos cards
export const MapCardContext = React.createContext<{
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
} | null>(null);

export const useMapCardContext = () => {
  return React.useContext(MapCardContext);
};
