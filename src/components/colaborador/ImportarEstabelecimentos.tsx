import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, CheckCircle, XCircle, AlertCircle, Loader2, FileSpreadsheet, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// ============================================
// TIPOS
// ============================================

interface PlanilhaRow {
  CODIGO?: string;
  EMAIL?: string;
  SENHA?: string;
  NOME_ESTABELECIMENTO?: string;
  HORARIO_FUNCIONAMENTO?: string;
  CNPJ?: string;
  CEP?: string;
  ESTADO?: string;
  CIDADE?: string;
  BAIRRO?: string;
  RUA?: string;
  NUMERO?: string | number;
  COMPLEMENTO?: string;
  TELEFONE?: string;
  WHATSAPP?: string;
  INSTAGRAM?: string;
  SITE?: string;
  CATEGORIA?: string;
  BENEFICIO?: string;
  REGRAS?: string;
}

interface EstabelecimentoData {
  codigo: string | null;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  cep: string | null;
  estado: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  categoria: string[] | null;
  descricao_beneficio: string | null;
  regras_utilizacao: string | null;
  periodo_validade_beneficio: string;
  horario_funcionamento: string | null;
  ativo: boolean;
  plan_status: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: EstabelecimentoData | null;
  linha: number;
  dadosOriginais: PlanilhaRow;
}

interface EnderecoViaCEP {
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
}

// ============================================
// HELPERS
// ============================================

const buscarEnderecoPorCEP = async (cep: string): Promise<EnderecoViaCEP | null> => {
  if (!cep) return null;

  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) return null;

    return {
      estado: data.uf || "",
      cidade: data.localidade || "",
      bairro: data.bairro || "",
      rua: data.logradouro || "",
    };
  } catch {
    return null;
  }
};

const mapearPeriodoValidade = (regras: string | undefined): string => {
  if (!regras) return "mes_aniversario";
  const regrasUpper = regras.toUpperCase();
  if (regrasUpper.includes("DIA")) return "dia_aniversario";
  if (regrasUpper.includes("SEMANA")) return "semana_aniversario";
  return "mes_aniversario";
};

// ============================================
// COMPONENTE
// ============================================

export const ImportarEstabelecimentos = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Loading states
  const [processando, setProcessando] = useState(false);
  const [importing, setImporting] = useState(false);

  // Progress
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // ============================================
  // DOWNLOAD TEMPLATE
  // ============================================

  const downloadTemplate = useCallback(() => {
    const template: PlanilhaRow[] = [
      {
        CODIGO: "",
        EMAIL: "",
        SENHA: "",
        NOME_ESTABELECIMENTO: "Restaurante Exemplo",
        HORARIO_FUNCIONAMENTO: "Seg-Sex: 11h-23h",
        CNPJ: "12.345.678/0001-00",
        CEP: "88010-000",
        ESTADO: "",
        CIDADE: "",
        BAIRRO: "",
        RUA: "",
        NUMERO: "123",
        COMPLEMENTO: "Sala 1",
        TELEFONE: "(48) 3333-4444",
        WHATSAPP: "(48) 99999-8888",
        INSTAGRAM: "restauranteexemplo",
        SITE: "https://exemplo.com.br",
        CATEGORIA: "Restaurante",
        BENEFICIO: "Ganhe 15% de desconto no seu aniversário",
        REGRAS: "SEMANA",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estabelecimentos");
    XLSX.writeFile(wb, "template_estabelecimentos.xlsx");

    toast.success("Template baixado!", {
      description: "Preencha a planilha e faça o upload.",
    });
  }, []);

  // ============================================
  // FILE HANDLING
  // ============================================

  const handleFile = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast.error("Formato inválido", {
          description: "Use arquivos Excel (.xlsx, .xls) ou CSV",
        });
        return;
      }

      setFile(selectedFile);
      setShowPreview(false);
      setValidationResults([]);
      setProgress(0);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0] || null);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0] || null);
    },
    [handleFile],
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setValidationResults([]);
    setShowPreview(false);
    setProgress(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  // ============================================
  // VALIDAÇÃO
  // ============================================

  const mapearLinhaPlanilha = async (row: PlanilhaRow, index: number): Promise<ValidationResult> => {
    const linha = index + 2; // +2 porque Excel começa em 1 e tem header

    try {
      // Validação básica
      if (!row.NOME_ESTABELECIMENTO) {
        return {
          valid: false,
          errors: ["Nome do estabelecimento obrigatório"],
          data: null,
          linha,
          dadosOriginais: row,
        };
      }

      if (!row.CEP) {
        return {
          valid: false,
          errors: ["CEP obrigatório"],
          data: null,
          linha,
          dadosOriginais: row,
        };
      }

      // Buscar endereço pelo CEP se campos estiverem vazios
      let endereco: EnderecoViaCEP = {
        estado: row.ESTADO || "",
        cidade: row.CIDADE || "",
        bairro: row.BAIRRO || "",
        rua: row.RUA || "",
      };

      if (row.CEP && (!endereco.estado || !endereco.cidade)) {
        const enderecoAPI = await buscarEnderecoPorCEP(row.CEP);

        if (enderecoAPI) {
          endereco = {
            estado: endereco.estado || enderecoAPI.estado,
            cidade: endereco.cidade || enderecoAPI.cidade,
            bairro: endereco.bairro || enderecoAPI.bairro,
            rua: endereco.rua || enderecoAPI.rua,
          };
        } else {
          return {
            valid: false,
            errors: ["CEP inválido ou não encontrado"],
            data: null,
            linha,
            dadosOriginais: row,
          };
        }
      }

      // Mapear categoria
      const categoria: string[] = row.CATEGORIA ? [row.CATEGORIA] : [];

      // Formatar Instagram
      let instagram = row.INSTAGRAM || null;
      if (instagram && !instagram.startsWith("@")) {
        instagram = `@${instagram}`;
      }

      const dadosMapeados: EstabelecimentoData = {
        codigo: row.CODIGO || null,
        nome_fantasia: row.NOME_ESTABELECIMENTO || "Pendente",
        razao_social: row.NOME_ESTABELECIMENTO || "Pendente",
        cnpj: row.CNPJ ? row.CNPJ.replace(/\D/g, "") : null,
        email: row.EMAIL || null,
        telefone: row.TELEFONE || null,
        whatsapp: row.WHATSAPP || null,
        instagram,
        site: row.SITE || null,
        cep: row.CEP ? row.CEP.replace(/\D/g, "") : null,
        estado: endereco.estado,
        cidade: endereco.cidade,
        bairro: endereco.bairro,
        logradouro: endereco.rua,
        numero: row.NUMERO ? String(row.NUMERO) : null,
        complemento: row.COMPLEMENTO || null,
        categoria: categoria.length > 0 ? categoria : null,
        descricao_beneficio: row.BENEFICIO || null,
        regras_utilizacao: row.REGRAS || null,
        periodo_validade_beneficio: mapearPeriodoValidade(row.REGRAS),
        horario_funcionamento: row.HORARIO_FUNCIONAMENTO || null,
        ativo: true,
        plan_status: "pending",
      };

      return {
        valid: true,
        errors: [],
        data: dadosMapeados,
        linha,
        dadosOriginais: row,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Erro ao processar: ${error instanceof Error ? error.message : "desconhecido"}`],
        data: null,
        linha,
        dadosOriginais: row,
      };
    }
  };

  const processFile = async () => {
    if (!file) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    setProcessando(true);
    setProgress(0);
    setProgressText("Lendo arquivo...");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<PlanilhaRow>(worksheet);

      if (jsonData.length === 0) {
        toast.error("Planilha vazia");
        setProcessando(false);
        return;
      }

      setProgressText(`Validando ${jsonData.length} registros...`);

      // Mapear e validar dados
      const results: ValidationResult[] = [];
      for (let i = 0; i < jsonData.length; i++) {
        const result = await mapearLinhaPlanilha(jsonData[i], i);
        results.push(result);

        // Atualizar progress
        const currentProgress = Math.round(((i + 1) / jsonData.length) * 100);
        setProgress(currentProgress);
        setProgressText(`Validando ${i + 1} de ${jsonData.length}...`);

        // Delay para não sobrecarregar ViaCEP
        if (i < jsonData.length - 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      setValidationResults(results);
      setShowPreview(true);

      const validCount = results.filter((r) => r.valid).length;
      const invalidCount = results.filter((r) => !r.valid).length;

      toast.success("Validação concluída!", {
        description: `${validCount} válidos, ${invalidCount} com erros`,
      });
    } catch (error) {
      toast.error("Erro ao processar arquivo", {
        description: "Verifique se o formato está correto",
      });
    } finally {
      setProcessando(false);
      setProgress(0);
      setProgressText("");
    }
  };

  // ============================================
  // IMPORTAÇÃO
  // ============================================

  const geocodificarEstabelecimento = async (id: string, dados: EstabelecimentoData) => {
    try {
      const { data, error } = await supabase.functions.invoke("geocode-address", {
        body: {
          rua: dados.logradouro,
          numero: dados.numero,
          bairro: dados.bairro,
          cidade: dados.cidade,
          estado: dados.estado,
        },
      });

      if (!error && data?.success) {
        await supabase
          .from("estabelecimentos")
          .update({
            latitude: data.latitude,
            longitude: data.longitude,
            endereco_formatado: data.endereco_formatado,
          })
          .eq("id", id);
      }
    } catch {
      // Silently fail geocoding - não é crítico
    }
  };

  const importData = async () => {
    const validData = validationResults.filter((r) => r.valid && r.data);

    if (validData.length === 0) {
      toast.error("Nenhum dado válido para importar");
      return;
    }

    setImporting(true);
    setProgress(0);

    let sucessos = 0;
    let erros = 0;

    try {
      for (let i = 0; i < validData.length; i++) {
        const result = validData[i];

        setProgressText(`Importando ${i + 1} de ${validData.length}: ${result.data!.nome_fantasia}`);
        setProgress(Math.round(((i + 1) / validData.length) * 100));

        try {
          const { data: insertedData, error } = await supabase
            .from("estabelecimentos")
            .upsert(result.data!, {
              onConflict: "cnpj",
              ignoreDuplicates: false,
            })
            .select()
            .single();

          if (error) {
            erros++;
          } else {
            sucessos++;

            // Geocodificar após inserir
            if (insertedData && result.data!.cidade && result.data!.estado) {
              await geocodificarEstabelecimento(insertedData.id, result.data!);
            }
          }

          // Rate limit
          if (i < validData.length - 1) {
            await new Promise((r) => setTimeout(r, 100));
          }
        } catch {
          erros++;
        }
      }

      toast.success("Importação concluída!", {
        description: `${sucessos} cadastrados, ${erros} erros`,
      });

      // Limpar
      clearFile();
    } catch {
      toast.error("Erro durante importação");
    } finally {
      setImporting(false);
      setProgress(0);
      setProgressText("");
    }
  };

  // ============================================
  // RELATÓRIO DE ERROS
  // ============================================

  const downloadRelatorioErros = useCallback(() => {
    const erros = validationResults.filter((r) => !r.valid);

    if (erros.length === 0) {
      toast.info("Nenhum erro encontrado!");
      return;
    }

    const relatorioData = erros.map((erro) => ({
      Linha: erro.linha,
      Nome: erro.dadosOriginais?.NOME_ESTABELECIMENTO || "-",
      Erro: erro.errors.join(" | "),
      ...erro.dadosOriginais,
    }));

    const ws = XLSX.utils.json_to_sheet(relatorioData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Erros");

    const dataHora = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    XLSX.writeFile(wb, `erros_importacao_${dataHora}.xlsx`);

    toast.success("Relatório gerado!", {
      description: `${erros.length} erro(s) exportado(s)`,
    });
  }, [validationResults]);

  // ============================================
  // CONTADORES
  // ============================================

  const validCount = validationResults.filter((r) => r.valid).length;
  const invalidCount = validationResults.filter((r) => !r.valid).length;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Estabelecimentos em Massa</CardTitle>
          <CardDescription>
            Faça upload de uma planilha Excel ou CSV para cadastrar múltiplos estabelecimentos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Download Template */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Planilha Modelo</p>
              <p className="text-sm text-muted-foreground">Baixe o template e preencha com os dados</p>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="min-h-[44px]">
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Baixar Template
            </Button>
          </div>

          {/* Upload Area */}
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              file && "border-green-500 bg-green-500/5",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Selecionar arquivo para importação"
            />

            {file ? (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8 text-green-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    clearFile();
                  }}
                  className="min-h-[44px] text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium">
                    {isDragging ? "Solte o arquivo aqui" : "Arraste ou clique para selecionar"}
                  </p>
                  <p className="text-sm text-muted-foreground">Excel (.xlsx, .xls) ou CSV</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {(processando || importing) && (
            <div className="space-y-2" role="status" aria-live="polite">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progressText}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Botão Validar */}
          {file && !showPreview && (
            <Button onClick={processFile} disabled={processando} className="w-full min-h-[44px]">
              {processando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Processando...
                </>
              ) : (
                "Validar Dados"
              )}
            </Button>
          )}

          {/* Preview */}
          {showPreview && (
            <div className="space-y-4">
              {/* Contadores */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-muted-foreground">Válidos</p>
                      <p className="text-2xl font-bold">{validCount}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-muted-foreground">Com Erros</p>
                      <p className="text-2xl font-bold">{invalidCount}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tabela de Preview */}
              <div className="rounded-md border overflow-x-auto max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[60px]">Linha</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Erro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.slice(0, 50).map((result, i) => (
                      <TableRow key={i} className={result.valid ? "" : "bg-red-500/5"}>
                        <TableCell className="font-mono text-sm">{result.linha}</TableCell>
                        <TableCell>
                          {result.valid ? (
                            <Badge variant="outline" className="text-green-500 border-green-500">
                              OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Erro</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.dadosOriginais?.NOME_ESTABELECIMENTO || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {result.data?.cidade || result.dadosOriginais?.CIDADE || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-red-500">{result.errors.join(", ") || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {validationResults.length > 50 && (
                <p className="text-sm text-muted-foreground text-center">
                  Mostrando 50 de {validationResults.length} registros
                </p>
              )}

              {/* Erros */}
              {invalidCount > 0 && (
                <Card className="p-4 border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-500 mb-2">{invalidCount} registro(s) com erro</p>
                      <Button
                        onClick={downloadRelatorioErros}
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] border-amber-500/30 hover:bg-amber-500/10"
                      >
                        <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                        Baixar Relatório de Erros
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={clearFile} disabled={importing} className="min-h-[44px] flex-1">
                  Cancelar
                </Button>
                {validCount > 0 && (
                  <Button onClick={importData} disabled={importing} className="min-h-[44px] flex-1">
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Importando...
                      </>
                    ) : (
                      `Importar ${validCount} Estabelecimento(s)`
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
