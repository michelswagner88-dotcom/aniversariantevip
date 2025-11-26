import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, CheckCircle, XCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

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
  const [showResult, setShowResult] = useState(false);

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
    if (!categoria) return "Outros Comércios";
    const first = categoria.split("/")[0].trim();
    const categoryMap: Record<string, string> = {
      "Restaurante": "Restaurante",
      "Restaurantes": "Restaurante",
      "Bar": "Bar",
      "Bares": "Bar",
      "Casa Noturna": "Casa Noturna",
      "Balada": "Casa Noturna",
      "Cafeteria": "Cafeteria",
      "Café": "Cafeteria",
      "Loja": "Loja de Presentes",
      "Salão": "Salão de Beleza",
      "Barbearia": "Barbearia",
      "Academia": "Academia",
      "Entretenimento": "Entretenimento",
      "Hospedagem": "Hospedagem",
    };
    return categoryMap[first] || "Outros Comércios";
  };

  const mapValidity = (validity: string): string => {
    if (!validity) return "dia_aniversario";
    const lower = validity.toLowerCase();
    if (lower.includes("mês") || lower.includes("mes")) return "mes_aniversario";
    if (lower.includes("semana")) return "semana_aniversario";
    return "dia_aniversario";
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const fullAddress = address.includes("Florianópolis") ? address : `${address}, Florianópolis - SC`;
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results[0]) {
        return {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const getPlaceDetails = async (name: string, address: string): Promise<{ photoUrl: string | null; rating: number | null; ratingsTotal: number | null }> => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const query = `${name}, ${address}`;
      
      // Search for place
      const searchResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`
      );
      const searchData = await searchResponse.json();

      if (searchData.status === "OK" && searchData.candidates?.[0]?.place_id) {
        const placeId = searchData.candidates[0].place_id;
        
        // Get place details
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,rating,user_ratings_total&key=${apiKey}`
        );
        const detailsData = await detailsResponse.json();

        if (detailsData.status === "OK" && detailsData.result) {
          const result = detailsData.result;
          let photoUrl = null;

          if (result.photos && result.photos.length > 0) {
            const photoReference = result.photos[0].photo_reference;
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${apiKey}`;
          }

          return {
            photoUrl,
            rating: result.rating || null,
            ratingsTotal: result.user_ratings_total || null,
          };
        }
      }
      return { photoUrl: null, rating: null, ratingsTotal: null };
    } catch (error) {
      console.error("Places API error:", error);
      return { photoUrl: null, rating: null, ratingsTotal: null };
    }
  };

  const processBatch = async (items: any[], startIndex: number) => {
    const batchSize = 3;
    const batch = items.slice(startIndex, startIndex + batchSize);
    
    const results = await Promise.all(
      batch.map(async (row, batchIdx) => {
        const rowNumber = startIndex + batchIdx + 2;
        
        try {
          // Validações básicas
          if (!row.EMPRESA || !row.CNPJ || !row.ENDEREÇO) {
            return {
              success: false,
              rowNumber,
              empresa: row.EMPRESA || "N/A",
              error: "Dados obrigatórios faltando (EMPRESA, CNPJ ou ENDEREÇO)",
            };
          }

          const cnpj = cleanCNPJ(row.CNPJ);
          if (cnpj.length !== 14) {
            return {
              success: false,
              rowNumber,
              empresa: row.EMPRESA,
              error: `CNPJ inválido: ${row.CNPJ}`,
            };
          }

          // Geocoding
          const coordinates = await geocodeAddress(row.ENDEREÇO);
          if (!coordinates) {
            return {
              success: false,
              rowNumber,
              empresa: row.EMPRESA,
              error: `Endereço não encontrado: ${row.ENDEREÇO}`,
            };
          }

          // Google Places (foto e avaliação)
          const placeDetails = await getPlaceDetails(row.EMPRESA, row.ENDEREÇO);

          // Preparar dados para inserção
          const estabelecimentoData = {
            razao_social: row.EMPRESA,
            nome_fantasia: row.EMPRESA,
            cnpj: cnpj,
            categoria: [mapCategory(row.CATEGORIA)],
            telefone: cleanPhone(row.CONTATO) || null,
            whatsapp: cleanPhone(row.CONTATO) || null,
            endereco: row.ENDEREÇO,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            instagram: cleanInstagram(row.INSTAGRAM) || null,
            site: row.SITE || null,
            descricao_beneficio: row["BENEFICIO E REGRAS"] || null,
            periodo_validade_beneficio: mapValidity(row["DIA/SEMANA/MÊS"]),
            logo_url: placeDetails.photoUrl || null,
            ativo: true,
            plan_status: "active",
            cidade: "Florianópolis",
            estado: "SC",
          };

          // Inserir no Supabase
          const { error: insertError } = await supabase
            .from("estabelecimentos")
            .insert(estabelecimentoData);

          if (insertError) {
            return {
              success: false,
              rowNumber,
              empresa: row.EMPRESA,
              error: `Erro ao salvar: ${insertError.message}`,
            };
          }

          return { success: true, rowNumber, empresa: row.EMPRESA };
        } catch (error: any) {
          return {
            success: false,
            rowNumber,
            empresa: row.EMPRESA || "N/A",
            error: error.message || "Erro desconhecido",
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

      // Processar em batches de 3 em 3
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batchResults = await processBatch(jsonData, i);
        
        batchResults.forEach(result => {
          if (result.success) {
            successCount++;
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
      }

      setResult({ success: successCount, errors });
      setShowResult(true);
    } catch (error: any) {
      toast.error(`Erro ao processar arquivo: ${error.message}`);
    } finally {
      setProcessing(false);
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

          <div className="space-y-6">
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
