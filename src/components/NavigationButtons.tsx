import { Car, Navigation, Map } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NavigationButtonsProps {
  establishmentId: string;
  establishmentName: string;
  address: string;
  latitude: number;
  longitude: number;
}

type AppName = 'uber' | '99' | 'waze' | 'maps';

export const NavigationButtons = ({
  establishmentId,
  establishmentName,
  address,
  latitude,
  longitude,
}: NavigationButtonsProps) => {
  
  // Fire-and-forget: registra o clique sem bloquear o usuário
  const trackNavigation = async (appName: AppName) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Não espera resposta - fire and forget
      supabase.from('navigation_logs').insert({
        establishment_id: establishmentId,
        app_name: appName,
        user_id: session?.user?.id || null,
      }).then(({ error }) => {
        if (error) {
          console.warn('Falha ao registrar navegação (silencioso):', error);
        }
      });
    } catch (error) {
      // Erro silencioso - não impacta o usuário
      console.warn('Erro ao rastrear navegação:', error);
    }
  };

  const handleNavigation = (appName: AppName, url: string) => {
    // 1. Registra o clique (não espera)
    trackNavigation(appName);
    
    // 2. Abre o link IMEDIATAMENTE
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Deep Links otimizados
  const getDeepLinks = () => {
    const encodedName = encodeURIComponent(establishmentName);
    const lat = latitude.toString();
    const lng = longitude.toString();

    return {
      uber: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodedName}`,
      '99': `https://99app.com/`, // Fallback web (deep link nnapp:// não funciona universal)
      waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
      maps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    };
  };

  const links = getDeepLinks();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-bold text-white">Como Chegar</h3>
      </div>

      {/* Grid 2x2 otimizado para mobile */}
      <div className="grid grid-cols-2 gap-3">
        {/* Uber - Preto */}
        <button
          onClick={() => handleNavigation('uber', links.uber)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-black border border-white/10 hover:border-white/30 transition-all active:scale-95 group"
        >
          <Car className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-white">Uber</span>
        </button>

        {/* 99 - Amarelo */}
        <button
          onClick={() => handleNavigation('99', links['99'])}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-amber-400 border border-amber-500 hover:border-amber-600 transition-all active:scale-95 group"
        >
          <Car className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-black">99</span>
        </button>

        {/* Waze - Azul Ciano */}
        <button
          onClick={() => handleNavigation('waze', links.waze)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-cyan-500 border border-cyan-600 hover:border-cyan-700 transition-all active:scale-95 group"
        >
          <Navigation className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-white">Waze</span>
        </button>

        {/* Google Maps - Verde */}
        <button
          onClick={() => handleNavigation('maps', links.maps)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-emerald-600 border border-emerald-700 hover:border-emerald-800 transition-all active:scale-95 group"
        >
          <Map className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-white">Google Maps</span>
        </button>
      </div>

      <p className="text-xs text-slate-500 text-center mt-3">
        📍 {address}
      </p>
    </div>
  );
};
