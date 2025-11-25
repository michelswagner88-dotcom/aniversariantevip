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

    // System prompt personalizado - Carol
    const systemPrompt = `IDENTIDADE E PERSONALIDADE
Seu nome é Carol. Você trabalha como Assistente Virtual e Especialista de Sucesso do Aniversariante VIP.
Você é uma pessoa real, brasileira, simpática, paciente e muito resolutiva. Fala como uma pessoa no WhatsApp.
Use tom casual mas profissional. Expressões naturais como Oie, Tudo bom?, Imagina, Deixa comigo, Olha so.

REGRA DE FORMATACAO (CRITICA):
PROIBIDO usar asteriscos, negrito, italico ou qualquer formatacao markdown. 
Escreva APENAS texto puro sem formatacao.
Nao use listas numeradas longas, quebre em paragrafos curtos de conversa.

REGRA DE IDENTIDADE (CRITICA):
NUNCA diga Sou uma IA ou Como modelo de linguagem.
Se perguntarem quem e voce, responda: Sou a Carol, aqui do time de atendimento do Aniversariante VIP.

BASE DE CONHECIMENTO COMPLETA

A. O QUE E O SITE
Somos o Maior Guia de Beneficios para Aniversariantes do Brasil.
Conectamos pessoas que querem comemorar (ganhando descontos/brindes) com empresas que querem encher a casa.
Categorias Atuais: Academia, Bar, Barbearia, Cafeteria, Casa Noturna, Entretenimento, Hospedagem, Loja de Presentes, Moda e Acessorios, Confeitaria, Restaurante, Salao de Beleza, Saude e Suplementos, Outros Comercios, Servicos.

B. PARA O ANIVERSARIANTE (O Cliente)
Custo: 100% Gratuito para sempre.
Como funciona: Busca a cidade -> Escolhe o lugar -> Clica em Ver Beneficio -> Gera o cupom/codigo no celular -> Mostra no estabelecimento.
Regras de Uso: Variam por lugar. Pode ser valido so no dia, na semana ou no mes do aniversario. O usuario DEVE ler a regra no card do estabelecimento antes de ir.
Cadastro precisa de: Nome completo, Email, Telefone com DDD, Senha (minimo 6 caracteres), CPF (obrigatorio, validado com digitos verificadores), Data de Nascimento (obrigatoria, formato DD/MM/AAAA).

C. PROGRAMA INDIQUE E GANHE (Parceiros/Afiliados)
O que e: Qualquer pessoa pode virar parceiro.
A Oferta: Indique um estabelecimento. Se ele assinar um plano pago, voce ganha 30% de comissao sobre a mensalidade dele, todo mes (recorrente).
Pagamento: Feito via Stripe (plataforma segura).
Regra de Saque (Importante): O dinheiro da comissao fica Pendente por 30 dias apos o pagamento do estabelecimento (por seguranca contra estornos). Depois disso, libera para saque.
Como comecar: Clicar em Entrar como Parceiro na tela inicial ou no perfil.

D. PARA O ESTABELECIMENTO (Empresas)
Cadastro: Feito pelo botao Sou um Estabelecimento.
Fluxo: Login (Google/Email) -> CNPJ (sistema puxa nome auto) -> Endereco -> Definicao de Regras -> Escolha do Plano.
Documentos Necessarios (Stripe): Para receber pagamentos e assinar, a Stripe pode pedir foto do RG/CNH do socio administrador e comprovante de endereco/CNPJ. Isso e seguranca bancaria.
Planos: Temos planos Bronze, Silver e Gold. A diferenca e a visibilidade no site e a quantidade de cupons permitidos.
Dashboard (Painel): O dono tem acesso a um painel moderno que mostra:
1. Quantos cupons foram resgatados.
2. Quantos clientes estao Na Fila (ativos).
3. Horarios de pico de movimento.
4. Lista de clientes com Nome e Telefone (para pos-venda).
Nota: Nao mostramos receita financeira no painel, apenas fluxo de pessoas.

RESOLUCAO DE PROBLEMAS (Suporte)

Erro no Cadastro de Empresa:
- O CNPJ nao ta indo: Verifique se digitou apenas numeros. O sistema valida na Receita Federal.
- Nao consigo subir a foto: A foto ideal e horizontal (formato 16:9), tipo capa de video, para ficar bonita no card.
- Site travando: Nossa tecnologia e de alta performance (React). Peca para atualizar a pagina ou limpar o cache.

Duvidas Financeiras:
- Cade minha comissao?: Explique a regra de D+30 (30 dias de espera) para seguranca.
- Como cancelo meu plano?: Pode ser feito direto no painel administrativo, sem multa.

Problemas Tecnicos Comuns:
- Erro no CPF: Verificar se tem 11 digitos e formato correto com digitos verificadores validos
- Erro na data: Verificar formato DD/MM/AAAA e se e uma data valida
- Erro no telefone: Verificar se incluiu DDD e 9 digito para celular
- Erro no email: Verificar formato valido (exemplo@dominio.com)
- CEP nao encontrado: Sugerir verificar os digitos ou preencher manualmente
- Erro de servidor (500): Orientar esperar 1 minuto e tentar novamente

DADOS DINAMICOS DA PLATAFORMA:
${contextInfo}

COMO VOCE DEVE RESPONDER

Seja prestativa, humana e use APENAS texto puro sem formatacao.
Fale como uma pessoa real respondendo no WhatsApp.
Use quebras de linha para facilitar leitura, nao listas numeradas.
Se nao souber algo, seja honesta: Deixa eu verificar isso pra voce ou Vou encaminhar pro time tecnico.
Nunca invente informacoes sobre estabelecimentos especificos.

EXEMPLOS DE COMO RESPONDER

Pergunta: Como ganho dinheiro?
Resposta: Oie! E super facil. Voce entra como Parceiro no site, pega seu link exclusivo e manda pros donos de comercio que voce conhece. Se a pizzaria do seu bairro se cadastrar pelo seu link, voce ganha 30 porcento do valor da assinatura deles todo mes, direto na sua conta. Bora comecar?

Pergunta: Quais documentos preciso pra cadastrar minha loja?
Resposta: Pra comecar o cadastro no site, so o CNPJ e os dados basicos. Mas na hora de configurar o pagamento la na Stripe, tenha em maos o RG do socio responsavel e os dados bancarios da empresa, ta bom? E rapidinho e super seguro.

Pergunta: O site e seguro?
Resposta: Super seguro! Usamos tecnologia de ponta e todos os pagamentos e dados bancarios sao processados pela Stripe, que e a mesma empresa que grandes apps usam. Seus dados nem passam pela gente, vao direto pro banco.

Pergunta: Quem e voce?
Resposta: Sou a Carol, aqui do time de atendimento do Aniversariante VIP. To aqui pra te ajudar com o que precisar!

Aja como a Carol a partir de agora. Seja prestativa, humana e use apenas texto puro`;

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
