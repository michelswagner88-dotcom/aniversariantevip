import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FlashDealCard } from "@/components/FlashDealCard";
import { useFlashPromos } from "@/hooks/useFlashPromos";
import { Loader2, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CityCombobox } from "@/components/CityCombobox";
import { supabase } from "@/integrations/supabase/client";

const FlashDeals = () => {
  const navigate = useNavigate();
  const [selectedCidade, setSelectedCidade] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [userLocation, setUserLocation] = useState<{ cidade: string; estado: string } | null>(null);

  const { data: promos, isLoading } = useFlashPromos({
    cidade: selectedCidade || userLocation?.cidade,
    estado: selectedEstado || userLocation?.estado,
  });

  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: aniversariante } = await supabase
        .from('aniversariantes')
        .select('cidade, estado')
        .eq('id', user.id)
        .single();
      
      if (aniversariante?.cidade && aniversariante?.estado) {
        setUserLocation({
          cidade: aniversariante.cidade,
          estado: aniversariante.estado
        });
      }
    }
  };

  const handleCitySelect = (cidade: string, estado: string) => {
    setSelectedCidade(cidade);
    setSelectedEstado(estado);
  };

  const clearFilters = () => {
    setSelectedCidade("");
    setSelectedEstado("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 pb-20 sm:pb-0">
      <Header />

      {/* Hero com Busca Compacta */}
      <div className="pt-24 pb-8 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/50 bg-orange-500/10 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Ofertas por Tempo Limitado</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Ofertas <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-violet-400 to-pink-400">Relâmpago</span> ⚡
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Promoções exclusivas por tempo limitado. Pegue antes que acabem!
          </p>

          {/* Busca por Cidade */}
          <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-4 border border-white/10 max-w-xl mx-auto">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <CityCombobox
                value={selectedCidade && selectedEstado ? `${selectedCidade}, ${selectedEstado}` : ""}
                onSelect={handleCitySelect}
                placeholder="Filtrar por cidade..."
                className="border-none bg-transparent shadow-none h-auto p-0 hover:bg-transparent flex-1"
              />
              {(selectedCidade || selectedEstado) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-400 hover:text-white"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Ofertas */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
          ) : promos && promos.length > 0 ? (
            <div className="space-y-6">
              {promos.map((promo) => (
                <FlashDealCard key={promo.id} promo={promo} />
              ))}
            </div>
          ) : (
            /* Empty State com Carol */
            <div className="text-center py-20 space-y-6">
              <div className="text-6xl">🕵️‍♀️</div>
              <h2 className="text-2xl font-bold text-white">
                Nenhuma oferta relâmpago agora...
              </h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Mas nossos parceiros estão preparando surpresas! Ative as notificações para ser o primeiro a saber.
              </p>
              
              <div className="pt-6">
                <Button 
                  onClick={() => navigate("/explorar")}
                  className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:from-violet-700 hover:via-fuchsia-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-lg"
                >
                  Ver Lugares Recomendados
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FlashDeals;