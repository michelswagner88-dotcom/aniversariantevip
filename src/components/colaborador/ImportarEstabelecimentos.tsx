import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { validateCNPJ } from "@/lib/validators";

// Schema de validação
const estabelecimentoSchema = z.object({
  cnpj: z.string().refine((val) => validateCNPJ(val), {
    message: "CNPJ inválido",
  }),
  razao_social: z.string().min(1, "Razão social obrigatória").max(255),
  nome_fantasia: z.string().min(1, "Nome fantasia obrigatório").max(255),
  categoria: z.string().min(1, "Categoria obrigatória"),
  cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  logradouro: z.string().min(1, "Logradouro obrigatório"),
  numero: z.string().optional(),
  bairro: z.string().min(1, "Bairro obrigatório"),
  cidade: z.string().min(1, "Cidade obrigatória"),
  estado: z.string().length(2, "Estado deve ter 2 letras"),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  site: z.string().url("URL inválida").optional().or(z.literal("")),
  descricao_beneficio: z.string().min(1, "Descrição do benefício obrigatória").max(500),
  regras_utilizacao: z.string().max(200).optional(),
  periodo_validade_beneficio: z.enum(["dia_aniversario", "semana_aniversario", "mes_aniversario"]),
});

type EstabelecimentoImport = z.infer<typeof estabelecimentoSchema>;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: EstabelecimentoImport | null;
}

export const ImportarEstabelecimentos = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const downloadTemplate = () => {
    const template = [
      {
        cnpj: "12345678000100",
        razao_social: "Exemplo Restaurante LTDA",
        nome_fantasia: "Restaurante Exemplo",
        categoria: "Restaurante",
        cep: "88010000",
        logradouro: "Rua Exemplo",
        numero: "123",
        bairro: "Centro",
        cidade: "Florianópolis",
        estado: "SC",
        telefone: "4899999999",
        whatsapp: "48999999999",
        instagram: "@restauranteexemplo",
        site: "https://exemplo.com.br",
        descricao_beneficio: "Ganhe 15% de desconto no seu aniversário",
        regras_utilizacao: "Válido apenas para consumo no local. Não cumulativo com outras promoções.",
        periodo_validade_beneficio: "mes_aniversario",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estabelecimentos");
    XLSX.writeFile(wb, "template_estabelecimentos.xlsx");

    toast({
      title: "Template baixado! 📥",
      description: "Preencha a planilha e faça o upload.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setShowPreview(false);
      setValidationResults([]);
    }
  };

  const validateData = (data: any[]): ValidationResult[] => {
    return data.map((row, index) => {
      try {
        // Converter categoria string para array
        const categorias = row.categoria?.split(",").map((c: string) => c.trim()) || [];
        
        const validated = estabelecimentoSchema.parse({
          ...row,
          categoria: categorias[0], // Validar apenas primeira categoria
        });

        return {
          valid: true,
          errors: [],
          data: validated,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            valid: false,
            errors: error.errors.map((e) => `Linha ${index + 2}: ${e.path.join(".")} - ${e.message}`),
            data: null,
          };
        }
        return {
          valid: false,
          errors: [`Linha ${index + 2}: Erro desconhecido`],
          data: null,
        };
      }
    });
  };

  const processFile = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo primeiro",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Erro",
          description: "Planilha vazia",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      const results = validateData(jsonData);
      setValidationResults(results);
      setShowPreview(true);

      const validCount = results.filter((r) => r.valid).length;
      const invalidCount = results.filter((r) => !r.valid).length;

      toast({
        title: "Validação concluída",
        description: `${validCount} válidos, ${invalidCount} com erros`,
      });
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Verifique se o formato está correto",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const importData = async () => {
    const validData = validationResults.filter((r) => r.valid && r.data);

    if (validData.length === 0) {
      toast({
        title: "Nenhum dado válido",
        description: "Corrija os erros antes de importar",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    try {
      const insertData = validData.map((result) => {
        const data = result.data!;
        return {
          cnpj: data.cnpj.replace(/\D/g, ""),
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia,
          categoria: [data.categoria],
          cep: data.cep,
          logradouro: data.logradouro,
          numero: data.numero || null,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          telefone: data.telefone || null,
          whatsapp: data.whatsapp || null,
          instagram: data.instagram || null,
          site: data.site || null,
          descricao_beneficio: data.descricao_beneficio,
          regras_utilizacao: data.regras_utilizacao || null,
          periodo_validade_beneficio: data.periodo_validade_beneficio,
          ativo: true,
          plan_status: "pending",
        };
      });

      const { error } = await supabase.from("estabelecimentos").insert(insertData);

      if (error) throw error;

      toast({
        title: "✅ Importação concluída!",
        description: `${validData.length} estabelecimentos cadastrados com sucesso`,
      });

      // Limpar estados
      setFile(null);
      setValidationResults([]);
      setShowPreview(false);
    } catch (error) {
      console.error("Erro ao importar:", error);
      toast({
        title: "Erro ao importar",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const validCount = validationResults.filter((r) => r.valid).length;
  const invalidCount = validationResults.filter((r) => !r.valid).length;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-900/80 border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">Importar Estabelecimentos em Massa</h2>
        
        <div className="space-y-4">
          <div>
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Planilha Modelo
            </Button>
            <p className="text-sm text-slate-400 mt-2">
              Baixe o template, preencha com os dados dos estabelecimentos e faça upload abaixo.
            </p>
          </div>

          <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-2" />
              <p className="text-white font-medium">
                {file ? file.name : "Clique para selecionar arquivo"}
              </p>
              <p className="text-sm text-slate-400 mt-1">Excel (.xlsx, .xls) ou CSV</p>
            </label>
          </div>

          {file && !showPreview && (
            <Button
              onClick={processFile}
              disabled={importing}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
            >
              {importing ? "Processando..." : "Validar Dados"}
            </Button>
          )}

          {showPreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-green-500/10 border-green-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-slate-400">Válidos</p>
                      <p className="text-2xl font-bold text-white">{validCount}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-red-500/10 border-red-500/20">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm text-slate-400">Com Erros</p>
                      <p className="text-2xl font-bold text-white">{invalidCount}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {invalidCount > 0 && (
                <Card className="p-4 bg-amber-500/10 border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-500 mb-2">Erros encontrados:</p>
                      <ul className="text-xs text-slate-300 space-y-1 max-h-40 overflow-auto">
                        {validationResults
                          .filter((r) => !r.valid)
                          .flatMap((r) => r.errors)
                          .map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {validCount > 0 && (
                <Button
                  onClick={importData}
                  disabled={importing}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                >
                  {importing ? "Importando..." : `Importar ${validCount} Estabelecimento(s)`}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
