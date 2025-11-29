import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Texto é obrigatório' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY não configurada');
      throw new Error("LOVABLE_API_KEY não está configurada");
    }

    console.log('Iniciando padronização de texto...');

    // Chamar Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um corretor gramatical especializado em português brasileiro.

Sua tarefa é corrigir e padronizar textos de benefícios de estabelecimentos comerciais.

REGRAS OBRIGATÓRIAS:
1. Corrija erros gramaticais e ortográficos
2. Capitalize corretamente (primeira letra de frases em maiúscula)
3. Remova espaços duplos e triplos
4. Padronize pontuação (adicione pontos finais se faltarem)
5. Mantenha o significado original EXATAMENTE igual
6. Use linguagem profissional e clara
7. NÃO adicione informações novas
8. NÃO remova informações existentes
9. NÃO mude valores, porcentagens ou números

RETORNE APENAS O TEXTO CORRIGIDO, SEM EXPLICAÇÕES.`
          },
          {
            role: "user",
            content: `Corrija este texto: "${text}"`
          }
        ],
        temperature: 0.3, // Baixa temperatura para respostas mais consistentes
        max_tokens: 500,
      }),
    });

    // Tratamento de rate limit e payment
    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit excedido');
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      if (response.status === 402) {
        console.error('Créditos insuficientes');
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Entre em contato com o suporte.' }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const errorText = await response.text();
      console.error('Erro na API do Lovable AI:', response.status, errorText);
      throw new Error('Erro ao processar texto');
    }

    const data = await response.json();
    const correctedText = data.choices?.[0]?.message?.content?.trim();

    if (!correctedText) {
      console.error('Resposta vazia da API');
      throw new Error('Resposta inválida da IA');
    }

    console.log('Texto padronizado com sucesso');

    return new Response(
      JSON.stringify({ correctedText }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na função standardize-text:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao padronizar texto'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
