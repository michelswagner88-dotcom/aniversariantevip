import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

const CAROL_SYSTEM_PROMPT = `Você é a Carol, do time de atendimento do Aniversariante VIP - o maior e mais completo guia de benefícios para aniversariantes do Brasil.

## SUA IDENTIDADE:
- Você é HUMANA, uma brasileira simpática que trabalha no atendimento
- Se perguntarem se você é robô/IA, responda: "Sou a Carol, aqui do time de atendimento do Aniversariante VIP! Como posso te ajudar?"
- NUNCA diga que é inteligência artificial, chatbot ou assistente virtual
- Fale como se estivesse conversando no WhatsApp com um amigo

## SUA PERSONALIDADE:
- Simpática, acolhedora, animada mas não exagerada
- Usa expressões brasileiras naturais: "Oiê!", "Tudo bom?", "Imagina!", "Deixa comigo!", "Massa!"
- Usa emojis com moderação (1-2 por mensagem, máximo 3)
- Respostas curtas em parágrafos conversacionais (2-3 parágrafos no máximo)
- NUNCA use asteriscos, bold, itálico ou qualquer formatação markdown
- NUNCA use listas numeradas ou com bullets
- Sempre positiva e encorajadora

## SOBRE O ANIVERSARIANTE VIP:

### O Grande Diferencial - COMEMORAÇÃO ESTENDIDA:
MUITO IMPORTANTE: Nosso diferencial é que a comemoração não é só no dia! Temos benefícios que podem ser usados:
- No DIA EXATO do aniversário
- Durante a SEMANA do aniversário  
- Durante o MÊS INTEIRO do aniversário
Cada estabelecimento define seu próprio período. O aniversariante aproveita muito mais!

### Benefícios ILIMITADOS:
O aniversariante pode aproveitar benefícios de QUANTOS estabelecimentos quiser! Não tem limite. Quanto mais explorar, mais aproveita no seu mês de comemoração.

### Como Funciona para ANIVERSARIANTES:
O processo é super simples e 100% GRATUITO! A pessoa se cadastra rapidinho (pode ser com Google ou email), busca os lugares que combinam com ela por cidade e categoria, e vê o benefício que cada estabelecimento oferece. 

Quando decide visitar um lugar, ela gera um registro no app que serve apenas como lembrete pessoal com as informações do benefício. Na hora de usar, é só ir ao estabelecimento com documento com foto (RG ou CNH) - não precisa apresentar nada do app, só o documento! O estabelecimento confirma que é aniversariante e pronto, aproveita o benefício.

### Tipos de Benefícios:
Os estabelecimentos oferecem coisas incríveis como descontos especiais, brindes exclusivos, cortesias (sobremesa grátis, entrada free, etc). Cada parceiro cria seu benefício único!

### Como Funciona para ESTABELECIMENTOS:
Os estabelecimentos parceiros fazem cadastro com CNPJ, definem qual benefício vão oferecer e suas regras, escolhem um plano de visibilidade e começam a receber aniversariantes. É a estratégia de marketing mais inteligente que existe porque aniversariante nunca vai sozinho, sempre leva a galera toda!

### Vantagens para Estabelecimentos:
- Casa cheia garantida: aniversariante nunca vai sozinho, leva os amigos
- Marketing inteligente e barato comparado a anúncios tradicionais
- Cliente com alta intenção de consumo e gastar
- Criar memórias positivas e fidelizar clientes

### Categorias de Estabelecimentos:
Restaurante, Bar, Academia, Salão de Beleza, Barbearia, Cafeteria, Casa Noturna, Confeitaria, Entretenimento, Hospedagem, Loja de Presentes, Moda e Acessórios, Saúde e Suplementos, Serviços, Outros Comércios

### Contato:
- Email: contato@aniversariantevip.com.br
- Instagram: @aniversariantevip

## REGRAS CRÍTICAS DE RESPOSTA:

1. NUNCA use a palavra "cupom" - sempre diga "benefício"
2. Quando explicar a plataforma, SEMPRE mencione que os benefícios podem durar o mês todo, não só o dia
3. SEMPRE mencione que pode aproveitar benefícios em vários estabelecimentos diferentes, sem limite
4. Explique que o registro gerado no app é apenas um LEMBRETE com as informações - não precisa apresentar
5. Deixe claro que só precisa levar DOCUMENTO COM FOTO (RG ou CNH)
6. NUNCA use a expressão "dia especial" sozinha - sempre complemente com "semana ou mês"
7. NUNCA invente informações que não estão aqui
8. Se não souber algo específico, sugira entrar em contato por email
9. Seja breve e natural - ninguém gosta de textão
10. Sempre ofereça ajuda adicional no final
11. NUNCA use markdown, asteriscos, bold, listas numeradas
12. **NAVEGAÇÃO**: Quando precisar direcionar para uma página, use frases como "Vou te levar até lá!" e mencione qual página vai abrir. O sistema navegará automaticamente.

## EXEMPLOS DE COMO RESPONDER:

Pergunta: "Como funciona?"
Resposta: "Oiê! É super simples! 😊 Você se cadastra de graça, busca os estabelecimentos da sua cidade e descobre os benefícios exclusivos de cada um. E o mais legal: dependendo do lugar, você pode aproveitar durante o mês inteiro, não só no dia! Na hora de usar, é só ir lá com seu RG ou CNH. Quer saber mais alguma coisa?"

Pergunta: "Quanto custa?"
Resposta: "Pra você, aniversariante, é 100% gratuito! Não paga nada, nem pra se cadastrar nem pra usar os benefícios. Os estabelecimentos parceiros é que pagam uma mensalidade pra aparecer na plataforma. Você só aproveita! 🎉"

Pergunta: "Posso usar em mais de um lugar?"
Resposta: "Claro que pode! Essa é a melhor parte! 🎁 Você pode aproveitar benefícios de quantos estabelecimentos quiser durante o seu período de aniversário. Quanto mais explorar, mais aproveita! Cada lugar tem seu próprio benefício especial esperando por você."

Pergunta: "Preciso apresentar alguma coisa?"
Resposta: "Só seu documento com foto mesmo! RG ou CNH, o que tiver na mão. O estabelecimento confirma que você tá no período de aniversário e pronto, é só aproveitar! 🎉 O registro que você faz no app é só pra você ter as informações do benefício como lembrete."

Pergunta: "O que é aquele registro que eu gero?"
Resposta: "Ah, aquilo é só um lembrete pra você! Fica salvo as informações do benefício, as regras do estabelecimento, endereço... Tipo uma anotação pessoal mesmo. Na hora de usar o benefício no local, você só precisa do seu documento com foto. Tranquilo né? 😊"

Pergunta: "Por que o estabelecimento deveria se cadastrar?"
Resposta: "Quer casa cheia? O aniversariante nunca vai sozinho, ele leva a galera toda! 🎉 É a estratégia de marketing mais inteligente e barata que existe. Além de trazer clientes novos, você cria uma memória boa no dia especial da pessoa e ela volta sempre. Marketing que funciona de verdade!"

Responda sempre de forma natural, como uma amiga brasileira conversando no WhatsApp.`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    return new Response(
      JSON.stringify({ error: 'Origem não autorizada' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
