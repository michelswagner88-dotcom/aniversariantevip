import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, TrendingUp, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'radar' | 'flash-promo';
}

const featureConfig = {
  radar: {
    title: "Inteligência de Mercado Exclusiva",
    description: "Descubra quantos aniversariantes fazem aniversário na sua região e prepare-se para a alta demanda.",
    icon: TrendingUp,
    benefits: [
      "📊 Previsão de demanda em tempo real",
      "📈 Análise de tendências e sazonalidade", 
      "🎯 Planejamento estratégico baseado em dados",
      "⚡ Notificações de picos de oportunidade"
    ],
    ctaText: "Desbloquear Radar de Inteligência"
  },
  'flash-promo': {
    title: "Apareça na Aba de Ofertas Hoje",
    description: "Estabelecimentos Gold podem publicar ofertas relâmpago e aparecer em destaque para todos os usuários da sua cidade.",
    icon: Zap,
    benefits: [
      "⚡ Visibilidade instantânea para milhares de usuários",
      "🔥 Destaque na aba 'Ofertas Relâmpago'",
      "🎯 Segmentação geográfica automática",
      "📱 Notificações push para usuários próximos"
    ],
    ctaText: "Upgrade e Publicar Oferta Agora"
  }
};

export const UpsellModal = ({ isOpen, onClose, feature }: UpsellModalProps) => {
  const navigate = useNavigate();
  const config = featureConfig[feature];
  const Icon = config.icon;

  const handleUpgrade = () => {
    navigate('/planos-pagamento');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
        <DialogHeader>
          {/* Premium Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">PLANO GOLD</span>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30">
              <Icon className="w-8 h-8 text-violet-400" />
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-center text-white">
            {config.title}
          </DialogTitle>
          
          <DialogDescription className="text-center text-slate-400 mt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Benefits List */}
        <div className="space-y-3 my-6">
          {config.benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
              <span className="text-sm text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Pricing Teaser */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">A partir de</p>
              <p className="text-2xl font-bold text-white">
                R$ 99<span className="text-sm text-slate-400">/mês</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-amber-400 font-medium">Vantagem competitiva</p>
              <p className="text-xs text-slate-400">injusta sobre concorrentes</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold py-6 text-base shadow-lg shadow-amber-500/25"
          >
            <Crown className="w-5 h-5 mr-2" />
            {config.ctaText}
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            Continuar com Plano Gratuito
          </Button>
        </div>

        {/* Trust Badge */}
        <p className="text-center text-xs text-slate-500 mt-4">
          🔒 Pagamento seguro • Cancele quando quiser
        </p>
      </DialogContent>
    </Dialog>
  );
};