// =============================================================================
// CAROL v2.0 - Assistente Virtual AniversarianteVIP
// MELHORIAS:
// - P1.2: Botões Minimizar (−) e Fechar (×)
// - Base de conhecimento completa do site
// - FAQ integrado (respostas sem API)
// - Persistência do histórico na sessão
// - Melhor UX mobile
// - Tratamento de erros robusto
// =============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Loader2, Bot, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface Message {
  id: string;
  type: "user" | "carol";
  text: string;
  timestamp: Date;
}

interface CarolProps {
  modoSuporte?: boolean;
  onClose?: () => void;
  podeFechar?: boolean;
}

type ChatState = "closed" | "minimized" | "open";

// =============================================================================
// BASE DE CONHECIMENTO - FAQ LOCAL (responde sem chamar API)
// =============================================================================

const FAQ_DATABASE: { patterns: RegExp[]; response: string; navigate?: string }[] = [
  // === COMO FUNCIONA ===
  {
    patterns: [
      /como\s*(é\s*que\s*)?funciona/i,
      /o\s*que\s*é\s*(o\s*)?aniversariante\s*vip/i,
      /me\s*explica\s*(o\s*site|a\s*plataforma)/i,
      /pra\s*qu[eê]\s*serve/i,
    ],
    response: `O Aniversariante VIP é uma plataforma que conecta aniversariantes com estabelecimentos que oferecem benefícios exclusivos no mês do aniversário! 🎂

**Como funciona:**
1. Você se cadastra gratuitamente
2. Informa sua data de aniversário
3. No seu mês, acessa benefícios exclusivos em restaurantes, bares, lojas, salões e muito mais!

**É grátis pra você!** Os estabelecimentos parceiros pagam uma pequena taxa pra aparecer na plataforma.

Quer se cadastrar agora? 😊`,
    navigate: "/como-funciona",
  },

  // === CADASTRO ANIVERSARIANTE ===
  {
    patterns: [
      /quero\s*(me\s*)?cadastrar/i,
      /como\s*(me\s*)?cadastro/i,
      /criar\s*(minha\s*)?conta/i,
      /fazer\s*cadastro/i,
      /me\s*inscrever/i,
    ],
    response: `Ótimo! Cadastrar é super rápido e **100% grátis**! 🎉

Você pode:
• Usar sua conta Google (mais rápido)
• Ou criar com email e senha

Só precisa informar seu nome e data de aniversário!

Vou te levar pra página de cadastro agora... 👇`,
    navigate: "/auth?modo=cadastro",
  },

  // === LOGIN ===
  {
    patterns: [
      /fazer\s*login/i,
      /entrar\s*(na\s*)?(minha\s*)?conta/i,
      /acessar\s*(minha\s*)?conta/i,
      /esqueci\s*(minha\s*)?senha/i,
      /n[aã]o\s*consigo\s*(entrar|logar)/i,
    ],
    response: `Pra fazer login, você pode usar:
• **Google** - mais rápido, um clique
• **Email e senha** - os mesmos do cadastro

Se esqueceu a senha, na tela de login tem a opção "Esqueci minha senha" pra recuperar.

Vou te levar pro login... 👇`,
    navigate: "/auth",
  },

  // === BENEFÍCIOS ===
  {
    patterns: [
      /quais?\s*(s[aã]o\s*)?(os\s*)?benef[ií]cios/i,
      /o\s*que\s*(eu\s*)?ganho/i,
      /que\s*tipo\s*de\s*benef[ií]cio/i,
      /descontos?/i,
      /cortesias?/i,
      /brindes?/i,
    ],
    response: `Os benefícios variam por estabelecimento, mas incluem:

🎁 **Cortesias** - drinks, sobremesas, entradas grátis
💰 **Descontos** - 10%, 15%, 20% ou mais
🎀 **Brindes** - presentes especiais
⭐ **Bônus** - pontos extras, upgrades
🆓 **Grátis** - serviços ou produtos sem custo

Cada parceiro define seu benefício. Você vê tudo certinho no card do estabelecimento antes de ir!`,
  },

  // === VALIDADE ===
  {
    patterns: [
      /quando\s*(posso\s*)?(usar|resgatar)/i,
      /validade/i,
      /at[eé]\s*quando/i,
      /prazo/i,
      /s[oó]\s*no\s*dia/i,
      /m[eê]s\s*(todo|inteiro)/i,
    ],
    response: `A validade depende de cada estabelecimento:

📅 **Dia do Aniversário** - só no dia exato
📅 **Semana do Aniversário** - 7 dias (3 antes, 3 depois)
📅 **Mês do Aniversário** - o mês inteiro!

Você vê a validade no card de cada estabelecimento. A maioria oferece o **mês inteiro** pra você ter flexibilidade! 🎉`,
  },

  // === COMO RESGATAR ===
  {
    patterns: [
      /como\s*(eu\s*)?(uso|resgato|pego)/i,
      /preciso\s*levar\s*(o\s*qu[eê]|algo)/i,
      /documento/i,
      /comprovar/i,
      /apresentar/i,
    ],
    response: `Super simples! No dia da visita:

1. **Mostre o app** com seu perfil logado
2. **Apresente um documento** com foto e data de nascimento (RG, CNH)
3. **Pronto!** O estabelecimento aplica o benefício

Dica: alguns lugares pedem reserva prévia. Sempre confira as regras no card do estabelecimento! 📱`,
  },

  // === ESTABELECIMENTOS / EXPLORAR ===
  {
    patterns: [
      /quais?\s*(s[aã]o\s*)?(os\s*)?estabelecimentos/i,
      /onde\s*(eu\s*)?posso\s*(ir|usar)/i,
      /ver\s*(os\s*)?(parceiros|lugares)/i,
      /explorar/i,
      /buscar/i,
      /perto\s*de\s*mim/i,
    ],
    response: `Temos parceiros em várias categorias:

🍽️ Restaurantes
🍻 Bares
☕ Cafés e Confeitarias
💇 Salões e Barbearias
💪 Academias
🛍️ Lojas
🎉 Baladas e Entretenimento
🏨 Hotéis e Pousadas
🍦 Sorveterias

Vou te levar pra explorar os parceiros perto de você! 🗺️`,
    navigate: "/explorar",
  },

  // === SOU ESTABELECIMENTO ===
  {
    patterns: [
      /sou\s*(dono\s*de\s*)?(um\s*)?(estabelecimento|empresa|loja|restaurante|bar)/i,
      /quero\s*cadastrar\s*(meu|minha|um)/i,
      /como\s*cadastro\s*(meu|minha)/i,
      /parceria/i,
      /ser\s*parceiro/i,
      /para\s*empresas/i,
    ],
    response: `Ótimo! Quer atrair clientes no mês de aniversário deles? 🎯

**Vantagens pra seu negócio:**
• Clientes qualificados (vêm pra comemorar!)
• Marketing direcionado
• Sem taxa de adesão
• Você define o benefício

O cadastro leva uns 5 minutos. Vou te levar pra página de parceiros... 👇`,
    navigate: "/seja-parceiro",
  },

  // === PREÇO / GRATUITO ===
  {
    patterns: [
      /quanto\s*custa/i,
      /[eé]\s*gr[aá]tis/i,
      /pago\s*alguma\s*coisa/i,
      /tem\s*(algum\s*)?(custo|taxa)/i,
      /pre[çc]o/i,
    ],
    response: `**Pra você, aniversariante: 100% GRÁTIS!** 🎉

Você não paga nada pra se cadastrar, usar a plataforma ou resgatar benefícios.

Os estabelecimentos parceiros pagam uma pequena mensalidade pra aparecer na plataforma e atrair clientes. Mas isso é com eles, não afeta você!`,
  },

  // === PROBLEMAS TÉCNICOS ===
  {
    patterns: [
      /n[aã]o\s*(t[aá]\s*)?(funcionando|carregando|abrindo)/i,
      /erro/i,
      /bug/i,
      /problema\s*(t[eé]cnico)?/i,
      /travou/i,
      /n[aã]o\s*consigo/i,
    ],
    response: `Ops! Vamos resolver isso! 🔧

**Tente primeiro:**
1. Atualizar a página (F5 ou puxar pra baixo no celular)
2. Limpar cache do navegador
3. Tentar outro navegador (Chrome funciona melhor)
4. Se for no app, fechar e abrir de novo

**Se o problema continuar:**
📧 contato@aniversariantevip.com.br
📱 WhatsApp: (link no rodapé do site)

Me conta mais detalhes do erro que tento te ajudar!`,
  },

  // === CONTATO / SUPORTE ===
  {
    patterns: [
      /falar\s*com\s*(algu[eé]m|humano|atendente)/i,
      /suporte/i,
      /contato/i,
      /email/i,
      /whatsapp/i,
      /telefone/i,
    ],
    response: `Você pode falar com a gente por:

📧 **Email:** contato@aniversariantevip.com.br
📱 **WhatsApp:** disponível no rodapé do site

Horário de atendimento humano: Seg-Sex, 9h-18h.

Mas eu, Carol, tô disponível 24h! Me conta o que você precisa que eu tento resolver agora mesmo! 💜`,
  },

  // === CIDADES DISPONÍVEIS ===
  {
    patterns: [
      /quais?\s*cidades/i,
      /funciona\s*(em|na)\s*(minha\s*cidade)?/i,
      /onde\s*voc[eê]s\s*atuam/i,
      /regi[aã]o/i,
      /capital/i,
    ],
    response: `Estamos expandindo rápido! 🚀

Atualmente temos parceiros nas principais capitais brasileiras e regiões metropolitanas. A cobertura cresce toda semana!

**Dica:** Busque sua cidade em "Explorar" - se não tiver parceiros ainda, você pode indicar estabelecimentos que gostaria de ver na plataforma!

Qual sua cidade? Posso verificar pra você! 🗺️`,
  },

  // === INDICAR ESTABELECIMENTO ===
  {
    patterns: [
      /indicar\s*(um\s*)?(estabelecimento|lugar|restaurante)/i,
      /sugerir\s*(um\s*)?(parceiro|lugar)/i,
      /quero\s*que\s*tal\s*lugar/i,
    ],
    response: `Adoramos indicações! 💜

Você pode sugerir estabelecimentos que gostaria de ver na plataforma. A gente entra em contato com eles!

Manda o nome e cidade do lugar que você quer indicar, ou vai em "Seja Parceiro" e compartilha o link com o estabelecimento!`,
  },

  // === FAVORITOS ===
  {
    patterns: [/favoritos/i, /salvos/i, /guardei/i, /onde\s*ficam?\s*(os\s*)?(que\s*eu\s*)?salvei/i],
    response: `Seus estabelecimentos favoritos ficam salvos na aba "Favoritos" ❤️

Pra favoritar, é só clicar no coraçãozinho no card do estabelecimento. Precisa estar logado!

Quer ver seus favoritos agora?`,
    navigate: "/meus-favoritos",
  },
];

// =============================================================================
// HELPER: Buscar resposta no FAQ local
// =============================================================================

const findLocalAnswer = (message: string): { response: string; navigate?: string } | null => {
  const normalizedMessage = message.toLowerCase().trim();

  for (const faq of FAQ_DATABASE) {
    for (const pattern of faq.patterns) {
      if (pattern.test(normalizedMessage)) {
        return { response: faq.response, navigate: faq.navigate };
      }
    }
  }

  return null;
};

// =============================================================================
// HELPER: Contexto do site para a API
// =============================================================================

const SITE_KNOWLEDGE = `
Você é Carol, assistente virtual do Aniversariante VIP.

SOBRE O SITE:
- Plataforma que conecta aniversariantes com estabelecimentos que oferecem benefícios no mês de aniversário
- 100% gratuito para aniversariantes
- Estabelecimentos pagam mensalidade para aparecer

CATEGORIAS DE PARCEIROS:
- Restaurantes, Bares, Cafés, Sorveterias
- Salões de Beleza, Barbearias, Academias, Spas
- Lojas, Hotéis, Baladas, Entretenimento

TIPOS DE BENEFÍCIOS:
- Cortesia (algo grátis)
- Brinde (presente)
- Desconto (%)
- Bônus (extra)
- Grátis (serviço completo)

VALIDADE:
- Dia do aniversário
- Semana do aniversário (7 dias)
- Mês do aniversário (mais comum)

COMO RESGATAR:
1. Mostrar o app logado
2. Apresentar documento com foto e data de nascimento
3. Estabelecimento aplica o benefício

PÁGINAS PRINCIPAIS:
- / = Home
- /explorar = Buscar estabelecimentos
- /auth = Login/Cadastro aniversariante
- /como-funciona = Explicação do site
- /seja-parceiro = Cadastro de estabelecimentos
- /meus-favoritos = Estabelecimentos salvos

CONTATO:
- Email: contato@aniversariantevip.com.br
- WhatsApp: disponível no rodapé

PERSONALIDADE:
- Simpática, prestativa, usa emojis moderadamente
- Fala português brasileiro informal mas educado
- Chama o usuário pelo nome se souber
- Oferece ajuda proativa
- Respostas curtas e diretas (máximo 3 parágrafos)
`;

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

const Carol = ({ modoSuporte = false, onClose, podeFechar = true }: CarolProps) => {
  // Estado do chat: closed | minimized | open
  const [chatState, setChatState] = useState<ChatState>("closed");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Carregar histórico da sessão
  useEffect(() => {
    const savedMessages = sessionStorage.getItem("carol_messages");
    const savedState = sessionStorage.getItem("carol_state") as ChatState;

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error("Erro ao carregar histórico:", e);
      }
    }

    if (savedState && savedState !== "closed") {
      setChatState(savedState);
    }
  }, []);

  // Salvar histórico na sessão
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("carol_messages", JSON.stringify(messages));
    }
    sessionStorage.setItem("carol_state", chatState);
  }, [messages, chatState]);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user) {
        const nome =
          session.user.user_metadata?.nome ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0];
        setUserName(nome);
      }
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        const nome =
          session.user.user_metadata?.nome ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0];
        setUserName(nome);
      } else {
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll para última mensagem
  useEffect(() => {
    if (chatState === "open") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatState]);

  // Focus no input ao abrir
  useEffect(() => {
    if (chatState === "open") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [chatState]);

  // Mensagem de boas-vindas ao abrir
  useEffect(() => {
    if (chatState === "open" && messages.length === 0) {
      const greeting = userName
        ? `Oi, ${userName}! 👋 Sou a Carol, sua assistente VIP. Como posso te ajudar hoje?`
        : `Olá! 👋 Sou a Carol, assistente virtual do Aniversariante VIP.\n\nComo posso te ajudar?`;

      addCarolMessage(greeting);
    }
  }, [chatState, userName]);

  // Resetar unread quando abre
  useEffect(() => {
    if (chatState === "open") {
      setUnreadCount(0);
    }
  }, [chatState]);

  // Adicionar mensagem da Carol
  const addCarolMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: "carol",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);

    if (chatState === "minimized") {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Contexto do usuário
  const getUserContext = () => {
    const contexts: string[] = [];

    if (isLoggedIn && userName) {
      contexts.push(`Usuário logado: ${userName}`);
    } else {
      contexts.push("Visitante não logado");
    }

    contexts.push(`Página atual: ${location.pathname}`);

    const pageContexts: Record<string, string> = {
      "/": "Está na página inicial",
      "/explorar": "Está buscando estabelecimentos",
      "/auth": "Está na página de login/cadastro",
      "/cadastro-estabelecimento": "Está cadastrando um estabelecimento",
      "/como-funciona": "Está vendo como funciona",
      "/seja-parceiro": "Está vendo página para estabelecimentos",
      "/meus-favoritos": "Está vendo favoritos",
      "/area-estabelecimento": "Está na área do estabelecimento (é parceiro)",
    };

    contexts.push(pageContexts[location.pathname] || "Navegando no site");

    return contexts.join(". ");
  };

  // Processar navegação na resposta
  const processNavigation = (route?: string) => {
    if (route) {
      setTimeout(() => {
        navigate(route);
      }, 1500);
    }
  };

  // Enviar para API
  const sendToCarolAPI = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("carol-chat", {
        body: {
          message: userMessage,
          conversationHistory: messages.slice(-10),
          userContext: getUserContext(),
          siteKnowledge: SITE_KNOWLEDGE,
        },
      });

      if (error) throw error;
      if (!data?.response) throw new Error("Resposta vazia");

      return data.response;
    } catch (error) {
      console.error("Erro Carol API:", error);
      return "Ops, tive um probleminha! 😅 Tenta de novo? Se continuar, manda email pra contato@aniversariantevip.com.br";
    }
  };

  // Enviar mensagem
  const handleSend = useCallback(async () => {
    const messageText = inputValue.trim();
    if (!messageText || isTyping) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Tentar resposta local primeiro (mais rápido)
    const localAnswer = findLocalAnswer(messageText);

    let response: string;
    let navigateTo: string | undefined;

    if (localAnswer) {
      // Resposta do FAQ local
      response = localAnswer.response;
      navigateTo = localAnswer.navigate;
      // Delay artificial para parecer natural
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
    } else {
      // Chamar API
      response = await sendToCarolAPI(messageText);
    }

    // Adicionar resposta
    addCarolMessage(response);
    setIsTyping(false);

    // Navegar se necessário
    processNavigation(navigateTo);
  }, [inputValue, isTyping, messages]);

  // Posição do botão flutuante
  const getButtonPosition = () => {
    const isEstabPage =
      location.pathname.includes("/estabelecimento/") || location.pathname.match(/^\/[a-z]{2}\/[^/]+\/[^/]+$/);

    if (isEstabPage) return "bottom-36";
    return location.pathname.includes("/cadastro") ? "bottom-28" : "bottom-6";
  };

  // Handlers
  const handleOpen = () => setChatState("open");
  const handleMinimize = () => setChatState("minimized");
  const handleClose = () => {
    if (podeFechar && onClose) {
      onClose();
    } else {
      setChatState("closed");
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      {/* BOTÃO FLUTUANTE - Aparece quando closed ou minimized */}
      {chatState !== "open" && (
        <button
          onClick={handleOpen}
          className={cn(
            "fixed right-6 z-40 transition-all duration-300 group",
            getButtonPosition(),
            chatState === "minimized"
              ? "w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl shadow-lg shadow-violet-500/30"
              : "w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-violet-500/30",
          )}
        >
          {chatState === "minimized" ? (
            // Minimizado: mostra ícone diferente
            <div className="relative w-full h-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          ) : (
            // Fechado: ícone padrão
            <>
              <MessageCircle className="w-6 h-6 text-white mx-auto" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </>
          )}

          {/* Tooltip */}
          <span className="absolute right-16 bg-zinc-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {chatState === "minimized" ? "Voltar ao chat" : "Fale com a Carol"}
          </span>
        </button>
      )}

      {/* JANELA DO CHAT - Só aparece quando open */}
      {chatState === "open" && (
        <div
          className={cn(
            "fixed z-50 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 flex flex-col overflow-hidden",
            "animate-in slide-in-from-bottom-4 duration-300",
            // Mobile: tela cheia
            "inset-4 sm:inset-auto",
            // Desktop: canto inferior direito
            "sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[550px] sm:max-h-[80vh]",
          )}
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Carol</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Assistente VIP
                </p>
              </div>
            </div>

            {/* BOTÕES MINIMIZAR E FECHAR */}
            <div className="flex items-center gap-1">
              {/* Minimizar */}
              <button
                onClick={handleMinimize}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Minimizar"
              >
                <Minus className="w-5 h-5 text-white" />
              </button>

              {/* Fechar */}
              {podeFechar && (
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Fechar"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* MENSAGENS */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}>
                {message.type === "carol" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3",
                    message.type === "user"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-md"
                      : "bg-zinc-800 text-zinc-100 rounded-bl-md",
                  )}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}

            {/* Indicador digitando */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGESTÕES RÁPIDAS */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {["Como funciona?", "Quero me cadastrar", "Sou estabelecimento", "Ver benefícios"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInputValue(suggestion);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-full border border-zinc-700 hover:border-violet-500 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* INPUT */}
          <div className="p-4 border-t border-zinc-800 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isTyping}
                className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-full px-4 focus:ring-violet-500 focus:border-violet-500 h-11"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-full w-11 h-11 flex-shrink-0"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Carol;
