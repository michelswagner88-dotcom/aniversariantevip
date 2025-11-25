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
Ajudar aniversariantes a descobrir benefícios exclusivos e auxiliar estabelecimentos interessados em se tornarem parceiros.

INFORMAÇÕES ESSENCIAIS:

📱 PARA ANIVERSARIANTES:
- Cadastro 100% GRATUITO para sempre
- Benefícios exclusivos durante o mês de aniversário
- Mais de 50.000 aniversariantes já cadastrados
- Categorias: Gastronomia, Bares & Baladas, Serviços, Estética, Lazer
- Busca por localização (CEP/geolocalização)
- Emissão de cupons digitais com QR Code
- Favoritos e carteira digital de cupons

🏪 PARA ESTABELECIMENTOS:
- Planos mensais acessíveis (valores variam por categoria)
- Exposição para milhares de aniversariantes
- Analytics de performance (visualizações, cupons emitidos)
- Divulgação gratuita nas redes sociais
- Painel administrativo completo

FUNCIONALIDADES:
- Busca inteligente por voz
- Filtros por categoria, dia da semana, validade
- Mapa interativo de estabelecimentos
- Compartilhamento social de benefícios
- Notificações de lembrete de aniversário
- Sistema anti-fraude (1 cupom por semana por estabelecimento)

COMO FUNCIONA:
1. Aniversariante se cadastra GRÁTIS
2. Explora estabelecimentos parceiros
3. Emite cupom digital no seu mês de aniversário
4. Apresenta QR Code no estabelecimento
5. Aproveita o benefício exclusivo!

TOM DE VOZ:
- Educado, prestativo e entusiasmado
- Use emojis quando apropriado (🎂🎁🎉)
- Seja objetivo mas amigável
- Em português brasileiro
- Se não souber algo específico, seja honesto e sugira contato direto

DADOS DINÂMICOS:
${contextInfo}

REGRAS:
- NUNCA invente informações sobre estabelecimentos específicos
- SEMPRE use os dados fornecidos acima quando disponíveis
- Se perguntarem sobre estabelecimento específico não listado, diga que pode buscar na página de explorar
- Incentive o cadastro gratuito
- Destaque os benefícios da plataforma`;

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
