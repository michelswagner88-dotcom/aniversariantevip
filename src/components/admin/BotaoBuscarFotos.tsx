import { useState, useEffect } from "react";
import { Camera, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BuscarFotosResult {
  processados: number;
  erros: number;
  comFoto: number;
  semFoto: number;
  message: string;
}

export const BotaoBuscarFotos = () => {
  const [loading, setLoading] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [pendentes, setPendentes] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<BuscarFotosResult | null>(null);

  // Verificar quantos estão pendentes
  const verificarPendentes = async () => {
    setLoadingCheck(true);
    try {
      // Pendentes (sem foto buscada)
      const { count: countPendentes, error: errorPendentes } = await supabase
        .from("estabelecimentos")
        .select("*", { count: "exact", head: true })
        .eq("foto_buscada", false)
        .eq("ativo", true);

      if (errorPendentes) throw errorPendentes;

      // Total
      const { count: countTotal, error: errorTotal } = await supabase
        .from("estabelecimentos")
        .select("*", { count: "exact", head: true })
        .eq("ativo", true);

      if (errorTotal) throw errorTotal;

      setPendentes(countPendentes || 0);
      setTotal(countTotal || 0);
    } catch (error) {
      console.error("Erro ao verificar pendentes:", error);
      toast.error("Erro ao verificar estabelecimentos pendentes");
    } finally {
      setLoadingCheck(false);
    }
  };

  useEffect(() => {
    verificarPendentes();
  }, []);

  // Rodar busca em lote
  const buscarFotos = async () => {
    setLoading(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("buscar-fotos-lote");

      if (error) throw error;

      const result = data as BuscarFotosResult;
      setLastResult(result);

      toast.success("Lote processado com sucesso", {
        description: `${result.comFoto} com foto, ${result.semFoto} sem foto, ${result.erros} erros`,
      });

      verificarPendentes();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar fotos", {
        description: "Verifique os logs para mais detalhes.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Resetar todos para buscar novamente
  const resetarTodos = async () => {
    setLoadingReset(true);
    try {
      const { error } = await supabase.from("estabelecimentos").update({ foto_buscada: false }).eq("ativo", true);

      if (error) throw error;

      toast.success("Reset concluído", {
        description: "Todos os estabelecimentos foram marcados para re-buscar fotos.",
      });
      verificarPendentes();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao resetar", {
        description: "Não foi possível resetar os estabelecimentos.",
      });
    } finally {
      setLoadingReset(false);
    }
  };

  // Cálculo seguro do percentual
  const percentualProcessado =
    total && total > 0 && pendentes !== null ? Math.round(((total - pendentes) / total) * 100) : 0;

  const processados = total !== null && pendentes !== null ? total - pendentes : null;
  const isAnyLoading = loading || loadingCheck || loadingReset;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-violet-400" aria-hidden="true" />
          Buscar Fotos do Google
        </CardTitle>
        <CardDescription>
          Busca fotos do Google Places para estabelecimentos que ainda não têm foto. Cada foto é buscada apenas UMA VEZ
          e salva no banco.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso */}
        {total !== null && pendentes !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="font-medium">
                {processados} / {total} ({percentualProcessado}%)
              </span>
            </div>
            <Progress
              value={percentualProcessado}
              className="h-2"
              aria-label={`${percentualProcessado}% dos estabelecimentos processados`}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {loadingCheck ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (pendentes ?? "—")}
            </p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">
              {loadingCheck ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (processados ?? "—")}
            </p>
            <p className="text-xs text-muted-foreground">Processados</p>
          </div>
        </div>

        {/* Último resultado */}
        {lastResult && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" aria-hidden="true" />
              Último lote processado
            </p>
            <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
              <span>✅ Com foto: {lastResult.comFoto}</span>
              <span>⚠️ Sem foto: {lastResult.semFoto}</span>
              <span>❌ Erros: {lastResult.erros}</span>
              <span>📦 Total: {lastResult.processados}</span>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={verificarPendentes} disabled={isAnyLoading} className="min-h-[44px]">
            {loadingCheck ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            )}
            Atualizar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isAnyLoading || pendentes === 0}
                className="bg-violet-600 hover:bg-violet-500 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 w-4 h-4" aria-hidden="true" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 w-4 h-4" aria-hidden="true" />
                    Buscar próximos 50
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  ⚠️ ATENÇÃO: Custo Google API
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    Esta ação vai <strong>buscar fotos no Google Places API</strong> e gerar custos.
                  </p>
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive">
                    <p className="font-medium">💰 Custo estimado: ~R$ 2,50 por lote de 50</p>
                    <p className="text-sm mt-1">As fotos serão salvas permanentemente no Supabase Storage.</p>
                  </div>
                  <p className="text-sm">
                    Tem certeza que deseja continuar?
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={buscarFotos}
                  className="bg-violet-600 hover:bg-violet-500 min-h-[44px]"
                >
                  Sim, buscar fotos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={isAnyLoading}
                className="text-muted-foreground hover:text-destructive min-h-[44px]"
              >
                {loadingReset && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
                Resetar todos
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resetar todos os estabelecimentos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso vai marcar <strong>TODOS</strong> os estabelecimentos para buscar fotos novamente. Use apenas se
                  a API key mudou ou se houve problema na busca anterior.
                  <br />
                  <br />
                  <span className="text-yellow-500 font-medium">
                    ⚠️ Atenção: Isso pode gerar custos adicionais com a API do Google.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetarTodos}
                  className="bg-destructive hover:bg-destructive/90 min-h-[44px]"
                >
                  Sim, resetar todos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Aviso de custo */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3" role="note">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Custo estimado: ~R$0,10 por estabelecimento</p>
            <p>
              A foto é buscada uma única vez e salva permanentemente. Estabelecimentos sem foto usarão placeholder da
              categoria.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotaoBuscarFotos;
