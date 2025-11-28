import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Download, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: any;
  linha: number;
  dadosOriginais?: any; // Armazena dados originais da planilha para relatório
}

// Função para buscar endereço pelo CEP via ViaCEP
const buscarEnderecoPorCEP = async (cep: string): Promise<{
  estado: string;
  cidade: string;
  bairro: string;
  rua: string;
} | null> => {
  if (!cep) return null;
  
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      console.warn(`CEP não encontrado: ${cep}`);
      return null;
    }
    
    return {
      estado: data.uf || '',
      cidade: data.localidade || '',
      bairro: data.bairro || '',
      rua: data.logradouro || '',
    };
  } catch (error) {
    console.error(`Erro ao buscar CEP ${cep}:`, error);
    return null;
  }
};

// Mapear período de validade
const mapearPeriodoValidade = (regras: string): string => {
  if (!regras) return 'mes_aniversario';
  const regrasUpper = regras.toUpperCase();
  if (regrasUpper.includes('DIA')) return 'dia_aniversario';
  if (regrasUpper.includes('SEMANA')) return 'semana_aniversario';
  return 'mes_aniversario';
};

export const ImportarEstabelecimentos = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [processando, setProcessando] = useState(false);

  const downloadTemplate = () => {
    const template = [
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

  const mapearLinhaPlanilha = async (row: any, index: number): Promise<ValidationResult> => {
    try {
      // Validação básica
      if (!row.NOME_ESTABELECIMENTO) {
        return {
          valid: false,
          errors: [`Nome do estabelecimento obrigatório`],
          data: null,
          linha: index + 2,
          dadosOriginais: row,
        };
      }

      if (!row.CEP) {
        return {
          valid: false,
          errors: [`CEP obrigatório`],
          data: null,
          linha: index + 2,
          dadosOriginais: row,
        };
      }

      // Buscar endereço pelo CEP se campos estiverem vazios
      let endereco = {
        estado: row.ESTADO || '',
        cidade: row.CIDADE || '',
        bairro: row.BAIRRO || '',
        rua: row.RUA || '',
      };

      if (row.CEP && (!endereco.estado || !endereco.cidade)) {
        console.log(`Buscando endereço para CEP: ${row.CEP}`);
        const enderecoAPI = await buscarEnderecoPorCEP(row.CEP);
        
        if (enderecoAPI) {
          endereco = {
            estado: endereco.estado || enderecoAPI.estado,
            cidade: endereco.cidade || enderecoAPI.cidade,
            bairro: endereco.bairro || enderecoAPI.bairro,
            rua: endereco.rua || enderecoAPI.rua,
          };
          console.log(`Endereço encontrado:`, endereco);
        } else {
          return {
            valid: false,
            errors: [`CEP inválido ou não encontrado`],
            data: null,
            linha: index + 2,
            dadosOriginais: row,
          };
        }
      }

      // Mapear categoria
      let categoria: string[] = [];
      if (row.CATEGORIA) {
        categoria = [row.CATEGORIA];
      }

      // Formatar Instagram (adicionar @ se necessário)
      let instagram = row.INSTAGRAM || null;
      if (instagram && !instagram.startsWith('@')) {
        instagram = `@${instagram}`;
      }

      const dadosMapeados = {
        codigo: row.CODIGO || null,
        nome_fantasia: row.NOME_ESTABELECIMENTO || 'Pendente de preenchimento',
        razao_social: row.NOME_ESTABELECIMENTO || 'Pendente de preenchimento',
        cnpj: row.CNPJ ? row.CNPJ.replace(/\D/g, '') : null,
        email: row.EMAIL || null,
        telefone: row.TELEFONE || null,
        whatsapp: row.WHATSAPP || null,
        instagram,
        site: row.SITE || null,
        cep: row.CEP ? row.CEP.replace(/\D/g, '') : null,
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
        plan_status: 'pending',
      };

      return {
        valid: true,
        errors: [],
        data: dadosMapeados,
        linha: index + 2,
        dadosOriginais: row,
      };
    } catch (error) {
      console.error('Erro ao mapear linha:', error);
      return {
        valid: false,
        errors: [`Erro ao processar linha: ${error}`],
        data: null,
        linha: index + 2,
        dadosOriginais: row,
      };
    }
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

    setProcessando(true);

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
        setProcessando(false);
        return;
      }

      // Mapear e validar dados (incluindo busca de CEP)
      const results: ValidationResult[] = [];
      for (let i = 0; i < jsonData.length; i++) {
        const result = await mapearLinhaPlanilha(jsonData[i], i);
        results.push(result);
        
        // Delay pequeno para não sobrecarregar ViaCEP
        if (i < jsonData.length - 1) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

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
      setProcessando(false);
    }
  };

  const geocodificarEstabelecimento = async (id: string, dados: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: {
          rua: dados.logradouro,
          numero: dados.numero,
          bairro: dados.bairro,
          cidade: dados.cidade,
          estado: dados.estado,
        }
      });
      
      if (data?.success) {
        await supabase
          .from('estabelecimentos')
          .update({
            latitude: data.latitude,
            longitude: data.longitude,
            endereco_formatado: data.endereco_formatado,
          })
          .eq('id', id);
        
        console.log(`✅ Geocodificado: ${dados.nome_fantasia}`);
      }
    } catch (err) {
      console.warn(`⚠️ Erro ao geocodificar ${dados.nome_fantasia}:`, err);
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
      let sucessos = 0;
      let erros = 0;

      for (let i = 0; i < validData.length; i++) {
        const result = validData[i];
        
        try {
          console.log(`[${i + 1}/${validData.length}] Importando: ${result.data.nome_fantasia}`);
          
          // Inserir estabelecimento usando UPSERT (onConflict: cnpj)
          const { data: insertedData, error } = await supabase
            .from('estabelecimentos')
            .upsert(result.data, { 
              onConflict: 'cnpj',
              ignoreDuplicates: false 
            })
            .select()
            .single();

          if (error) {
            console.error(`Erro na linha ${result.linha}:`, error);
            erros++;
          } else {
            sucessos++;
            
            // Geocodificar após inserir (se tiver endereço)
            if (insertedData && result.data.cidade && result.data.estado) {
              await geocodificarEstabelecimento(insertedData.id, result.data);
            }
          }
          
          // Rate limit
          if (i < validData.length - 1) {
            await new Promise(r => setTimeout(r, 100));
          }
        } catch (err) {
          console.error(`Exceção na linha ${result.linha}:`, err);
          erros++;
        }
      }

      toast({
        title: "✅ Importação completa!",
        description: `${sucessos} estabelecimentos cadastrados. ${erros} erros.`,
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

  const downloadRelatorioErros = () => {
    const erros = validationResults.filter((r) => !r.valid);
    
    if (erros.length === 0) {
      toast({
        title: "Nenhum erro encontrado",
        description: "Todos os registros estão válidos!",
      });
      return;
    }

    const relatorioData = erros.map((erro) => ({
      Linha: erro.linha,
      Nome_Estabelecimento: erro.dadosOriginais?.NOME_ESTABELECIMENTO || '-',
      Erro: erro.errors.join(' | '),
      CODIGO: erro.dadosOriginais?.CODIGO || '',
      EMAIL: erro.dadosOriginais?.EMAIL || '',
      SENHA: erro.dadosOriginais?.SENHA || '',
      NOME_ESTABELECIMENTO: erro.dadosOriginais?.NOME_ESTABELECIMENTO || '',
      HORARIO_FUNCIONAMENTO: erro.dadosOriginais?.HORARIO_FUNCIONAMENTO || '',
      CNPJ: erro.dadosOriginais?.CNPJ || '',
      CEP: erro.dadosOriginais?.CEP || '',
      ESTADO: erro.dadosOriginais?.ESTADO || '',
      CIDADE: erro.dadosOriginais?.CIDADE || '',
      BAIRRO: erro.dadosOriginais?.BAIRRO || '',
      RUA: erro.dadosOriginais?.RUA || '',
      NUMERO: erro.dadosOriginais?.NUMERO || '',
      COMPLEMENTO: erro.dadosOriginais?.COMPLEMENTO || '',
      TELEFONE: erro.dadosOriginais?.TELEFONE || '',
      WHATSAPP: erro.dadosOriginais?.WHATSAPP || '',
      INSTAGRAM: erro.dadosOriginais?.INSTAGRAM || '',
      SITE: erro.dadosOriginais?.SITE || '',
      CATEGORIA: erro.dadosOriginais?.CATEGORIA || '',
      BENEFICIO: erro.dadosOriginais?.BENEFICIO || '',
      REGRAS: erro.dadosOriginais?.REGRAS || '',
    }));

    const ws = XLSX.utils.json_to_sheet(relatorioData);
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 8 },  // Linha
      { wch: 30 }, // Nome_Estabelecimento
      { wch: 50 }, // Erro
      { wch: 10 }, // CODIGO
      { wch: 25 }, // EMAIL
      { wch: 12 }, // SENHA
      { wch: 30 }, // NOME_ESTABELECIMENTO
      { wch: 20 }, // HORARIO_FUNCIONAMENTO
      { wch: 18 }, // CNPJ
      { wch: 10 }, // CEP
      { wch: 5 },  // ESTADO
      { wch: 20 }, // CIDADE
      { wch: 20 }, // BAIRRO
      { wch: 30 }, // RUA
      { wch: 8 },  // NUMERO
      { wch: 15 }, // COMPLEMENTO
      { wch: 15 }, // TELEFONE
      { wch: 15 }, // WHATSAPP
      { wch: 20 }, // INSTAGRAM
      { wch: 30 }, // SITE
      { wch: 15 }, // CATEGORIA
      { wch: 50 }, // BENEFICIO
      { wch: 10 }, // REGRAS
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Erros de Importação");
    
    const dataHora = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    XLSX.writeFile(wb, `relatorio_erros_importacao_${dataHora}.xlsx`);

    toast({
      title: "✅ Relatório gerado!",
      description: `${erros.length} erro(s) exportado(s) para Excel.`,
    });
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
              disabled={processando}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
            >
              {processando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando e buscando endereços...
                </>
              ) : (
                "Validar Dados"
              )}
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
                <div className="space-y-3">
                  <Card className="p-4 bg-amber-500/10 border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-500 mb-2">Erros encontrados:</p>
                        <ul className="text-xs text-slate-300 space-y-1 max-h-40 overflow-auto">
                          {validationResults
                            .filter((r) => !r.valid)
                            .map((r, i) => (
                              <li key={i}>• Linha {r.linha}: {r.errors.join(', ')}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                  
                  <Button
                    onClick={downloadRelatorioErros}
                    variant="outline"
                    className="w-full border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório de Erros (Excel)
                  </Button>
                </div>
              )}

              {validCount > 0 && (
                <Button
                  onClick={importData}
                  disabled={importing}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando e geocodificando...
                    </>
                  ) : (
                    `Importar ${validCount} Estabelecimento(s)`
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
