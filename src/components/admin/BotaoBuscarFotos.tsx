import { useState, useEffect } from 'react';
import { Camera, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BuscarFotosResult {
  processados: number;
  erros: number;
  comFoto: number;
  semFoto: number;
  message: string;
}

export const BotaoBuscarFotos = () => {
  const [loading, setLoading] = useState(false);
  const [pendentes, setPendentes] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<BuscarFotosResult | null>(null);

  // Verificar quantos estão pendentes
  const verificarPendentes = async () => {
    try {
      // Pendentes (sem foto buscada)
      const { count: countPendentes } = await supabase
        .from('estabelecimentos')
        .select('*', { count: 'exact', head: true })
        .eq('foto_buscada', false)
        .eq('ativo', true);
      
      // Total
      const { count: countTotal } = await supabase
        .from('estabelecimentos')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true);
      
      setPendentes(countPendentes || 0);
      setTotal(countTotal || 0);
    } catch (error) {
      console.error('Erro ao verificar pendentes:', error);
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
      const { data, error } = await supabase.functions.invoke('buscar-fotos-lote');

      if (error) throw error;

      const result = data as BuscarFotosResult;
      setLastResult(result);
      
      toast.success(
        `✅ ${result.processados} processados: ${result.comFoto} com foto, ${result.semFoto} sem foto`
      );
      
      verificarPendentes();

    } catch (error) {
      console.error(error);
      toast.error('Erro ao buscar fotos. Verifique os logs.');
    } finally {
      setLoading(false);
    }
  };

  // Resetar todos para buscar novamente (útil se API key mudou)
  const resetarTodos = async () => {
    if (!confirm('Isso vai marcar TODOS os estabelecimentos para buscar fotos novamente. Continuar?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('estabelecimentos')
        .update({ foto_buscada: false })
        .eq('ativo', true);

      if (error) throw error;

      toast.success('Todos marcados para re-buscar fotos');
      verificarPendentes();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao resetar');
    }
  };

  const percentualProcessado = total && pendentes !== null 
    ? Math.round(((total - pendentes) / total) * 100) 
    : 0;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-violet-400" />
          Buscar Fotos do Google
        </CardTitle>
        <CardDescription>
          Busca fotos do Google Places para estabelecimentos que ainda não têm foto.
          Cada foto é buscada apenas UMA VEZ e salva no banco.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso */}
        {total !== null && pendentes !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="font-medium">
                {total - pendentes} / {total} ({percentualProcessado}%)
              </span>
            </div>
            <Progress value={percentualProcessado} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pendentes ?? '...'}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">
              {total !== null && pendentes !== null ? total - pendentes : '...'}
            </p>
            <p className="text-xs text-muted-foreground">Processados</p>
          </div>
        </div>

        {/* Último resultado */}
        {lastResult && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={verificarPendentes}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>

          <Button
            onClick={buscarFotos}
            disabled={loading || pendentes === 0}
            className="bg-violet-600 hover:bg-violet-500"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
                Buscando...
              </>
            ) : (
              <>
                <Camera className="mr-2 w-4 h-4" />
                Buscar próximos 50
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetarTodos}
            className="text-muted-foreground hover:text-destructive"
          >
            Resetar todos
          </Button>
        </div>

        {/* Aviso de custo */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Custo estimado: ~R$0,10 por estabelecimento</p>
            <p>A foto é buscada uma única vez e salva permanentemente. Estabelecimentos sem foto usarão placeholder da categoria.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotaoBuscarFotos;
