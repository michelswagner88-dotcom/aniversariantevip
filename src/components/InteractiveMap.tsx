import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, X } from 'lucide-react';

interface Establishment {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  image: string;
  benefit: string;
  isOpen: boolean;
}

interface InteractiveMapProps {
  establishments: Establishment[];
  userLocation?: { latitude: number; longitude: number };
  onEstablishmentClick?: (id: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Gastronomia': '#8b5cf6',
  'Bares': '#ec4899',
  'Serviços': '#06b6d4',
  'Lazer': '#f59e0b',
  'default': '#6b7280',
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  establishments, 
  userLocation,
  onEstablishmentClick 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [routeActive, setRouteActive] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.error('Mapbox token não configurado');
      return;
    }

    mapboxgl.accessToken = token;
    
    // Inicializar mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: userLocation 
        ? [userLocation.longitude, userLocation.latitude]
        : [-48.5482, -27.5969], // Florianópolis default
      zoom: 13,
    });

    // Adicionar controles de navegação
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Adicionar marcador da localização do usuário
    if (userLocation) {
      new mapboxgl.Marker({
        color: '#10b981',
        scale: 0.8,
      })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <p class="font-bold text-sm">Você está aqui</p>
              </div>
            `)
        )
        .addTo(map.current);
    }

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [userLocation]);

  // Atualizar marcadores quando estabelecimentos mudarem
  useEffect(() => {
    if (!map.current) return;

    // Remover marcadores antigos
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Adicionar novos marcadores
    establishments.forEach(est => {
      if (!est.latitude || !est.longitude) return;

      const color = CATEGORY_COLORS[est.category] || CATEGORY_COLORS.default;

      // Criar elemento HTML customizado para o marcador
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        transition: all 0.2s ease;
      `;

      // Animação hover
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.zIndex = '1000';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      // Criar popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        maxWidth: '280px',
      }).setHTML(`
        <div class="bg-slate-900 text-white rounded-lg overflow-hidden">
          <img src="${est.image}" alt="${est.name}" class="w-full h-32 object-cover" />
          <div class="p-3">
            <h3 class="font-bold text-sm mb-1">${est.name}</h3>
            <p class="text-xs text-slate-400 mb-2">${est.category}</p>
            <div class="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1.5 rounded-full">
              <span class="font-bold">🎁 ${est.benefit}</span>
            </div>
            ${est.isOpen 
              ? '<div class="mt-2 flex items-center gap-1.5 text-xs text-emerald-400"><span class="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>Aberto</div>' 
              : '<div class="mt-2 text-xs text-slate-500">Fechado</div>'
            }
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([est.longitude, est.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Click no marcador
      el.addEventListener('click', () => {
        setSelectedEstablishment(est);
        if (onEstablishmentClick) {
          onEstablishmentClick(est.id);
        }
      });

      markers.current.push(marker);
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (establishments.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      establishments.forEach(est => {
        if (est.latitude && est.longitude) {
          bounds.extend([est.longitude, est.latitude]);
        }
      });
      
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude]);
      }

      map.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: 15,
        duration: 1000,
      });
    }
  }, [establishments, userLocation, onEstablishmentClick]);

  // Função para traçar rota
  const drawRoute = async (destination: Establishment) => {
    if (!map.current || !userLocation) return;

    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const json = await query.json();
      const data = json.routes[0];
      const route = data.geometry.coordinates;

      // Adicionar rota ao mapa
      if (map.current.getSource('route')) {
        (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route,
          },
        });
      } else {
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route,
              },
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#8b5cf6',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
      }

      setRouteActive(true);

      // Ajustar zoom para mostrar a rota
      const bounds = new mapboxgl.LngLatBounds();
      route.forEach((coord: [number, number]) => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 80 });
    } catch (error) {
      console.error('Erro ao traçar rota:', error);
    }
  };

  const clearRoute = () => {
    if (map.current && map.current.getLayer('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }
    setRouteActive(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-white/10">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Card de estabelecimento selecionado */}
      {selectedEstablishment && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 z-10">
          <button
            onClick={() => setSelectedEstablishment(null)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
          
          <div className="flex gap-3">
            <img 
              src={selectedEstablishment.image} 
              alt={selectedEstablishment.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm mb-1">{selectedEstablishment.name}</h3>
              <p className="text-xs text-slate-400 mb-2">{selectedEstablishment.category}</p>
              <div className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1.5 rounded-full w-fit">
                <span className="font-bold text-white">🎁 {selectedEstablishment.benefit}</span>
              </div>
            </div>
          </div>

          {userLocation && (
            <div className="mt-3 flex gap-2">
              {!routeActive ? (
                <button
                  onClick={() => drawRoute(selectedEstablishment)}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  <Navigation size={16} />
                  Ver Rota
                </button>
              ) : (
                <button
                  onClick={clearRoute}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  <X size={16} />
                  Limpar Rota
                </button>
              )}
              
              <button
                onClick={() => onEstablishmentClick?.(selectedEstablishment.id)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
              >
                Ver Detalhes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;