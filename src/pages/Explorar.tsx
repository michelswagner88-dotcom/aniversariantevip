import React, { useState, useEffect } from 'react';
import { MapPin, Search, SlidersHorizontal, List, Map as MapIcon, X, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- CONFIGURAÇÃO DOS ÍCONES DO MAPA ---
// Corrige o bug padrão dos ícones do Leaflet no React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Ícone Personalizado (Pino Roxo) ---
const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- Componente para Centralizar o Mapa ---
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

// --- DADOS MOCKADOS (Com Coordenadas Reais de Floripa) ---
const places = [
  { id: 1, name: "1929 Trattoria", category: "Gastronomia", location: "Centro", coords: [-27.5954, -48.5480], benefit: "Sobremesa Exclusiva", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80" },
  { id: 2, name: "Boteco Cascaes", category: "Bares", location: "Lagoa", coords: [-27.6054, -48.4600], benefit: "Drink Grátis", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80" },
  { id: 3, name: "Barbearia VIP", category: "Serviços", location: "Santa Mônica", coords: [-27.5880, -48.5150], benefit: "Corte + Cerveja", image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80" },
  { id: 4, name: "Cinemark", category: "Lazer", location: "Floripa Shopping", coords: [-27.5520, -48.4960], benefit: "Pipoca P", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80" },
];

// --- Componente Card (Lista) ---
const PlaceCard = ({ place }: any) => (
  <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-800 shadow-lg border border-white/5">
    <img src={place.image} alt={place.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
    <div className="absolute left-4 top-4">
      <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">{place.category}</span>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="font-plus-jakarta text-xl font-bold text-white">{place.name}</h3>
      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-300">
        <MapPin size={14} className="text-violet-400" /> <span>{place.location}</span>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg"><span className="text-sm">🎁</span></div>
        <div className="flex-1"><p className="text-[10px] font-bold uppercase text-violet-200">Ganhe</p><p className="font-bold text-white">{place.benefit}</p></div>
      </div>
    </div>
  </div>
);

const Explorar = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [locationText, setLocationText] = useState("Florianópolis, SC");
  
  // Centro Inicial do Mapa (Florianópolis)
  const mapCenter: [number, number] = [-27.5954, -48.5480];

  return (
    <div className="min-h-screen w-full bg-slate-950 pb-24 font-inter text-white">
      
      {/* Header Fixo */}
      <div className="sticky top-0 z-[1000] border-b border-white/5 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex gap-3">
          <button className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">
            <MapPin size={18} className="text-violet-400" /> <span className="truncate">{locationText}</span>
          </button>
          <button className="flex flex-[1.5] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            <Search size={18} /> <span>Buscar...</span>
          </button>
        </div>
        {/* Filtros aqui (omitidos para brevidade) */}
      </div>

      {/* --- ÁREA DE CONTEÚDO --- */}
      <div className="h-full w-full">
        
        {viewMode === 'list' ? (
          // VISTA DE LISTA
          <div className="px-4 pt-6 pb-24 grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
            {places.map(place => <PlaceCard key={place.id} place={place} />)}
          </div>
        ) : (
          // VISTA DE MAPA (Tela Cheia)
          <div className="relative h-[calc(100vh-140px)] w-full animate-in fade-in duration-500">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
              <ChangeView center={mapCenter} />
              
              {/* Mapa Base (Dark Mode Style - CartoDB DarkMatter) */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Pinos dos Lugares */}
              {places.map(place => (
                <Marker key={place.id} position={place.coords as [number, number]} icon={customIcon}>
                  <Popup className="custom-popup">
                    <div className="flex flex-col gap-2 p-1">
                      <img src={place.image} className="h-24 w-full rounded-lg object-cover" />
                      <div>
                        <h3 className="font-bold text-slate-900">{place.name}</h3>
                        <p className="text-xs text-violet-600 font-bold">🎁 {place.benefit}</p>
                        <button className="mt-2 w-full rounded-md bg-violet-600 py-1 text-xs font-bold text-white">Ver Detalhes</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Botão de Recentralizar */}
            <button className="absolute bottom-28 right-4 z-[400] rounded-full bg-slate-900 p-3 text-white shadow-xl border border-white/10">
              <Navigation size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Botão Flutuante Alternar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000]">
        <button 
          onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
          className="flex items-center gap-2 rounded-full bg-slate-900/90 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-md active:scale-95 transition-transform"
        >
          {viewMode === 'list' ? <><MapIcon size={18} /> Ver no Mapa</> : <><List size={18} /> Ver Lista</>}
        </button>
      </div>

    </div>
  );
};

export default Explorar;
