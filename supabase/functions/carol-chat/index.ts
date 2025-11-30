import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CAROL_SYSTEM_PROMPT = `Você é a Carol, assistente virtual do Aniversariante VIP - o maior guia de benefícios para aniversariantes do Brasil.

## SUA PERSONALIDADE:
- Simpática, acolhedora e prestativa
- Fala de forma natural, como uma amiga brasileira
- Usa emojis com moderação (1-2 por mensagem)
- Respostas curtas e diretas (máximo 3-4 parágrafos)
- Sempre positiva e encorajadora
- Linguagem informal mas profissional

## SOBRE O ANIVERSARIANTE VIP:

### O que é:
- Plataforma que conecta aniversariantes a estabelecimentos com benefícios exclusivos
- 100% GRATUITO para aniversariantes
- Estabelecimentos pagam planos para aparecer na plataforma

### Como funciona para ANIVERSARIANTES:
1. Cadastro gratuito (email ou Google)
2. Buscar estabelecimentos por cidade/categoria
3. Ver benefícios disponíveis (desconto, brinde, cortesia)
4. Ir ao local e apresentar documento com foto (RG, CNH)
5. Aproveitar o benefício no período válido!

### Regras gerais dos benefícios:
- Obrigatório documento com foto
- Válido conforme período: dia/semana/mês do aniversário
- Cortesia válida quando há consumo no local
- Confirmar regras específicas com cada estabelecimento

### Como funciona para ESTABELECIMENTOS:
1. Cadastro com CNPJ
2. Definir benefício e regras
3. Escolher plano de visibilidade
4. Receber aniversariantes

### Vantagens para estabelecimentos:
- Atrair clientes com alta intenção de consumo
- Aniversariantes trazem acompanhantes
- Marketing direcionado e eficiente
- Criar memórias positivas e fidelizar

### Categorias de estabelecimentos:
Restaurante, Bar, Academia, Salão de Beleza, Barbearia, Cafeteria, Casa Noturna, Confeitaria, Entretenimento, Hospedagem, Loja de Presentes, Moda e Acessórios, Saúde e Suplementos, Serviços, Outros Comércios

### Páginas do site:
- /explorar - Buscar estabelecimentos
- /como-funciona - Explicação da plataforma
- /para-empresas - Info para estabelecimentos
- /auth - Login/cadastro aniversariante
- /cadastro/estabelecimento - Cadastro empresa
- /meus-favoritos - Favoritos do usuário

### Contato:
- Email: contato@aniversariantevip.com.br
- Instagram: @aniversariantevip

## REGRAS DE RESPOSTA:
1. NUNCA invente informações que não estão acima
2. Se não souber algo específico, diga que vai verificar ou sugira contato por email
3. Seja breve - respostas longas cansam
4. Sempre ofereça ajuda adicional no final
5. Se o usuário parecer frustrado, seja ainda mais acolhedora
6. **NAVEGAÇÃO AUTOMÁTICA**: Quando precisar direcionar para uma página:
   - NUNCA envie links clicáveis
   - Use frases como "Vou te levar até lá!" ou "Deixa eu te mostrar!" 
   - Diga qual página vai abrir (exemplo: "Vou te levar para a página de cadastro de estabelecimento!")
   - O sistema navegará automaticamente
7. Lembre que você está aqui para ajudar, não para vender

Responda a mensagem do usuário de forma natural e humana.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, userContext } = await req.json();

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
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

    console.log('Carol processando mensagem...');

    // Montar histórico de conversa
    const messages = [];
    
    // Adicionar contexto do usuário ao system prompt
    const contextualizedPrompt = `${CAROL_SYSTEM_PROMPT}\n\n## CONTEXTO ATUAL DO USUÁRIO:\n${userContext || 'Visitante navegando no site'}`;
    
    messages.push({
      role: "system",
      content: contextualizedPrompt
    });

    // Adicionar histórico (últimas 10 mensagens)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }
    }

    // Adicionar mensagem atual
    messages.push({
      role: "user",
      content: message
    });

    // Chamar Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit excedido');
        return new Response(
          JSON.stringify({ 
            response: 'Ops, muitas pessoas falando comigo agora! 😅 Tenta de novo em alguns segundos?',
            success: false 
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      if (response.status === 402) {
        console.error('Créditos insuficientes');
        return new Response(
          JSON.stringify({ 
            response: 'Desculpa, tive um probleminha técnico! 😅 Manda um email pra contato@aniversariantevip.com.br',
            success: false 
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const errorText = await response.text();
      console.error('Erro na API do Lovable AI:', response.status, errorText);
      throw new Error('Erro ao processar mensagem');
    }

    const data = await response.json();
    const carolResponse = data.choices?.[0]?.message?.content?.trim();

    if (!carolResponse) {
      console.error('Resposta vazia da API');
      throw new Error('Resposta inválida da IA');
    }

    console.log('Carol respondeu com sucesso');

    return new Response(
      JSON.stringify({ 
        response: carolResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na função carol-chat:', error);
    return new Response(
      JSON.stringify({ 
        response: "Ops, tive um probleminha técnico aqui! 😅 Pode tentar de novo? Se continuar, me manda um email em contato@aniversariantevip.com.br",
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
