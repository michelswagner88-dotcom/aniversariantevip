import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Flame, Snowflake, Activity, Lock, Crown, Zap, Calendar, Users } from "lucide-react";
import { useBirthdayForecast } from "@/hooks/useBirthdayForecast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FeatureGuard } from "@/components/FeatureGuard";
import { UpsellModal } from "@/components/UpsellModal";
import { Badge } from "@/components/ui/badge";
import { CreateFlashPromo } from "./CreateFlashPromo";

interface RadarOportunidadesProps {
  cidade: string;
  estado: string;
  userPlan: string | null;
  estabelecimentoId: string;
}

export const RadarOportunidades = ({ cidade, estado, userPlan, estabelecimentoId }: RadarOportunidadesProps) => {
  const [showUpsell, setShowUpsell] = useState(false);
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const { data: forecast, isLoading, error } = useBirthdayForecast({cidade, estado});

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  if (!forecast || error) {
    return null;
  }

  const { next_7_days, next_30_days, trend, status } = forecast;

  // Configuração visual baseada no status
  const statusConfig = status === 'hot' ? {
    icon: <Flame className="w-5 h-5" />,
    label: "Alta Demanda",
    badgeClass: "bg-red-500/20 text-red-300 border-red-500/50",
    borderClass: "border-red-500/50",
    bgClass: "bg-red-500/20",
  } : status === 'cold' ? {
    icon: <Snowflake className="w-5 h-5" />,
    label: "Baixa Demanda",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    borderClass: "border-blue-500/50",
    bgClass: "bg-blue-500/20",
  } : {
    icon: <Activity className="w-5 h-5" />,
    label: "Estável",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/50",
    borderClass: "border-violet-500/50",
    bgClass: "bg-violet-500/20",
  };

  // Fallback: Conteúdo Bloqueado para não-premium
  const LockedContent = (
    <Card className="relative overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
      {/* Blur Background Effect */}
      <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/80 z-10" />
      
      {/* Lock Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30">
          <Lock className="w-12 h-12 text-amber-400" />
        </div>
      </div>

      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300">📡 Radar de Oportunidades</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-xs font-bold text-amber-300">
            <Crown className="w-3 h-3 inline mr-1" />
            GOLD
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Teaser Data (Blurred/Limited) */}
        <div className="space-y-3 filter blur-sm select-none pointer-events-none">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Próximos 7 dias</p>
              <p className="text-3xl font-bold text-white">{next_7_days}+</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Próximos 30 dias</p>
              <p className="text-3xl font-bold text-white">{next_30_days}+</p>
            </div>
          </div>
        </div>

        {/* Unlock Message */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-4 mt-6 relative z-30">
          <h4 className="text-white font-bold mb-2">🔥 Detectamos alta demanda na sua região!</h4>
          <p className="text-slate-300 text-sm mb-4">
            Desbloqueie dados completos de inteligência de mercado para planejar estratégias vencedoras.
          </p>
          <Button 
            onClick={() => setShowUpsell(true)}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold shadow-lg shadow-amber-500/25"
          >
            <Crown className="w-4 h-4 mr-2" />
            Desbloquear Inteligência de Mercado
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Conteúdo Real (Premium)
  const UnlockedContent = (
    <Card className={cn(
      "relative overflow-hidden border-2 transition-all duration-300",
      statusConfig.borderClass
    )}>
      {/* Glow Effect */}
      <div className={cn(
        "absolute inset-0 opacity-20 blur-xl",
        statusConfig.bgClass
      )} />

      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" />
            <span className="text-white">📡 Radar de Oportunidades</span>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            statusConfig.badgeClass
          )}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </div>
        </CardTitle>
        <p className="text-xs text-slate-400">Inteligência Preditiva • {cidade}, {estado}</p>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-slate-500 mt-1">oportunidades</p>
              </div>
              <Users className="w-10 h-10 text-fuchsia-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Insight Estratégico */}
        <div className="p-4 rounded-xl bg-black/20 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500">
              {status === 'hot' ? <TrendingUp className="w-4 h-4 text-white" /> : 
               status === 'cold' ? <TrendingDown className="w-4 h-4 text-white" /> :
               <Minus className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">
                {status === 'hot' ? '🔥 Alta Demanda: O movimento vai aumentar! Prepare-se.' :
                 status === 'cold' ? '📉 Semana Calma: Ótimo momento para atrair clientes com ofertas agressivas.' :
                 '📊 Demanda Estável: Fluxo consistente de clientes esperado.'}
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

        {/* CTA */}
        <Button
          onClick={() => setShowCreatePromo(true)}
          className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/30 text-base font-bold"
          size="lg"
        >
          <Zap className="w-5 h-5 mr-2" />
          Ativar Promoção Relâmpago
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <>
      <FeatureGuard
        requiredPlan="active"
        userPlan={userPlan}
        fallback={LockedContent}
      >
        {UnlockedContent}
      </FeatureGuard>

      <UpsellModal 
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        feature="radar"
      />

      <CreateFlashPromo
        isOpen={showCreatePromo}
        onClose={() => setShowCreatePromo(false)}
        estabelecimentoId={estabelecimentoId}
        cidade={cidade}
        estado={estado}
        userPlan={userPlan}
      />
    </>
  );
};