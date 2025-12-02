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
import { normalizarCidade } from '@/lib/utils';

interface ImportError {
  row: number;
  empresa: string;
  error: string;
}

interface ImportWarning {
  row: number;
  empresa: string;
  warning: string;
}

interface ProcessResult {
  success: number;
  errors: ImportError[];
  warnings: ImportWarning[];
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

  // Valores padrão para campos vazios (ADMIN IMPORT - nenhum campo obrigatório)
  const VALORES_PADRAO = {
    nome_fantasia: 'Estabelecimento sem nome',
    razao_social: 'Razão Social Pendente',
    categoria: 'Outros Comércios',
    especialidades: [],
    descricao_beneficio: 'Benefício especial para aniversariantes',
    regras_beneficio: 'Apresentar documento com foto',
    periodo_validade: 'dia_aniversario',
    cidade: '',
    estado: '',
  };

  // Função para buscar próximo código sequencial
  const gerarProximoCodigo = async (): Promise<number> => {
    const { data, error } = await supabase
      .from('estabelecimentos')
      .select('codigo')
      .not('codigo', 'is', null)
      .order('codigo', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 0;
    }

    const ultimoCodigo = data[0]?.codigo;
    if (ultimoCodigo && /^\d+$/.test(ultimoCodigo)) {
      return parseInt(ultimoCodigo, 10) + 1;
    }
    return 0;
  };

  // Mapeamento de estados por nome completo para sigla (UF)
  const normalizeEstado = (estado: string): string => {
    if (!estado) return '';
    
    const normalized = estado.trim().toLowerCase();
    
    // Se já é uma sigla de 2 caracteres, retorna em maiúsculo
    if (normalized.length === 2) {
      return normalized.toUpperCase();
    }
    
    // Mapeamento de nomes completos para siglas
    const estadosMap: Record<string, string> = {
      'acre': 'AC',
      'alagoas': 'AL',
      'amapa': 'AP',
      'amapá': 'AP',
      'amazonas': 'AM',
      'bahia': 'BA',
      'ceara': 'CE',
      'ceará': 'CE',
      'distrito federal': 'DF',
      'espirito santo': 'ES',
      'espírito santo': 'ES',
      'goias': 'GO',
      'goiás': 'GO',
      'maranhao': 'MA',
      'maranhão': 'MA',
      'mato grosso': 'MT',
      'mato grosso do sul': 'MS',
      'minas gerais': 'MG',
      'para': 'PA',
      'pará': 'PA',
      'paraiba': 'PB',
      'paraíba': 'PB',
      'parana': 'PR',
      'paraná': 'PR',
      'pernambuco': 'PE',
      'piaui': 'PI',
      'piauí': 'PI',
      'rio de janeiro': 'RJ',
      'rio grande do norte': 'RN',
      'rio grande do sul': 'RS',
      'rondonia': 'RO',
      'rondônia': 'RO',
      'roraima': 'RR',
      'santa catarina': 'SC',
      'sao paulo': 'SP',
      'são paulo': 'SP',
      'sergipe': 'SE',
      'tocantins': 'TO',
    };
    
    return estadosMap[normalized] || estado.toUpperCase().slice(0, 2);
  };

  const cleanCNPJ = (cnpj: string): string => {
    if (!cnpj) return "";
    return cnpj.replace(/\D/g, "");
  };

  const cleanCEP = (cep: string): string => {
    if (!cep) return "";
    return cep.replace(/\D/g, "");
  };

  const cleanPhone = (phone: string): string => {
    if (!phone) return "";
    return phone.replace(/[^\d\s\-\(\)]/g, "").trim();
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

  // Processar especialidades da planilha
  const processarEspecialidades = (especialidadesString: string | undefined | null): string[] => {
    if (!especialidadesString || String(especialidadesString).trim() === '') {
      return [];
    }
    
    // Separar por vírgula, limpar espaços, limitar a 3
    return String(especialidadesString)
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0)
      .slice(0, 3); // Máximo 3 especialidades
  };

  // Validar se especialidades existem na categoria
  const validarEspecialidades = async (categoria: string, especialidades: string[]): Promise<string[]> => {
    if (especialidades.length === 0) return [];
    
    const { data: especialidadesValidas } = await supabase
      .from('especialidades')
      .select('nome')
      .eq('categoria', categoria)
      .eq('ativo', true)
      .in('nome', especialidades);
    
    if (!especialidadesValidas) return [];
    
    // Retornar apenas as que existem na tabela
    const nomesValidos = especialidadesValidas.map(e => e.nome);
    return especialidades.filter(e => nomesValidos.includes(e));
  };

  // Função para extrair valores de colunas com múltiplas variações (case-insensitive)
  const getColumnValue = (row: any, ...possibleNames: string[]): string | null => {
    if (!row) return null;
    
    const rowKeys = Object.keys(row);
    
    for (const name of possibleNames) {
      // Tentar nome exato
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return String(row[name]).trim();
      }
      
      // Buscar case-insensitive
      const found = rowKeys.find(k => k.toLowerCase().trim() === name.toLowerCase().trim());
      if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') {
        return String(row[found]).trim();
      }
    }
    
    return null;
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

  const processBatch = async (items: any[], startIndex: number, codigoInicial: number) => {
    const batchSize = 3;
    const batch = items.slice(startIndex, startIndex + batchSize);
    
    const results = await Promise.all(
      batch.map(async (row, batchIdx) => {
        const rowNumber = startIndex + batchIdx + 2;
        let nome: string | null = null;
        const warnings: string[] = [];
        
        // Gerar código sequencial para esta linha
        const codigoAtual = (codigoInicial + startIndex + batchIdx).toString().padStart(6, '0');
        
        try {
          // === EXTRAÇÃO DE DADOS COM MAPEAMENTO FLEXÍVEL ===
          // ADMIN IMPORT: Nenhum campo obrigatório - aceita tudo
          
          // Nome do estabelecimento - aceita várias variações (usa padrão se vazio)
          nome = getColumnValue(row,
            'EMPRESA', 'NOME_ESTABELECIMENTO', 'NOME', 'Nome Fantasia', 'Nome', 
            'nome_fantasia', 'RAZAO_SOCIAL', 'Razao Social', 'razao_social',
            'NOME_EMPRESA', 'Nome Empresa', 'ESTABELECIMENTO', 'Estabelecimento'
          );

          if (!nome) {
            nome = VALORES_PADRAO.nome_fantasia;
            warnings.push('Nome não informado - usando padrão');
          }

          // Cidade (usa vazio se não informado)
          const cidadeRaw = getColumnValue(row, 
            'CIDADE', 'Cidade', 'cidade', 'CITY', 'City', 'MUNICIPIO', 'Municipio'
          );

          if (!cidadeRaw) {
            warnings.push('Cidade não informada');
          }

          // Estado (usa vazio se não informado)
          const estadoRaw = getColumnValue(row, 
            'ESTADO', 'Estado', 'estado', 'UF', 'Uf', 'uf', 'STATE', 'State'
          );

          // CNPJ (OPCIONAL)
          const cnpjRaw = getColumnValue(row, 'CNPJ', 'cnpj', 'Cnpj');
          const cnpj = cnpjRaw ? cleanCNPJ(cnpjRaw) : '';
          
          if (!cnpj) {
            warnings.push('CNPJ não informado - estabelecimento cadastrado sem CNPJ');
          }

          // Telefone
          const telefoneRaw = getColumnValue(row, 
            'TELEFONE', 'Telefone', 'telefone', 'CONTATO', 'Contato', 'contato',
            'PHONE', 'Phone', 'TEL', 'Tel'
          );
          const telefone = telefoneRaw ? cleanPhone(telefoneRaw) : null;

          // WhatsApp (fallback para telefone se não tiver)
          const whatsappRaw = getColumnValue(row, 
            'WHATSAPP', 'WhatsApp', 'whatsapp', 'Whatsapp', 'ZAPP', 'Zap', 'ZAP'
          );
          const whatsapp = whatsappRaw ? cleanPhone(whatsappRaw) : telefone;

          // Email
          const email = getColumnValue(row, 
            'EMAIL', 'Email', 'email', 'E-MAIL', 'E-mail', 'e-mail'
          );

          // CEP
          const cepRaw = getColumnValue(row, 'CEP', 'cep', 'Cep', 'CODIGO_POSTAL');
          const cep = cepRaw ? cleanCEP(cepRaw) : null;

          // Bairro (da planilha)
          const bairroRaw = getColumnValue(row, 
            'BAIRRO', 'Bairro', 'bairro', 'NEIGHBORHOOD', 'Neighborhood'
          );

          // Logradouro/Rua (da planilha)
          const logradouroRaw = getColumnValue(row, 
            'RUA', 'Rua', 'rua', 'LOGRADOURO', 'Logradouro', 'logradouro',
            'ENDERECO', 'Endereco', 'endereco', 'ENDEREÇO', 'Endereço', 'ADDRESS'
          );

          // Número
          const numeroRaw = getColumnValue(row, 
            'NUMERO', 'Numero', 'numero', 'NÚMERO', 'Número', 'NUM', 'Num', 'N'
          );

          // Complemento
          const complementoRaw = getColumnValue(row, 
            'COMPLEMENTO', 'Complemento', 'complemento', 'COMP', 'Comp'
          );

          // Instagram
          const instagramRaw = getColumnValue(row, 
            'INSTAGRAM', 'Instagram', 'instagram', 'INSTA', 'Insta', 'IG', 'ig'
          );

          // Site
          const site = getColumnValue(row, 
            'SITE', 'Site', 'site', 'WEBSITE', 'Website', 'website', 'URL', 'Url'
          );

          // Categoria (OPCIONAL - usa padrão)
          const categoriaRaw = getColumnValue(row, 
            'CATEGORIA', 'Categoria', 'categoria', 'CATEGORY', 'Category', 'TIPO', 'Tipo'
          );
          
          const categoriaMapeada = categoriaRaw ? mapCategory(categoriaRaw) : VALORES_PADRAO.categoria;
          
          if (!categoriaRaw) {
            warnings.push(`Categoria não informada - usando "${VALORES_PADRAO.categoria}"`);
          }

          // Benefício (OPCIONAL - usa padrão)
          const beneficioRaw = getColumnValue(row, 
            'BENEFICIO', 'Beneficio', 'beneficio', 'BENEFÍCIO', 'Benefício',
            'BENEFICIO E REGRAS', 'Beneficio e Regras', 'DESCRICAO', 'Descricao',
            'DESCRICAO_BENEFICIO', 'OFERTA', 'Oferta'
          );
          
          const beneficio = beneficioRaw || VALORES_PADRAO.descricao_beneficio;
          
          if (!beneficioRaw) {
            warnings.push('Descrição do benefício não informada - usando padrão');
          }

          // Regras / Validade
          const validadeRaw = getColumnValue(row, 
            'VALIDADE', 'Validade', 'validade', 'DIA/SEMANA/MÊS', 'PERIODO',
            'Periodo', 'REGRAS', 'Regras', 'regras'
          );
          
          const regras = validadeRaw || VALORES_PADRAO.regras_beneficio;

          // Horário de funcionamento
          const horario = getColumnValue(row, 
            'HORARIO', 'Horario', 'horario', 'HORÁRIO', 'Horário',
            'HORARIO_FUNCIONAMENTO', 'Horario Funcionamento', 'FUNCIONAMENTO'
          );

          // Especialidades
          const especialidadesRaw = getColumnValue(row,
            'ESPECIALIDADES', 'Especialidades', 'especialidades',
            'ESPECIALIDADE', 'Especialidade', 'especialidade',
            'SUBCATEGORIA', 'Subcategoria', 'subcategoria',
            'SUBCATEGORIAS', 'Subcategorias', 'subcategorias'
          );

          // Processar e validar especialidades
          const especialidadesArray = processarEspecialidades(especialidadesRaw);
          let especialidadesValidadas: string[] = [];
          
          if (especialidadesArray.length > 0 && categoriaMapeada) {
            especialidadesValidadas = await validarEspecialidades(categoriaMapeada, especialidadesArray);
            
            const ignoradas = especialidadesArray.filter(e => !especialidadesValidadas.includes(e));
            if (ignoradas.length > 0) {
              warnings.push(`Especialidades ignoradas (não existem para ${categoriaMapeada}): ${ignoradas.join(', ')}`);
            }
          }

          // NOVO FLUXO: Buscar endereço pelo CEP (só se tiver CEP)
          const addressData = cep ? await fetchAddressByCep(cep) : null;
          
          let finalAddress: string | null = null;
          let coordinates: { lat: number; lng: number } | null = null;

          // Priorizar dados do CEP, fallback para dados da planilha
          let cidade = addressData?.city || cidadeRaw;
          if (cidade) cidade = normalizarCidade(cidade);

          let estado = normalizeEstado(addressData?.state || estadoRaw || '');
          let logradouro = addressData?.street || logradouroRaw || '';
          let bairro = addressData?.neighborhood || bairroRaw || '';
          const numero = numeroRaw || "";
          const complemento = complementoRaw ? `, ${complementoRaw}` : "";

          // Montar endereço formatado se tiver dados mínimos
          if (cidade && estado) {
            const partes = [];
            if (logradouro) partes.push(`${logradouro}${numero ? ', ' + numero : ''}${complemento}`);
            if (bairro) partes.push(bairro);
            partes.push(`${cidade} - ${estado}`);
            finalAddress = partes.join(" - ");
            
            // Geocodificar usando Edge Function
            const coords = await geocodeAddress(
              logradouro,
              numero,
              bairro,
              cidade,
              estado
            );
            if (coords) {
              coordinates = coords;
            } else {
              warnings.push('Coordenadas não encontradas - geocodificação pendente');
            }
          }

          // Google Places (foto e avaliação)
          let placeDetails = { photoUrl: null, rating: null, ratingsTotal: null };
          if (nome && finalAddress && coordinates) {
            placeDetails = await getPlaceDetails(nome, finalAddress, cidade || "", estado || "");
          }

          // Preparar dados para inserção
          const estabelecimentoData = {
            codigo: codigoAtual,
            razao_social: nome || VALORES_PADRAO.razao_social,
            nome_fantasia: nome || VALORES_PADRAO.nome_fantasia,
            cnpj: cnpj || null,
            categoria: [categoriaMapeada],
            especialidades: especialidadesValidadas,
            telefone: telefone,
            whatsapp: whatsapp,
            email: email || null,
            endereco: finalAddress,
            cep: cep || null,
            logradouro: logradouro || null,
            numero: numeroRaw || null,
            complemento: complementoRaw || null,
            bairro: bairro || null,
            latitude: coordinates?.lat || null,
            longitude: coordinates?.lng || null,
            instagram: instagramRaw ? cleanInstagram(instagramRaw) : null,
            site: site || null,
            descricao_beneficio: beneficio,
            regras_utilizacao: regras,
            // Extrair validade do texto do benefício se não tiver campo específico
            periodo_validade_beneficio: validadeRaw 
              ? mapValidity(validadeRaw) 
              : (beneficio ? mapValidity(beneficio) : VALORES_PADRAO.periodo_validade),
            horario_funcionamento: horario || null,
            logo_url: placeDetails.photoUrl || null,
            ativo: true,
            plan_status: "active",
            cadastro_completo: true,
            tem_conta_acesso: false,
            cidade: cidade || null,
            estado: estado || null,
            deleted_at: null,
          };

          // Inserir/Atualizar no Supabase
          const { data: rpcResult, error: insertError } = await supabase
            .rpc('upsert_establishment_bulk', { p_data: estabelecimentoData });

          const result = rpcResult as { success: boolean; error?: string } | null;

          if (insertError || (result && !result.success)) {
            return {
              success: false,
              rowNumber,
              empresa: nome,
              error: `Erro ao salvar: ${insertError?.message || result?.error || 'Erro desconhecido'}`,
              warnings: [],
              hasGeocode: false,
              hasPhoto: false,
            };
          }

          return {
            success: true,
            rowNumber,
            empresa: nome,
            warnings,
            hasGeocode: !!coordinates,
            hasPhoto: !!placeDetails.photoUrl,
          };
        } catch (error: any) {
          return {
            success: false,
            rowNumber,
            empresa: nome || "N/A",
            error: error.message || "Erro desconhecido",
            warnings: [],
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

      // Buscar próximo código sequencial ANTES de processar
      const codigoInicial = await gerarProximoCodigo();
      console.log(`[Import] Código inicial: ${codigoInicial.toString().padStart(6, '0')}`);

      // Processar em batches de 3 em 3
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batchResults = await processBatch(jsonData, i, codigoInicial);
        
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

        setResult({ success: successCount, errors, warnings: [] });
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

  const downloadTemplate = () => {
    // Cabeçalhos - formato solicitado pelo usuário
    const headers = [
      'CODIGO',
      'EMAIL',
      'SENHA',
      'NOME_ESTABELECIMENTO',
      'HORARIO_FUNCIONAMENTO',
      'CNPJ',
      'CEP',
      'ESTADO',
      'CIDADE',
      'BAIRRO',
      'RUA',
      'NUMERO',
      'COMPLEMENTO',
      'TELEFONE',
      'WHATSAPP',
      'INSTAGRAM',
      'SITE',
      'CATEGORIA',
      'ESPECIALIDADE',
      'BENEFICIO'
    ];

    // Linha de exemplo - Restaurante (código deixar em branco para gerar automático)
    const exemploRestaurante = [
      '', // CODIGO - deixar vazio para gerar automático
      'contato@pizzariadojoao.com.br',
      '', // SENHA - opcional
      'Pizzaria do João',
      'Seg-Sex 18h-23h, Sáb-Dom 12h-23h',
      '12.345.678/0001-90',
      '88000-000',
      'SC',
      'Florianópolis',
      'Centro',
      'Rua das Flores',
      '123',
      'Sala 1',
      '(48) 3333-4444',
      '(48) 99999-8888',
      '@pizzariadojoao',
      'https://pizzariadojoao.com.br',
      'Restaurante',
      'Pizzaria, Italiana',
      '20% de desconto no dia do aniversário'
    ];

    // Linha de exemplo - Bar
    const exemploBar = [
      '', // CODIGO - deixar vazio para gerar automático
      'contato@botecodooze.com.br',
      '',
      'Boteco do Zé',
      'Seg-Sáb 17h-02h',
      '98.765.432/0001-10',
      '88010-100',
      'SC',
      'Florianópolis',
      'Lagoa da Conceição',
      'Av. das Rendeiras',
      '500',
      '',
      '(48) 3222-1111',
      '(48) 98888-7777',
      '@botecodooze',
      '',
      'Bar',
      'Boteco, Música ao Vivo',
      'Chopp grátis para aniversariante'
    ];

    // Linha de instruções
    const instrucoes = [
      '--- INSTRUÇÕES ---',
      'Deixe em branco para gerar automático',
      'Email de contato (opcional)',
      'Opcional (para login)',
      'Nome do estabelecimento',
      'Horário de funcionamento',
      'CNPJ (opcional)',
      'CEP (opcional)',
      'UF (2 letras)',
      'Nome da cidade',
      'Nome do bairro',
      'Nome da rua/avenida',
      'Número do endereço',
      'Complemento (opcional)',
      'Telefone fixo',
      'WhatsApp',
      'Instagram (sem @)',
      'URL completa',
      'Categoria do estabelecimento',
      'Especialidades (até 3)',
      'Descrição do benefício'
    ];

    // Montar CSV
    const csvContent = [
      headers.join(';'),
      instrucoes.join(';'),
      exemploRestaurante.join(';'),
      exemploBar.join(';'),
      '',
      '--- CATEGORIAS DISPONÍVEIS ---',
      'Academia;Bar;Barbearia;Cafeteria;Casa Noturna;Confeitaria;Entretenimento;Hospedagem;Loja de Presentes;Moda e Acessórios;Restaurante;Salão de Beleza;Saúde e Suplementos;Serviços;Outros Comércios',
      '',
      '--- NOTAS IMPORTANTES ---',
      'CODIGO: Deixe em branco para gerar automaticamente (000000, 000001, etc)',
      'NENHUM CAMPO É OBRIGATÓRIO - preencha o que tiver',
      'Estabelecimentos com mesmo CNPJ serão atualizados (não duplicados)'
    ].join('\n');

    // Criar blob e download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_estabelecimentos_aniversariantevip.csv';
    link.click();
    URL.revokeObjectURL(link.href);
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

          {/* Instruções de Importação */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-white mb-2">📋 Instruções de Importação (Admin)</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Baixe o template CSV e preencha com seus dados</li>
              <li>• <strong className="text-emerald-400">Nenhum campo é obrigatório</strong> - preencha o que tiver disponível</li>
              <li>• <strong className="text-violet-400">CÓDIGO:</strong> Deixe em branco para gerar automaticamente (000000, 000001, etc)</li>
              <li>• <strong className="text-white">Especialidades:</strong> Até 3, separadas por vírgula</li>
              <li>• Estabelecimentos com CNPJ duplicado serão atualizados (não duplicados)</li>
            </ul>
          </div>

          {/* Botão de Download do Template */}
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="w-full mb-4 border-violet-500 text-violet-400 hover:bg-violet-500/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Template CSV
          </Button>

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
