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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/50 bg-yellow-500/10 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-300">Ofertas exclusivas que expiram em 24 horas</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-yellow-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">Relâmpago</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Promoções exclusivas por tempo limitado. Pegue antes que acabem!
          </p>

          {/* Busca por Cidade */}
          <div className="backdrop-blur-2xl bg-white/5 rounded-2xl p-4 border border-yellow-500/20 max-w-xl mx-auto">
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
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
            </div>
          ) : promos && promos.length > 0 ? (
            <div className="space-y-6">
              {promos.map((promo) => (
                <FlashDealCard key={promo.id} promo={promo} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Zap className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Nenhuma oferta no momento
              </h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Volte em breve! Novas ofertas relâmpago aparecem a qualquer momento.
              </p>
              
              <div className="pt-6">
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-black font-bold px-8 py-6 text-lg"
                >
                  ⚡ Ver Lugares Recomendados
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