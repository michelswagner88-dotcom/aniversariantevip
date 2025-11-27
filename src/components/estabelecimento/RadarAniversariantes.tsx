import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBirthdayForecast } from "@/hooks/useBirthdayForecast";
import { Target, TrendingUp, TrendingDown, Minus, Zap, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RadarAniversariantesProps {
  cidade: string | null;
  estado: string | null;
}

export function RadarAniversariantes({ cidade, estado }: RadarAniversariantesProps) {
  const { data: forecast, isLoading, error } = useBirthdayForecast({ 
    cidade: cidade || undefined, 
    estado: estado || undefined 
  });

  const handleActivatePromo = () => {
    toast.info("Funcionalidade de Promoção Relâmpago será ativada em breve! 🚀");
  };

  if (isLoading) {
    return (
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/20 via-background to-background">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        </CardContent>
      </Card>
    );
  }

  if (error || !forecast) {
    return null;
  }

  const getTrendIcon = () => {
    if (forecast.status === 'hot') return <TrendingUp className="h-5 w-5 text-amber-500" />;
    if (forecast.status === 'cold') return <TrendingDown className="h-5 w-5 text-blue-500" />;
    return <Minus className="h-5 w-5 text-slate-500" />;
  };

  const getTrendMessage = () => {
    if (forecast.status === 'hot') {
      return `🔥 A demanda está subindo (${forecast.trend})! Prepare seu estoque.`;
    }
    if (forecast.status === 'cold') {
      return `⚠️ Semana mais calma (${forecast.trend}). Ótimo momento para atrair clientes com ofertas.`;
    }
    return `📊 Demanda estável (${forecast.trend}). Continue com suas estratégias atuais.`;
  };

  const getTrendVariant = () => {
    if (forecast.status === 'hot') return 'default';
    if (forecast.status === 'cold') return 'secondary';
    return 'outline';
  };

  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/30 via-indigo-950/20 to-background shadow-lg shadow-violet-500/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Target className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                Radar de Aniversariantes
                <Badge variant="secondary" className="text-xs font-normal">
                  Inteligência de Mercado
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Previsão de demanda para {cidade}, {estado}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Próximos 7 dias</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-violet-400">{forecast.next_7_days}</span>
              <span className="text-sm text-muted-foreground">aniversariantes</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Próximos 30 dias</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-indigo-400">{forecast.next_30_days}</span>
              <span className="text-sm text-muted-foreground">aniversariantes</span>
            </div>
          </div>
        </div>

        {/* Tendência */}
        <div className="bg-background/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            {getTrendIcon()}
            <Badge variant={getTrendVariant()} className="font-semibold">
              Tendência: {forecast.trend}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {getTrendMessage()}
          </p>
        </div>

        {/* Oportunidade de Negócio */}
        <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-lg p-5 border border-violet-500/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-full bg-violet-500/20">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">🎯 Oportunidade Identificada</h4>
              <p className="text-sm text-muted-foreground">
                {forecast.next_7_days > 0 
                  ? `Identificamos ${forecast.next_7_days} Aniversariantes VIP na sua cidade para a próxima semana. Cada aniversariante traz em média 3-5 acompanhantes.`
                  : 'Nenhum aniversariante identificado nos próximos 7 dias. Explore outras estratégias de marketing.'
                }
              </p>
            </div>
          </div>

          <Button 
            onClick={handleActivatePromo}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/20"
            size="lg"
            disabled={forecast.next_7_days === 0}
          >
            <Zap className="mr-2 h-5 w-5" />
            ⚡ Ativar Promoção Relâmpago
          </Button>
        </div>

        {/* Rodapé com Atualização */}
        <div className="text-xs text-center text-muted-foreground">
          Última atualização: {new Date(forecast.updated_at).toLocaleString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
}
