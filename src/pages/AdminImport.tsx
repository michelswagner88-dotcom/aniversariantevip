import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, CheckCircle, XCircle, Download, Loader2, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { CATEGORIAS_ESTABELECIMENTO } from '@/lib/constants';

interface ImportError {
  row: number;
  empresa: string;
  error: string;
}

interface ProcessResult {
  success: number;
  errors: ImportError[];
}

export default function AdminImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [stats, setStats] = useState({
    removed: 0,
    imported: 0,
    geocoded: 0,
    photosFound: 0
  });
  const [showResult, setShowResult] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<{
    total: number;
    processados: number;
    sucesso: number;
    falhas: number;
  }>({ total: 0, processados: 0, sucesso: 0, falhas: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const cleanCNPJ = (cnpj: string): string => {
    return cnpj?.replace(/\D/g, "") || "";
  };

  const cleanPhone = (phone: string): string => {
    return phone?.replace(/\D/g, "") || "";
  };

  const cleanInstagram = (instagram: string): string => {
    if (!instagram) return "";
    const cleaned = instagram.trim();
    if (cleaned.startsWith("@")) return cleaned.substring(1);
    if (cleaned.includes("instagram.com/")) {
      const parts = cleaned.split("instagram.com/");
      return parts[1]?.split("/")[0] || "";
    }
    return cleaned;
  };

  const mapCategory = (categoria: string): string => {
    if (!categoria) return 'Outros Comércios';
    
    const normalized = categoria.trim().toLowerCase();
    
    // Procurar correspondência exata primeiro
    const found = CATEGORIAS_ESTABELECIMENTO.find(cat => 
      cat.value.toLowerCase() === normalized ||
      cat.label.toLowerCase() === normalized
    );
    
    if (found) return found.value;
    
    // Mapeamento de aliases/sinônimos
    const aliases: Record<string, string> = {
      'restaurante': 'Restaurante',
      'restaurantes': 'Restaurante',
      'pizzaria': 'Restaurante',
      'bar': 'Bar',
      'bares': 'Bar',
      'academia': 'Academia',
      'salao': 'Salão de Beleza',
      'salão': 'Salão de Beleza',
      'barbearia': 'Barbearia',
      'cafeteria': 'Cafeteria',
      'cafe': 'Cafeteria',
      'café': 'Cafeteria',
      'balada': 'Casa Noturna',
      'casa noturna': 'Casa Noturna',
      'boate': 'Casa Noturna',
      'confeitaria': 'Confeitaria',
      'doces': 'Confeitaria',
      'hotel': 'Hospedagem',
      'pousada': 'Hospedagem',
      'hospedagem': 'Hospedagem',
      'loja': 'Outros Comércios',
      'cinema': 'Entretenimento',
      'teatro': 'Entretenimento',
      'parque': 'Entretenimento',
      'presentes': 'Loja de Presentes',
      'roupa': 'Moda e Acessórios',
      'roupas': 'Moda e Acessórios',
      'moda': 'Moda e Acessórios',
      'farmacia': 'Saúde e Suplementos',
      'farmácia': 'Saúde e Suplementos',
      'suplementos': 'Saúde e Suplementos',
      'saude': 'Saúde e Suplementos',
      'saúde': 'Saúde e Suplementos',
      'servico': 'Serviços',
      'serviço': 'Serviços',
      'servicos': 'Serviços',
      'serviços': 'Serviços',
    };
    
    return aliases[normalized] || 'Outros Comércios';
  };

  const mapValidity = (validity: string): string => {
    if (!validity) return "dia_aniversario";
    const lower = validity.toLowerCase();
    if (lower.includes("mês") || lower.includes("mes")) return "mes_aniversario";
    if (lower.includes("semana")) return "semana_aniversario";
    return "dia_aniversario";
  };

  const fetchAddressByCep = async (cep: string): Promise<{ street: string; neighborhood: string; city: string; state: string; lat?: number; lng?: number } | null> => {
    try {
      const cleanedCep = cep.replace(/\D/g, "");
      
      // Tentar BrasilAPI primeiro
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanedCep}`);
        if (response.ok) {
          const data = await response.json();
          return {
            street: data.street,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
          };
        }
      } catch (brasilApiError) {
        console.log("BrasilAPI falhou, tentando ViaCEP...");
      }

      // Fallback para ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        return null;
      }

      return {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      };
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return null;
    }
  };

  const geocodeAddress = async (rua: string, numero: string, bairro: string, cidade: string, estado: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      console.log(`[Geocoding] Processando: ${rua}, ${numero} - ${bairro}, ${cidade} - ${estado}`);
      
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { rua, numero, bairro, cidade, estado }
      });
      
      if (error) {
        console.error('[Geocoding] Erro Edge Function:', error);
        return null;
      }
      
      if (data?.success) {
        console.log(`[Geocoding] ✓ Sucesso: ${data.latitude}, ${data.longitude}`);
        return { lat: data.latitude, lng: data.longitude };
      }
      
      console.warn('[Geocoding] ⚠ Falhou:', data?.error);
      return null;
    } catch (error) {
      console.error("[Geocoding] ❌ Exceção:", error);
      return null;
    }
  };

  const geocodificarEstabelecimento = async (estabelecimento: any) => {
    try {
      console.log(`[Geocoding] Processando: ${estabelecimento.nome_fantasia}`);

      const coords = await geocodeAddress(
        estabelecimento.logradouro || estabelecimento.rua || '',
        estabelecimento.numero || '',
        estabelecimento.bairro || '',
        estabelecimento.cidade || '',
        estabelecimento.estado || ''
      );

      if (coords) {
        console.log(`[Geocoding] ✓ Sucesso: ${coords.lat}, ${coords.lng}`);
        return { latitude: coords.lat, longitude: coords.lng };
      }

      console.warn(`[Geocoding] ⚠ Sem coordenadas retornadas`);
      return null;
    } catch (err) {
      console.error(`[Geocoding] Exceção:`, err);
      return null;
    }
  };

  const getPlaceDetails = async (name: string, address: string, cidade: string, estado: string): Promise<{ photoUrl: string | null; rating: number | null; ratingsTotal: number | null }> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-place-photo', {
        body: {
          nome: name,
          endereco: address,
          cidade: cidade,
          estado: estado,
        }
      });

      if (error || !data?.success) {
        console.log(`❌ Foto não encontrada para ${name}:`, data?.error || error);
        return { photoUrl: null, rating: null, ratingsTotal: null };
      }

      console.log(`✅ Foto encontrada para ${name}`);
      return {
        photoUrl: data.photo_url,
        rating: data.rating,
        ratingsTotal: data.user_ratings_total,
      };
    } catch (error) {
      console.error("Edge function error:", error);
      return { photoUrl: null, rating: null, ratingsTotal: null };
    }
  };

  const cleanDatabase = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá APAGAR TODOS os estabelecimentos da base de dados. Deseja continuar?')) {
      return;
    }

    setCleaning(true);
    try {
      // Contar registros antes de limpar
      const { count } = await supabase
        .from('estabelecimentos')
        .select('*', { count: 'exact', head: true });

      // Limpar tabela
      const { error } = await supabase
        .from('estabelecimentos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      setStats(prev => ({ ...prev, removed: count || 0 }));
      toast.success(`🗑️ ${count} registros removidos com sucesso!`);
    } catch (error) {
      console.error('Erro ao limpar base:', error);
      toast.error('Erro ao limpar base de dados');
    } finally {
      setCleaning(false);
    }
  };

  const processBatch = async (items: any[], startIndex: number) => {
    const batchSize = 3;
    const batch = items.slice(startIndex, startIndex + batchSize);
    
    const results = await Promise.all(
      batch.map(async (row, batchIdx) => {
        const rowNumber = startIndex + batchIdx + 2;
        
        try {
          // NENHUMA VALIDAÇÃO OBRIGATÓRIA - Admin pode importar qualquer dado
          // CNPJ: Se vazio, gera placeholder único
          const cnpj = row.CNPJ 
            ? cleanCNPJ(row.CNPJ)
            : `PENDENTE_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

          // NOVO FLUXO: Buscar endereço pelo CEP (só se tiver CEP)
          const addressData = row.CEP ? await fetchAddressByCep(row.CEP) : null;
          
          let finalAddress: string | null = null;
          let coordinates: { lat: number; lng: number } | null = null;

          // PASSO 1: Extrair dados - prioridade CEP, fallback campos diretos da planilha
          let cidade = addressData?.city || row.CIDADE || null;
          let estado = addressData?.state || row.ESTADO || null;
          let logradouro = addressData?.street || row.RUA || null;
          let bairro = addressData?.neighborhood || row.BAIRRO || null;
          const numero = row.NUMERO || "S/N";
          const complemento = row.COMPLEMENTO ? `, ${row.COMPLEMENTO}` : "";

          // PASSO 2: Montar endereço formatado se tiver dados mínimos (cidade + estado)
          if (cidade && estado) {
            const partes = [];
            if (logradouro) partes.push(`${logradouro}, ${numero}${complemento}`);
            if (bairro) partes.push(bairro);
            partes.push(`${cidade} - ${estado}`);
            finalAddress = partes.join(" - ");
            
            // PASSO 3: Geocodificar usando Edge Function
            const coords = await geocodeAddress(
              logradouro || '',
              numero,
              bairro || '',
              cidade,
              estado
            );
            if (coords) {
              coordinates = coords;
            }
          } else {
            // Sem cidade/estado - não consegue geocodificar
            finalAddress = row.CEP ? `Endereço pendente (CEP: ${row.CEP})` : null;
          }

          // Google Places (foto e avaliação) - só tenta se tiver nome E endereço
          let placeDetails = { photoUrl: null, rating: null, ratingsTotal: null };
          if (row.EMPRESA && finalAddress && coordinates) {
            placeDetails = await getPlaceDetails(row.EMPRESA, finalAddress, cidade || "Florianópolis", estado || "SC");
          }

          // Preparar dados para inserção - TODOS os campos são opcionais
          const estabelecimentoData = {
            razao_social: row.EMPRESA || "Pendente de preenchimento",
            nome_fantasia: row.EMPRESA || "Pendente de preenchimento",
            cnpj: cnpj,
            categoria: row.CATEGORIA ? [mapCategory(row.CATEGORIA)] : [],
            telefone: row.CONTATO ? cleanPhone(row.CONTATO) : null,
            whatsapp: row.CONTATO ? cleanPhone(row.CONTATO) : null,
            endereco: finalAddress,
            cep: row.CEP ? row.CEP.replace(/\D/g, "") : null,
            logradouro: logradouro,
            numero: row.NUMERO || null,
            complemento: row.COMPLEMENTO || null,
            bairro: bairro,
            latitude: coordinates?.lat || null,
            longitude: coordinates?.lng || null,
            instagram: row.INSTAGRAM ? cleanInstagram(row.INSTAGRAM) : null,
            site: row.SITE || null,
            descricao_beneficio: row.BENEFICIO || row["BENEFICIO E REGRAS"] || null,
            periodo_validade_beneficio: row.VALIDADE || row["DIA/SEMANA/MÊS"] ? mapValidity(row.VALIDADE || row["DIA/SEMANA/MÊS"]) : "dia_aniversario",
            logo_url: placeDetails.photoUrl || null,
            ativo: true,
            plan_status: "active",
            cidade: cidade,
            estado: estado,
            deleted_at: null, // IMPORTANTE: Garantir que nunca seja marcado como deletado na importação
          };

          // Inserir/Atualizar no Supabase usando RPC (ignora RLS)
          const { data: rpcResult, error: insertError } = await supabase
            .rpc('upsert_establishment_bulk', { p_data: estabelecimentoData });

          const result = rpcResult as { success: boolean; error?: string } | null;

          if (insertError || (result && !result.success)) {
            return {
              success: false,
              rowNumber,
              empresa: row.EMPRESA,
              error: `Erro ao salvar: ${insertError?.message || result?.error || 'Erro desconhecido'}`,
              hasGeocode: false,
              hasPhoto: false,
            };
          }

          return {
            success: true,
            rowNumber,
            empresa: row.EMPRESA,
            hasGeocode: !!coordinates,
            hasPhoto: !!placeDetails.photoUrl,
          };
        } catch (error: any) {
          return {
            success: false,
            rowNumber,
            empresa: row.EMPRESA || "N/A",
            error: error.message || "Erro desconhecido",
            hasGeocode: false,
            hasPhoto: false,
          };
        }
      })
    );

    return results;
  };

  const processFile = async () => {
    if (!file) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    setProcessing(true);
    setProgress(0);
    const errors: ImportError[] = [];
    let successCount = 0;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const total = jsonData.length;
      const batchSize = 3;
      let geocodedCount = 0;
      let photosFoundCount = 0;

      // Processar em batches de 3 em 3
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batchResults = await processBatch(jsonData, i);
        
        batchResults.forEach(result => {
          if (result.success) {
            successCount++;
            if (result.hasGeocode) geocodedCount++;
            if (result.hasPhoto) photosFoundCount++;
          } else {
            errors.push({
              row: result.rowNumber,
              empresa: result.empresa,
              error: result.error,
            });
          }
        });

        // Atualizar progresso
        setProgress(((Math.min(i + batchSize, total)) / total) * 100);
        
        // Delay para evitar rate limiting (300ms entre batches)
        await new Promise(resolve => setTimeout(resolve, 300));
        }

        setStats(prev => ({
          ...prev,
          imported: successCount,
          geocoded: geocodedCount,
          photosFound: photosFoundCount
        }));

        setResult({ success: successCount, errors });
        setShowResult(true);

        // Processo adicional de geocodificação para estabelecimentos sem coordenadas
        toast.info('🗺️ Iniciando processo de geocodificação adicional...');
        await processarGeocodificacaoAdicional();

    } catch (error: any) {
      toast.error(`Erro ao processar arquivo: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const processarGeocodificacaoAdicional = async () => {
    try {
      // Buscar estabelecimentos sem coordenadas
      const { data: estabelecimentosSemCoords, error } = await supabase
        .from('estabelecimentos')
        .select('id, nome_fantasia, logradouro, numero, bairro, cidade, estado, cep')
        .or('latitude.is.null,longitude.is.null');

      if (error) {
        console.error('[Geocoding] Erro ao buscar estabelecimentos:', error);
        return;
      }

      if (!estabelecimentosSemCoords || estabelecimentosSemCoords.length === 0) {
        console.log('[Geocoding] Nenhum estabelecimento sem coordenadas encontrado');
        return;
      }

      setGeocodingStatus({ 
        total: estabelecimentosSemCoords.length, 
        processados: 0, 
        sucesso: 0, 
        falhas: 0 
      });

      for (const est of estabelecimentosSemCoords) {
        const coords = await geocodificarEstabelecimento(est);

        if (coords) {
          const { error: updateError } = await supabase
            .from('estabelecimentos')
            .update({ latitude: coords.latitude, longitude: coords.longitude })
            .eq('id', est.id);

          if (!updateError) {
            setGeocodingStatus(prev => ({
              ...prev,
              processados: prev.processados + 1,
              sucesso: prev.sucesso + 1
            }));
          } else {
            console.error(`[Geocoding] Erro ao atualizar ${est.nome_fantasia}:`, updateError);
            setGeocodingStatus(prev => ({
              ...prev,
              processados: prev.processados + 1,
              falhas: prev.falhas + 1
            }));
          }
        } else {
          setGeocodingStatus(prev => ({
            ...prev,
            processados: prev.processados + 1,
            falhas: prev.falhas + 1
          }));
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success(`Geocodificação concluída: ${geocodingStatus.sucesso} sucesso, ${geocodingStatus.falhas} falhas`);
    } catch (error) {
      console.error('[Geocoding] Erro no processo:', error);
    }
  };

  const downloadErrorReport = () => {
    if (!result || result.errors.length === 0) return;

    const errorData = result.errors.map(err => ({
      Linha: err.row,
      Empresa: err.empresa,
      Erro: err.error,
    }));

    const ws = XLSX.utils.json_to_sheet(errorData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Erros");
    XLSX.writeFile(wb, "erros-importacao.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Admin
        </Button>

        <Card className="p-8 bg-slate-900/50 border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Importação de Estabelecimentos
          </h1>
          <p className="text-slate-400 mb-8">
            Faça upload do arquivo CSV/Excel com os dados dos estabelecimentos
          </p>

          <div className="space-y-4">
            <Button
              onClick={cleanDatabase}
              disabled={cleaning || processing}
              variant="destructive"
              className="w-full mb-4"
            >
              {cleaning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Limpando base de dados...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  🗑️ Limpar Base de Dados
                </>
              )}
            </Button>

            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-violet-500/50 transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={processing}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <Upload className="h-12 w-12 text-violet-400" />
                <div>
                  <p className="text-white font-medium">
                    {file ? file.name : "Clique para selecionar arquivo"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Formatos aceitos: CSV, XLSX, XLS
                  </p>
                </div>
              </label>
            </div>

            {/* Status de geocodificação */}
            {geocodingStatus.total > 0 && (
              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                <p className="text-white font-medium mb-2">
                  🗺️ Geocodificando endereços...
                </p>
                <p className="text-sm text-slate-300">
                  {geocodingStatus.processados}/{geocodingStatus.total} • 
                  <span className="text-green-400"> ✓ {geocodingStatus.sucesso}</span> • 
                  <span className="text-red-400"> ✗ {geocodingStatus.falhas}</span>
                </p>
                <Progress 
                  value={(geocodingStatus.processados / geocodingStatus.total) * 100} 
                  className="mt-2"
                />
              </div>
            )}

            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Processando...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              onClick={processFile}
              disabled={!file || processing}
              className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 text-white font-semibold h-12"
            >
              {processing ? "Processando..." : "Iniciar Importação"}
          </Button>
        </div>

        {(stats.removed > 0 || stats.imported > 0) && (
          <div className="mt-4 p-4 bg-slate-900 border border-violet-500/20 rounded-lg space-y-2">
            <h3 className="font-bold text-white mb-2">📊 Relatório de Execução</h3>
            {stats.removed > 0 && (
              <p className="text-slate-300">🗑️ Registros anteriores removidos: <span className="font-bold text-red-400">{stats.removed}</span></p>
            )}
            {stats.imported > 0 && (
              <p className="text-slate-300">📥 Novos registros importados: <span className="font-bold text-green-400">{stats.imported}</span></p>
            )}
            {stats.geocoded > 0 && (
              <p className="text-slate-300">📍 Geocoding com sucesso: <span className="font-bold text-blue-400">{stats.geocoded}</span></p>
            )}
            {stats.photosFound > 0 && (
              <p className="text-slate-300">📸 Fotos encontradas: <span className="font-bold text-purple-400">{stats.photosFound}</span></p>
            )}
          </div>
        )}
        </Card>
      </div>

      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-2xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Importação Concluída!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 space-y-4 pt-4">
              <div className="flex items-center gap-3 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  <strong className="text-white">{result?.success || 0}</strong> estabelecimentos importados com sucesso
                </span>
              </div>
              
              {result && result.errors.length > 0 && (
                <div className="flex items-center gap-3 text-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>
                    <strong className="text-white">{result.errors.length}</strong> falhas encontradas
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {result && result.errors.length > 0 && (
              <Button
                variant="outline"
                onClick={downloadErrorReport}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar Relatório de Erros
              </Button>
            )}
            <Button
              onClick={() => {
                setShowResult(false);
                setFile(null);
                setResult(null);
                setProgress(0);
              }}
              className="bg-gradient-to-r from-violet-600 to-pink-500 text-white"
            >
              Concluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
