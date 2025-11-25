import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { Navigation, X, MapPin, ArrowRight, Clock, ChevronDown, ChevronUp } from 'lucide-react';

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
  maxDistance?: number; // em km
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Gastronomia': '#8b5cf6',
  'Bares': '#ec4899',
  'Serviços': '#06b6d4',
  'Lazer': '#f59e0b',
  'default': '#6b7280',
};

// Função para calcular distância entre dois pontos (Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  establishments, 
  userLocation,
  onEstablishmentClick,
  maxDistance 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const clusterMarkers = useRef<mapboxgl.Marker[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [routeActive, setRouteActive] = useState(false);
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Filtrar estabelecimentos por distância
  const filteredEstablishments = React.useMemo(() => {
    if (!userLocation || !maxDistance) return establishments;
    
    return establishments.filter(est => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        est.latitude,
        est.longitude
      );
      return distance <= maxDistance;
    });
  }, [establishments, userLocation, maxDistance]);

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
        scale: 0.9,
      })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <p class="font-bold text-sm">📍 Você está aqui</p>
              </div>
            `)
        )
        .addTo(map.current);
    }

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      clusterMarkers.current.forEach(marker => marker.remove());
      clusterMarkers.current = [];
      map.current?.remove();
    };
  }, [userLocation]);

  // Atualizar clustering quando estabelecimentos ou zoom mudarem
  useEffect(() => {
    if (!map.current || filteredEstablishments.length === 0) return;

    // Configurar Supercluster
    const cluster = new Supercluster({
      radius: 60,
      maxZoom: 16,
      minPoints: 2,
    });

    // Preparar dados para clustering (formato GeoJSON)
    const points = filteredEstablishments.map(est => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        establishmentId: est.id,
        establishment: est,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [est.longitude, est.latitude],
      },
    }));

    cluster.load(points);

    const updateMarkers = () => {
      if (!map.current) return;

      const bounds = map.current.getBounds();
      const zoom = Math.floor(map.current.getZoom());

      // Limpar marcadores antigos
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      clusterMarkers.current.forEach(marker => marker.remove());
      clusterMarkers.current = [];

      // Obter clusters visíveis
      const clusters = cluster.getClusters(
        [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
        zoom
      );

      clusters.forEach((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const properties = feature.properties;

        if (properties.cluster) {
          // É um cluster
          const clusterEl = document.createElement('div');
          const count = properties.point_count;
          const size = count < 10 ? 40 : count < 50 ? 50 : 60;

          clusterEl.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, #8b5cf6, #ec4899);
            border: 3px solid white;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: ${count < 10 ? '14px' : '16px'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            transition: all 0.2s ease;
          `;
          clusterEl.textContent = count.toString();

          clusterEl.addEventListener('mouseenter', () => {
            clusterEl.style.transform = 'scale(1.15)';
          });
          clusterEl.addEventListener('mouseleave', () => {
            clusterEl.style.transform = 'scale(1)';
          });

          const marker = new mapboxgl.Marker({ element: clusterEl })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);

          // Click para expandir cluster
          clusterEl.addEventListener('click', () => {
            const expansionZoom = Math.min(
              cluster.getClusterExpansionZoom(properties.cluster_id),
              20
            );
            map.current!.easeTo({
              center: [longitude, latitude],
              zoom: expansionZoom,
            });
          });

          clusterMarkers.current.push(marker);
        } else {
          // É um estabelecimento individual
          const est = properties.establishment as Establishment;
          const color = CATEGORY_COLORS[est.category] || CATEGORY_COLORS.default;

          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.cssText = `
            width: 36px;
            height: 36px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            transition: all 0.2s ease;
            position: relative;
          `;

          // Ícone de categoria no centro
          el.innerHTML = `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 16px;">${getCategoryIcon(est.category)}</div>`;

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.2)';
            el.style.zIndex = '1000';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            el.style.zIndex = '1';
          });

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
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map.current!);

          el.addEventListener('click', () => {
            setSelectedEstablishment(est);
            if (onEstablishmentClick) {
              onEstablishmentClick(est.id);
            }
          });

          markers.current.push(marker);
        }
      });
    };

    // Atualizar marcadores quando o mapa se mover ou der zoom
    map.current.on('moveend', updateMarkers);
    map.current.on('zoomend', updateMarkers);
    
    // Primeira renderização
    updateMarkers();

    // Ajustar zoom inicial
    if (filteredEstablishments.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredEstablishments.forEach(est => {
        bounds.extend([est.longitude, est.latitude]);
      });
      
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude]);
      }

      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 15,
        duration: 1000,
      });
    }

    return () => {
      if (map.current) {
        map.current.off('moveend', updateMarkers);
        map.current.off('zoomend', updateMarkers);
      }
    };
  }, [filteredEstablishments, userLocation, onEstablishmentClick]);

  // Função auxiliar para ícone de categoria
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Gastronomia': '🍽️',
      'Bares': '🍺',
      'Serviços': '✂️',
      'Lazer': '🎬',
    };
    return icons[category] || '🏪';
  };

  // Função para traçar rota com instruções
  const drawRoute = async (destination: Establishment) => {
    if (!map.current || !userLocation) return;

    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&steps=true&language=pt&access_token=${mapboxgl.accessToken}`
      );
      const json = await query.json();
      
      if (!json.routes || json.routes.length === 0) {
        console.error('Nenhuma rota encontrada');
        return;
      }

      const data = json.routes[0];
      const route = data.geometry.coordinates;
      
      // Extrair instruções passo-a-passo
      const steps: RouteStep[] = data.legs[0].steps.map((step: any) => ({
        instruction: step.maneuver.instruction,
        distance: step.distance,
        duration: step.duration,
      }));

      setRouteSteps(steps);
      setTotalDistance(data.distance / 1000); // converter para km
      setTotalDuration(data.duration / 60); // converter para minutos

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
            'line-width': 5,
            'line-opacity': 0.85,
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
    setRouteSteps([]);
    setShowSteps(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-white/10">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Card de estabelecimento selecionado */}
      {selectedEstablishment && !showSteps && (
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
                <>
                  <button
                    onClick={() => setShowSteps(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <ArrowRight size={16} />
                    Ver Instruções
                  </button>
                  <button
                    onClick={clearRoute}
                    className="px-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
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

      {/* Instruções de navegação passo-a-passo */}
      {showSteps && routeSteps.length > 0 && (
        <div className="absolute inset-4 bg-slate-900/98 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300 z-10 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-600/20 to-pink-600/20">
            <div>
              <h3 className="font-bold text-white text-lg mb-1">Navegação até {selectedEstablishment?.name}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-violet-400" />
                  {totalDistance.toFixed(1)} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-violet-400" />
                  {Math.round(totalDuration)} min
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSteps(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Lista de instruções */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {routeSteps.map((step, index) => (
              <div 
                key={index}
                className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">{step.instruction}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{step.distance > 1000 ? `${(step.distance / 1000).toFixed(1)} km` : `${Math.round(step.distance)} m`}</span>
                    <span>•</span>
                    <span>{step.duration > 60 ? `${Math.round(step.duration / 60)} min` : `${Math.round(step.duration)} seg`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer com ações */}
          <div className="p-4 border-t border-white/10 flex gap-2">
            <button
              onClick={clearRoute}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-3 rounded-xl transition-colors"
            >
              Cancelar Navegação
            </button>
            <button
              onClick={() => setShowSteps(false)}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold py-3 rounded-xl transition-colors"
            >
              Ver Mapa
            </button>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default InteractiveMap;