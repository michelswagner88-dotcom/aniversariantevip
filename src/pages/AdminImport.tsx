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
    return cnpj?.replace(/[.\-\/]/g, "") || "";
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
      "Bar": "Bar",
      "Casa Noturna": "Casa Noturna",
      "Cafeteria": "Cafeteria",
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

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNumber = i + 2; // +2 porque começa na linha 2 do Excel (linha 1 é cabeçalho)

        try {
          // Validações básicas
          if (!row.EMPRESA || !row.CNPJ || !row.ENDEREÇO) {
            errors.push({
              row: rowNumber,
              empresa: row.EMPRESA || "N/A",
              error: "Dados obrigatórios faltando (EMPRESA, CNPJ ou ENDEREÇO)",
            });
            continue;
          }

          const cnpj = cleanCNPJ(row.CNPJ);
          if (cnpj.length !== 14) {
            errors.push({
              row: rowNumber,
              empresa: row.EMPRESA,
              error: `CNPJ inválido: ${row.CNPJ}`,
            });
            continue;
          }

          // Geocoding
          const coordinates = await geocodeAddress(row.ENDEREÇO);
          if (!coordinates) {
            errors.push({
              row: rowNumber,
              empresa: row.EMPRESA,
              error: `Endereço não encontrado: ${row.ENDEREÇO}`,
            });
            continue;
          }

          // Preparar dados para inserção
          const estabelecimentoData = {
            razao_social: row.EMPRESA,
            nome_fantasia: row.EMPRESA,
            cnpj: cnpj,
            categoria: [mapCategory(row.CATEGORIA)],
            telefone: row.CONTATO || null,
            whatsapp: row.CONTATO || null,
            endereco: row.ENDEREÇO,
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            instagram: cleanInstagram(row.INSTAGRAM) || null,
            site: row.SITE || null,
            descricao_beneficio: row["BENEFICIO E REGRAS"] || null,
            periodo_validade_beneficio: mapValidity(row["DIA/SEMANA/MÊS"]),
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
            errors.push({
              row: rowNumber,
              empresa: row.EMPRESA,
              error: `Erro ao salvar: ${insertError.message}`,
            });
          } else {
            successCount++;
          }
        } catch (error: any) {
          errors.push({
            row: rowNumber,
            empresa: row.EMPRESA || "N/A",
            error: error.message || "Erro desconhecido",
          });
        }

        // Atualizar progresso
        setProgress(((i + 1) / total) * 100);
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
