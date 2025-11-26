import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBirthdayForecast } from '@/hooks/useBirthdayForecast';
import { Loader2, TrendingUp, TrendingDown, Minus, Zap, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RadarOportunidadesProps {
  cidade: string;
  estado: string;
}

export const RadarOportunidades = ({ cidade, estado }: RadarOportunidadesProps) => {
  const { data: forecast, isLoading } = useBirthdayForecast({ cidade, estado });
  const [showPromoModal, setShowPromoModal] = useState(false);

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-violet-950/40 via-slate-900/50 to-fuchsia-950/40 border-violet-500/30">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          <span className="ml-3 text-slate-400">Analisando mercado...</span>
        </div>
      </Card>
    );
  }

  if (!forecast || forecast.error) {
    return null;
  }

  const { next_7_days, next_30_days, trend, status } = forecast;

  // Determinar estilo visual baseado no status
  const getStatusConfig = () => {
    switch (status) {
      case 'hot':
        return {
          gradient: 'from-red-950/40 via-orange-950/40 to-yellow-950/40',
          border: 'border-red-500/40',
          icon: <TrendingUp className="w-6 h-6 text-red-400" />,
          iconBg: 'bg-red-500/20',
          badge: { text: 'ALTA DEMANDA', variant: 'destructive' as const },
          message: '🔥 Alta Demanda: O movimento vai aumentar! Prepare-se.',
          description: 'Essa é a hora de maximizar sua capacidade e oferecer experiências memoráveis.',
        };
      case 'cold':
        return {
          gradient: 'from-blue-950/40 via-slate-900/50 to-cyan-950/40',
          border: 'border-blue-500/30',
          icon: <TrendingDown className="w-6 h-6 text-blue-400" />,
          iconBg: 'bg-blue-500/20',
          badge: { text: 'SEMANA CALMA', variant: 'secondary' as const },
          message: '📉 Semana Calma: Ótimo momento para atrair clientes com ofertas agressivas.',
          description: 'Crie promoções especiais para aumentar o movimento durante períodos mais tranquilos.',
        };
      default: // stable
        return {
          gradient: 'from-violet-950/40 via-slate-900/50 to-fuchsia-950/40',
          border: 'border-violet-500/30',
          icon: <Minus className="w-6 h-6 text-violet-400" />,
          iconBg: 'bg-violet-500/20',
          badge: { text: 'DEMANDA ESTÁVEL', variant: 'outline' as const },
          message: '📊 Demanda Estável: Fluxo consistente de clientes esperado.',
          description: 'Mantenha o padrão de qualidade e aproveite para fidelizar seus clientes.',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <Card className={`p-6 bg-gradient-to-br ${statusConfig.gradient} ${statusConfig.border} border-2 shadow-2xl relative overflow-hidden`}>
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${statusConfig.iconBg}`}>
                {statusConfig.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  📡 Radar de Oportunidades
                </h3>
                <p className="text-xs text-slate-400">Inteligência Preditiva • {cidade}, {estado}</p>
              </div>
            </div>
            <Badge {...statusConfig.badge}>{statusConfig.badge.text}</Badge>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Próximos 7 dias</p>
                  <p className="text-3xl font-bold text-white">{next_7_days}</p>
                  <p className="text-xs text-slate-500 mt-1">aniversariantes VIP</p>
                </div>
                <Calendar className="w-10 h-10 text-violet-400 opacity-50" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Próximos 30 dias</p>
                  <p className="text-3xl font-bold text-white">{next_30_days}</p>
                  <p className="text-xs text-slate-500 mt-1">oportunidades totais</p>
                </div>
                <Users className="w-10 h-10 text-fuchsia-400 opacity-50" />
              </div>
            </div>
          </div>

          {/* Insight Estratégico */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/10 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white mb-1">
                  {statusConfig.message}
                </p>
                <p className="text-xs text-slate-400">
                  {statusConfig.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-500">Tendência vs. semana anterior:</span>
                  <Badge variant="outline" className="text-xs">
                    {trend}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <Button
            onClick={() => setShowPromoModal(true)}
            className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/30 text-base font-bold"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Ativar Promoção Relâmpago
          </Button>
        </div>
      </Card>

      {/* Modal de Promoção */}
      <Dialog open={showPromoModal} onOpenChange={setShowPromoModal}>
        <DialogContent className="bg-slate-900 border-violet-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Promoção Relâmpago
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Oportunidade exclusiva para alcançar <span className="text-violet-400 font-bold">{next_7_days} aniversariantes</span> na sua região
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-violet-950/50 to-fuchsia-950/50 border border-violet-500/30">
              <h4 className="text-white font-semibold mb-2">💡 Como funciona?</h4>
              <p className="text-sm text-slate-400">
                Edite seu benefício atual ou crie uma oferta especial mais agressiva para capturar essa demanda em alta. 
                Lembre-se: aniversariantes nunca vêm sozinhos!
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowPromoModal(false);
                  // Navegar para edição de benefícios (implementar depois)
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
              >
                ✏️ Editar Benefício Atual
              </Button>
              
              <Button
                onClick={() => setShowPromoModal(false)}
                variant="outline"
                className="w-full border-white/10 hover:bg-white/5"
              >
                Voltar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
