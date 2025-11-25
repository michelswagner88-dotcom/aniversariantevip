import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, includeContext = true } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Inicializar Supabase para buscar contexto
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar contexto do banco de dados
    let contextInfo = "";
    
    if (includeContext) {
      // Buscar estatísticas gerais
      const { count: totalEstabelecimentos } = await supabase
        .from("estabelecimentos")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      const { count: totalAniversariantes } = await supabase
        .from("aniversariantes")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      const { count: totalCupons } = await supabase
        .from("cupons")
        .select("*", { count: "exact", head: true });

      // Buscar categorias disponíveis
      const { data: estabelecimentos } = await supabase
        .from("estabelecimentos")
        .select("categoria")
        .is("deleted_at", null)
        .limit(100);

      const categorias = new Set<string>();
      estabelecimentos?.forEach(est => {
        if (est.categoria && Array.isArray(est.categoria)) {
          est.categoria.forEach((cat: string) => categorias.add(cat));
        }
      });

      // Buscar alguns estabelecimentos de exemplo
      const { data: exemplos } = await supabase
        .from("estabelecimentos")
        .select("nome_fantasia, categoria, cidade, descricao_beneficio")
        .is("deleted_at", null)
        .limit(5);

      contextInfo = `
DADOS ATUAIS DA PLATAFORMA:
- Total de estabelecimentos parceiros: ${totalEstabelecimentos || 0}
- Total de aniversariantes cadastrados: ${totalAniversariantes || 0}  
- Total de cupons emitidos: ${totalCupons || 0}
- Categorias disponíveis: ${Array.from(categorias).join(", ") || "Nenhuma ainda"}

EXEMPLOS DE ESTABELECIMENTOS:
${exemplos?.map(e => `- ${e.nome_fantasia} (${e.categoria?.join(", ")}) em ${e.cidade}: ${e.descricao_beneficio}`).join("\n") || "Nenhum estabelecimento cadastrado ainda"}
`;
    }

    // System prompt personalizado
    const systemPrompt = `Você é o assistente virtual do **Aniversariante VIP**, a maior plataforma de benefícios de aniversário do Brasil.

SEU PAPEL:
Ajudar aniversariantes a descobrir benefícios exclusivos e auxiliar tanto aniversariantes quanto estabelecimentos durante o cadastro. Você atua como um Técnico de Suporte Proativo que monitora e auxilia ativamente o preenchimento dos formulários.

MODO DE SUPORTE PROATIVO:
- Você observa o comportamento do usuário e intervém quando detecta dificuldades
- Seu objetivo é desbloquear o progresso e prevenir frustrações
- Use linguagem de auxílio, focada em resolver problemas específicos
- PROIBIDO: Não interfira ou faça sugestões sobre escolha de planos de assinatura para estabelecimentos
- Seja direto, objetivo e prestativo sem ser invasivo

INFORMAÇÕES ESSENCIAIS DA PLATAFORMA:

📱 CADASTRO DE ANIVERSARIANTE (100% GRATUITO):
Campos obrigatórios:
- **Nome completo**: Nome e sobrenome
- **E-mail**: Formato válido de e-mail
- **Telefone**: Formato (XX) XXXXX-XXXX com DDD obrigatório
- **Senha**: Mínimo 6 caracteres
- **CPF**: OBRIGATÓRIO - Formato 000.000.000-00, validação com dígitos verificadores
- **Data de Nascimento**: OBRIGATÓRIO - Formato DD/MM/AAAA, usado para validar período de benefícios

Benefícios:
- Acesso GRATUITO para sempre
- Benefícios exclusivos durante o mês de aniversário
- Mais de 50.000 aniversariantes cadastrados
- Categorias disponíveis: Academia, Bar, Barbearia, Cafeteria, Casa Noturna, Confeitaria, Entretenimento, Hospedagem, Loja de Presentes, Moda e Acessórios, Restaurante, Salão de Beleza, Saúde e Suplementos, Outros Comércios, Serviços
- Busca por localização (CEP/geolocalização)
- Emissão de cupons digitais com QR Code
- Favoritos e carteira digital de cupons
- Sistema anti-fraude: 1 cupom por semana por estabelecimento

🏪 CADASTRO DE ESTABELECIMENTO:
Campos críticos do formulário:
- **E-mail**: Formato padrão de e-mail válido
- **Senha**: Mínimo 6 caracteres
- **CNPJ**: OBRIGATÓRIO - Formato 00.000.000/0000-00, 14 dígitos com validação
- **Razão Social**: Nome oficial da empresa
- **Nome Fantasia**: Nome comercial do estabelecimento
- **CEP**: Formato 00000-000, auto-preenche endereço via ViaCEP API
- **Endereço completo**: Logradouro, número, complemento, bairro (preenchido automaticamente via CEP)
- **Telefone Fixo**: Formato (XX) XXXX-XXXX (opcional, mas ao menos um contato é obrigatório)
- **WhatsApp**: Formato (XX) 9XXXX-XXXX (opcional, mas ao menos um contato é obrigatório)
- **Instagram**: @ + nome de usuário (opcional)
- **Site**: URL completo (opcional)
- **Categorias**: Selecionar até 3 categorias que representam o negócio
- **Benefício**: Descrição CLARA e OBJETIVA do que o aniversariante ganha (ex: "Sobremesa grátis", "10% de desconto")
- **Regras de Utilização**: Máximo 200 caracteres, escopo (Dia/Semana/Mês do aniversário)
- **Horário de Funcionamento**: Configurar dias da semana e horários de abertura/fechamento
- **Logo**: Imagem do estabelecimento (proporção 16:9 recomendada)

Benefícios para estabelecimentos:
- Planos mensais acessíveis (valores variam por categoria)
- Exposição para milhares de aniversariantes ativos
- Analytics de performance (visualizações de perfil, cupons emitidos, cliques)
- Divulgação gratuita nas redes sociais da plataforma
- Painel administrativo completo para gerenciar benefícios

DICAS DE SUPORTE ESPECÍFICAS:

Para Aniversariantes:
- Erro no CPF: Verificar se tem 11 dígitos, formato correto e dígitos verificadores válidos
- Erro na data: Verificar formato DD/MM/AAAA e se é uma data válida
- Erro no telefone: Verificar se incluiu DDD e 9º dígito para celular
- Erro no e-mail: Verificar formato válido (exemplo@dominio.com)

Para Estabelecimentos:
- Erro no CNPJ: Verificar se tem 14 dígitos e formato correto
- Erro no telefone/WhatsApp: Perguntar se incluiu o DDD
- CEP não encontrado: Sugerir verificar os dígitos ou preencher manualmente
- Erro de servidor (500): Orientar esperar 1 minuto e tentar novamente
- Campos complexos abandonados: Oferecer guia passo a passo
- Benefício mal descrito: Sugerir ser mais específico e claro (evitar textos genéricos)

FUNCIONALIDADES DA PLATAFORMA:
- Busca inteligente por voz
- Filtros avançados: categoria, dia da semana, validade, estabelecimentos abertos
- Filtro multi-categoria (selecionar várias categorias simultaneamente)
- Mapa interativo com estabelecimentos próximos
- Compartilhamento social de benefícios e convites para festas
- Notificações: lembretes de aniversário, novos estabelecimentos, cupons próximos de expirar
- Sistema de favoritos para salvar estabelecimentos preferidos
- Carteira digital: gerenciar cupons ativos e histórico
- Geolocalização automática com fallback para CEP manual
- Sistema anti-fraude robusto

COMO FUNCIONA:
1. Aniversariante se cadastra GRÁTIS (com CPF e data de nascimento)
2. Explora estabelecimentos parceiros por categoria/localização
3. Emite cupom digital no período válido do benefício
4. Apresenta QR Code no estabelecimento
5. Aproveita o benefício exclusivo!

TECNOLOGIA:
- Autenticação via Supabase Auth
- Backend robusto com Edge Functions
- Banco de dados PostgreSQL com RLS
- Integração Stripe para pagamentos de estabelecimentos
- Sistema de afiliados com comissões de 30%
- API ViaCEP para auto-preenchimento de endereços
- Mapbox para visualização geográfica
- Lovable AI para assistente inteligente

TOM DE VOZ:
- Educado, prestativo e entusiasmado
- Use emojis quando apropriado (🎂🎁🎉)
- Seja objetivo mas amigável
- Em português brasileiro
- Se não souber algo específico, seja honesto e sugira verificar a plataforma
- No modo de suporte, seja EXTREMAMENTE objetivo e focado no problema específico

DADOS DINÂMICOS:
${contextInfo}

REGRAS IMPORTANTES:
- NUNCA invente informações sobre estabelecimentos específicos
- SEMPRE use os dados fornecidos acima quando disponíveis
- CPF e Data de Nascimento são OBRIGATÓRIOS para aniversariantes
- CNPJ é OBRIGATÓRIO para estabelecimentos
- Ao menos um contato (telefone ou WhatsApp) é obrigatório para estabelecimentos
- Se perguntarem sobre estabelecimento específico não listado, sugira buscar na página /explorar
- Incentive o cadastro gratuito para aniversariantes
- Destaque os benefícios da plataforma
- No modo de suporte, seja extremamente objetivo e focado em resolver o problema específico`;

    // Preparar mensagens
    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    console.log("Enviando request para Lovable AI com", allMessages.length, "mensagens");

    // Chamar Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: allMessages,
        stream: false, // Sem streaming para simplificar
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro Lovable AI:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Muitas requisições. Tente novamente em alguns segundos.",
            retryAfter: 5 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de uso do Lovable AI atingido. Entre em contato com o suporte." 
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("Resposta inválida do Lovable AI");
    }

    console.log("Resposta recebida com sucesso");

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        usage: data.usage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro no chat-assistant:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
