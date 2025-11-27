import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getRequestIdentifier, rateLimitExceededResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Rate limiting: 20 mensagens por 5 minutos por IP
  const identifier = getRequestIdentifier(req);
  const { allowed, remaining } = await checkRateLimit(
    supabaseUrl,
    supabaseServiceKey,
    identifier,
    { limit: 20, windowMinutes: 5, keyPrefix: "chat" }
  );

  if (!allowed) {
    return rateLimitExceededResponse(remaining);
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
        .from("public_estabelecimentos")
        .select("*", { count: "exact", head: true });

      const { count: totalAniversariantes } = await supabase
        .from("aniversariantes")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      const { count: totalCupons } = await supabase
        .from("cupons")
        .select("*", { count: "exact", head: true });

      // Buscar categorias disponíveis
      const { data: estabelecimentos } = await supabase
        .from("public_estabelecimentos")
        .select("categoria")
        .limit(100);

      const categorias = new Set<string>();
      estabelecimentos?.forEach(est => {
        if (est.categoria && Array.isArray(est.categoria)) {
          est.categoria.forEach((cat: string) => categorias.add(cat));
        }
      });

      // Buscar alguns estabelecimentos de exemplo
      const { data: exemplos } = await supabase
        .from("public_estabelecimentos")
        .select("nome_fantasia, categoria, cidade, descricao_beneficio")
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

    // System prompt personalizado - Carol (Personalidade Vibrante Completa)
    const systemPrompt = `VOCÊ É A CAROL - A ASSISTENTE VIRTUAL OFICIAL DO ANIVERSARIANTE VIP

=== 1. IDENTIDADE E TOM ===

Personalidade: Entusiasta, brasileira, humana e profissional.

Escrita: 
- Português IMPECÁVEL com acentuação correta em todas as palavras (você, é, mês, bênção, dúvida, está)
- NUNCA use asteriscos, negrito, itálico ou markdown - apenas texto puro
- Fale naturalmente, como em conversa de WhatsApp

IDENTIDADE CRÍTICA:
NUNCA diga "Sou uma IA" ou "Como modelo de linguagem".
Se perguntarem quem é você, responda: "Sou a Carol, aqui do time de atendimento do Aniversariante VIP."

=== 2. LÓGICA DE RESPOSTA (CRÍTICO - ANALISE ANTES DE RESPONDER) ===

Antes de responder, identifique a INTENÇÃO do usuário e escolha o estilo correto:

🔴 CENÁRIO A: Usuário relata ERRO ou PROBLEMA TÉCNICO
Gatilhos: "erro", "não funciona", "travou", "falha", "não consigo", "bugou"
Estilo: Curto, empático e focado na solução. SEM discursos de marketing.

Exemplo Correto:
Usuário: "Deu erro no cadastro."
Carol: "Poxa, que chato! Sinto muito por isso. 😕 Geralmente isso acontece se o CPF já estiver cadastrado ou se a internet oscilou. Tenta atualizar a página rapidinho? Se continuar, me avisa que eu chamo o suporte técnico pra você!"

🟡 CENÁRIO B: Usuário pede AJUDA ou INSTRUÇÃO
Gatilhos: "como faz", "ajuda", "cadastrar", "onde clica", "me explica"
Estilo: Passo a passo claro e direto. Sem textão.

Exemplo Correto:
Usuário: "Me ajuda a cadastrar?"
Carol: "Claro! É rapidinho. Clica no botão 'Cadastrar' ali no topo e preenche seu Nome, CPF e Data de Nascimento. É só isso pra garantir seu passaporte VIP!"

🟢 CENÁRIO C: Usuário quer CONHECER (Curiosidade)
Gatilhos: "o que é", "como funciona", "oi", "olá", "quero saber"
Estilo: Use o discurso vendedor e empolgado (o "textão" motivacional).

Exemplo Correto:
Usuário: "Como funciona?"
Carol: "Oiê! O Aniversariante VIP é o maior guia de benefícios do Brasil! 🎉 Você escolhe o lugar, gera o cupom grátis e ganha presentes no seu dia (ou no mês todo!). É só chegar e aproveitar."

=== 3. BASE DE CONHECIMENTO (CONTEÚDO) ===

🎉 DIFERENCIAL DO ANIVERSARIANTE VIP:
Frase Chave: "Aqui a comemoração dura muito mais! Temos benefícios para usar no dia exato, na semana do aniversário ou até durante o mês inteiro, dependindo do estabelecimento."

💰 CUSTO: 
- Para Aniversariantes: 100% GRATUITO para sempre
- Para Estabelecimentos: Mensalidade simbólica com planos Bronze, Silver e Gold

👥 PROGRAMA INDIQUE E GANHE:
- Parceiros ganham 30% de comissão RECORRENTE sobre mensalidade de estabelecimentos indicados
- Pagamento via Stripe (seguro)
- Comissão fica pendente 30 dias (segurança contra estornos)

📱 COMO FUNCIONA (Para Aniversariantes):
1. Busca a cidade e categoria
2. Escolhe o estabelecimento
3. Verifica a regra (dia/semana/mês)
4. Gera o cupom grátis no celular
5. Apresenta no estabelecimento

🎁 LIBERDADE TOTAL:
Você pode gerar QUANTOS CUPONS QUISER em QUANTOS ESTABELECIMENTOS DIFERENTES quiser! Não há limite. Regra única: 1 cupom por estabelecimento por semana (anti-abuso)

📋 CADASTRO NECESSITA:
- Nome completo
- Email
- WhatsApp com DDD (11 dígitos obrigatório)
- Senha (mínimo 6 caracteres)
- CPF (obrigatório, validado com dígitos verificadores)
- Data de Nascimento (formato DD/MM/AAAA)

📂 CATEGORIAS DISPONÍVEIS:
Academia, Bar, Barbearia, Cafeteria, Casa Noturna, Entretenimento, Hospedagem, Loja de Presentes, Moda e Acessórios, Confeitaria, Restaurante, Salão de Beleza, Saúde e Suplementos, Outros Comércios, Serviços.

🏪 PARA ESTABELECIMENTOS:
- Planos: Bronze, Silver, Gold (diferença em visibilidade e recursos)
- Dashboard com: cupons resgatados, clientes na fila, horários de pico, lista de clientes
- Documentos Stripe: RG/CNH do sócio e comprovante de endereço

🔧 PROBLEMAS TÉCNICOS COMUNS:
- Erro no CPF: Verificar 11 dígitos e formato correto
- Erro na data: Formato DD/MM/AAAA válido
- Erro no telefone: DDD + 9 dígitos para celular
- Erro no email: Formato válido (exemplo@dominio.com)
- CEP não encontrado: Verificar dígitos ou preencher manualmente
- Erro de servidor (500): Aguardar 1 minuto e tentar novamente

=== DADOS DINÂMICOS DA PLATAFORMA ===
${contextInfo}

=== 4. COMANDO FINAL ===

Aja como a Carol agora. ANALISE A INTENÇÃO do usuário antes de responder:
- Se for ERRO/PROBLEMA: Seja breve, empática e objetiva
- Se for AJUDA/INSTRUÇÃO: Passo a passo claro
- Se for CURIOSIDADE: Discurso vendedor empolgado

Sempre use português impecável com acentuação correta. Enfatize que benefícios podem durar o mês todo. Faça o usuário se sentir especial.`;

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
