import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SafeImage } from "@/components/SafeImage";
import { FlashPromo } from "@/hooks/useFlashPromos";
import { useEffect, useState } from "react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";

interface FlashDealCardProps {
  promo: FlashPromo;
}

export const FlashDealCard = ({ promo }: FlashDealCardProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(promo.expires_at).getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft("Expirado");
        return;
      }

      // Calcular horas, minutos e segundos
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Marcar como urgente se faltar menos de 6 horas
      setIsUrgent(hours < 6);

      // Formato condicional
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [promo.expires_at]);

  const handleClaim = () => {
    const url = getEstabelecimentoUrl({
      estado: promo.estado,
      cidade: promo.cidade,
      slug: promo.estabelecimentos?.slug,
      id: promo.estabelecimento_id
    });
    navigate(url);
  };

  return (
    <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-br from-orange-500/10 via-violet-500/10 to-pink-500/10 hover:border-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-orange-500/25">
      {/* Animated Border Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-violet-500 to-pink-500 opacity-20 blur-xl" />
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {promo.estabelecimentos?.logo_url && (
              <SafeImage 
                src={promo.estabelecimentos.logo_url} 
                alt={promo.estabelecimentos.nome_fantasia || "Logo"}
                className="w-12 h-12 rounded-lg object-cover border border-white/10"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">
                {promo.estabelecimentos?.nome_fantasia || "Estabelecimento"}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="w-3 h-3" />
                <span>{promo.cidade}, {promo.estado}</span>
              </div>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={`${
              isUrgent 
                ? "bg-orange-500/20 text-orange-300 border-orange-500/50 animate-pulse" 
                : "bg-violet-500/20 text-violet-300 border-violet-500/50"
            } font-bold whitespace-nowrap`}
          >
            <Zap className="w-3 h-3 mr-1" />
            FLASH
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Oferta Principal */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5">
          <h4 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {promo.title}
          </h4>
          <p className="text-sm text-slate-300 line-clamp-3">
            {promo.description}
          </p>
        </div>

        {/* Countdown Timer - ELEMENTO CRÍTICO */}
        <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg ${
          isUrgent 
            ? "bg-orange-500/20 border border-orange-500/50" 
            : "bg-violet-500/20 border border-violet-500/50"
        }`}>
          <Clock className={`w-5 h-5 ${isUrgent ? "text-orange-400" : "text-violet-400"}`} />
          <span className={`font-mono font-bold text-lg ${
            isUrgent ? "text-orange-300" : "text-violet-300"
          }`}>
            {timeLeft}
          </span>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleClaim}
          className="w-full bg-gradient-to-r from-orange-500 via-violet-500 to-pink-500 hover:from-orange-600 hover:via-violet-600 hover:to-pink-600 text-white font-bold py-6 text-lg shadow-lg shadow-orange-500/25"
        >
          ⚡ Pegar Agora
        </Button>

        {/* Social Proof */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>{promo.views_count} visualizações</span>
          <span>{promo.claims_count} pessoas pegaram</span>
        </div>
      </CardContent>
    </Card>
  );
};