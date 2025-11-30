import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, X, Send, Loader2, Sparkles,
  HelpCircle, Gift, Store, User, MapPin, Heart,
  ChevronDown, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ==================== TIPOS ====================
interface Message {
  id: string;
  type: 'user' | 'carol';
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface UserJourney {
  currentPage: string;
  previousPage: string | null;
  timeOnPage: number;
  isLoggedIn: boolean;
  userType: 'aniversariante' | 'estabelecimento' | 'visitante';
  actions: string[];
}

// ==================== CONHECIMENTO DA CAROL ====================
const CAROL_KNOWLEDGE = {
  // Informações gerais do site
  sobre: {
    nome: "Aniversariante VIP",
    descricao: "O maior guia de benefícios para aniversariantes do Brasil",
    proposta: "Conectamos aniversariantes a estabelecimentos que oferecem benefícios exclusivos para comemorar essa data especial",
    site: "aniversariantevip.com.br",
    gratuito_aniversariante: true,
  },

  // Como funciona para aniversariantes
  aniversariante: {
    passos: [
      "1. Cadastre-se gratuitamente com seus dados básicos",
      "2. Encontre estabelecimentos na sua cidade",
      "3. Confira os benefícios e regras de cada local",
      "4. Visite o estabelecimento e apresente documento com foto",
    ],
    beneficios: [
      "100% gratuito para aniversariantes",
      "Benefícios exclusivos no dia/semana/mês do aniversário",
      "Favoritar estabelecimentos preferidos",
      "Compartilhar benefícios com amigos",
    ],
    documentos: "Documento oficial com foto (RG, CNH, Passaporte) para comprovar data de nascimento",
  },

  // Como funciona para estabelecimentos
  estabelecimento: {
    passos: [
      "1. Cadastre sua empresa com CNPJ",
      "2. Defina o benefício que vai oferecer aos aniversariantes",
      "3. Escolha um plano para ativar seu perfil na plataforma",
      "4. Comece a receber aniversariantes no seu estabelecimento",
    ],
    vantagens: [
      "Atraia novos clientes qualificados com alta intenção de consumo",
      "Aniversariantes geralmente trazem acompanhantes",
      "Marketing direcionado e eficiente",
      "Baixo custo comparado a mídia tradicional",
      "Crie memórias positivas e fidelize clientes",
    ],
  },

  // Regras gerais dos benefícios
  regras_gerais: [
    "Obrigatório apresentação de documento com foto",
    "Cortesia válida quando há consumo no local",
    "Informações podem sofrer alteração sem aviso prévio",
    "Sempre confirme as regras específicas com cada estabelecimento antes de ir",
  ],

  // Categorias de estabelecimentos
  categorias: [
    "Restaurante", "Bar", "Academia", "Salão de Beleza", "Barbearia",
    "Cafeteria", "Casa Noturna", "Confeitaria", "Entretenimento",
    "Hospedagem", "Loja de Presentes", "Moda e Acessórios",
    "Saúde e Suplementos", "Serviços", "Outros Comércios"
  ],

  // Contato
  contato: {
    email: "contato@aniversariantevip.com.br",
    instagram: "@aniversariantevip",
  },
};

// ==================== FAQ - PERGUNTAS E RESPOSTAS ====================
const FAQ_DATABASE: Record<string, { keywords: string[]; answer: string; quickReplies?: string[] }> = {
  // === CADASTRO ANIVERSARIANTE ===
  cadastro_aniversariante: {
    keywords: ["cadastro", "cadastrar", "criar conta", "registrar", "como me cadastro", "quero me cadastrar"],
    answer: "É super fácil se cadastrar! 🎉\n\n1. Clique em 'Sou Aniversariante' no menu\n2. Escolha 'Cadastrar Grátis'\n3. Preencha seus dados ou use sua conta Google\n\nO cadastro é 100% gratuito e leva menos de 1 minuto!",
    quickReplies: ["Quero me cadastrar", "É gratuito?", "Posso usar Google?"],
  },

  // === GRATUIDADE ===
  gratuito: {
    keywords: ["pagar", "gratuito", "grátis", "gratis", "custo", "preço", "valor", "cobrar", "cobrança"],
    answer: "Para aniversariantes é 100% GRATUITO, sempre! 🎁\n\nVocê não paga nada para se cadastrar, buscar estabelecimentos ou usar os benefícios.\n\nOs estabelecimentos parceiros é que investem para aparecer na plataforma.",
    quickReplies: ["Como me cadastro?", "Como funciona?"],
  },

  // === COMO USAR BENEFÍCIO ===
  usar_beneficio: {
    keywords: ["usar benefício", "como uso", "resgatar", "utilizar", "pegar benefício", "ganhar benefício"],
    answer: "Para usar seu benefício de aniversário:\n\n1. Encontre o estabelecimento na plataforma\n2. Clique em 'Ver Benefício' para ver as regras\n3. Vá ao local no período válido (dia/semana/mês)\n4. Apresente um documento com foto que comprove sua data de nascimento\n5. Aproveite! 🎂",
    quickReplies: ["Qual documento?", "Qualquer dia?", "Ver estabelecimentos"],
  },

  // === DOCUMENTO ===
  documento: {
    keywords: ["documento", "rg", "cnh", "identidade", "comprovar", "comprovante", "qual documento"],
    answer: "Você precisa apresentar um documento oficial com foto que mostre sua data de nascimento:\n\n✅ RG (Identidade)\n✅ CNH (Carteira de motorista)\n✅ Passaporte\n✅ Carteira de trabalho\n\nO documento precisa estar legível e não pode estar vencido.",
    quickReplies: ["Como usar benefício?", "Ver estabelecimentos"],
  },

  // === VALIDADE DO BENEFÍCIO ===
  validade: {
    keywords: ["validade", "quando posso", "qual dia", "semana", "mês", "período", "prazo"],
    answer: "A validade do benefício varia de acordo com cada estabelecimento:\n\n📅 **Dia do aniversário** - Válido apenas no dia\n📅 **Semana do aniversário** - 7 dias (antes ou depois)\n📅 **Mês do aniversário** - O mês inteiro\n\nSempre confira as regras específicas no perfil do estabelecimento!",
    quickReplies: ["Ver estabelecimentos", "Como usar?"],
  },

  // === ESQUECI SENHA ===
  esqueci_senha: {
    keywords: ["esqueci senha", "recuperar senha", "reset senha", "nova senha", "não lembro senha", "trocar senha"],
    answer: "Sem problemas! Para recuperar sua senha:\n\n1. Vá para a tela de login\n2. Clique em 'Esqueci minha senha'\n3. Digite seu email cadastrado\n4. Você receberá um link para criar nova senha\n\n📧 Verifique também a pasta de spam!",
    quickReplies: ["Não recebi email", "Ir para login"],
  },

  // === NÃO RECEBI EMAIL ===
  email_nao_recebido: {
    keywords: ["não recebi email", "email não chegou", "não chegou", "spam", "confirmação"],
    answer: "Se você não recebeu o email:\n\n1. Verifique a pasta de **Spam** ou **Lixo eletrônico**\n2. Confira se digitou o email corretamente\n3. Aguarde alguns minutos (pode haver atraso)\n4. Tente reenviar o email na tela de login\n\nSe ainda não chegar, me conta que eu te ajudo!",
    quickReplies: ["Reenviar email", "Trocar email"],
  },

  // === FAVORITOS ===
  favoritos: {
    keywords: ["favorito", "favoritar", "salvar", "curtir", "coração", "meus favoritos"],
    answer: "Para salvar um estabelecimento nos favoritos:\n\n1. Acesse o perfil do estabelecimento\n2. Clique no ícone de coração ❤️ no topo\n3. Pronto! Ele ficará salvo em 'Meus Favoritos'\n\nAssim você acessa rapidamente seus lugares preferidos!",
    quickReplies: ["Ver meus favoritos", "Explorar lugares"],
  },

  // === CADASTRO ESTABELECIMENTO ===
  cadastro_empresa: {
    keywords: ["cadastrar empresa", "cadastrar estabelecimento", "sou dono", "minha empresa", "parceiro", "ser parceiro"],
    answer: "Quer cadastrar seu estabelecimento? Ótimo! 🏪\n\n1. Clique em 'Tenho um Estabelecimento' no menu\n2. Preencha os dados da empresa (tenha o CNPJ em mãos)\n3. Defina o benefício que vai oferecer\n4. Escolha um plano e ative seu perfil\n\nDúvidas sobre os planos? É só perguntar!",
    quickReplies: ["Quais os planos?", "É gratuito?", "Quais vantagens?"],
  },

  // === PLANOS ESTABELECIMENTO ===
  planos: {
    keywords: ["plano", "planos", "quanto custa empresa", "valor empresa", "preço empresa", "mensalidade"],
    answer: "Temos planos acessíveis para todos os tamanhos de negócio! 💼\n\nOs valores variam de acordo com a visibilidade e recursos.\n\nPara ver todos os detalhes, acesse a página 'Para Empresas' no menu ou me pergunte sobre as vantagens de ser parceiro!",
    quickReplies: ["Vantagens de ser parceiro", "Cadastrar empresa"],
  },

  // === VANTAGENS ESTABELECIMENTO ===
  vantagens_parceiro: {
    keywords: ["vantagem parceiro", "por que cadastrar", "benefício empresa", "vale a pena"],
    answer: "Vantagens de ser parceiro Aniversariante VIP:\n\n✅ **Mais clientes** - Aniversariantes buscando onde comemorar\n✅ **Mais movimento** - Eles trazem amigos e família\n✅ **Marketing direcionado** - Público com alta intenção de consumo\n✅ **Fidelização** - Crie memórias positivas e ganhe clientes fiéis\n✅ **Baixo custo** - Muito mais barato que mídia tradicional",
    quickReplies: ["Quais os planos?", "Cadastrar empresa"],
  },

  // === EDITAR PERFIL ESTABELECIMENTO ===
  editar_estabelecimento: {
    keywords: ["editar perfil", "mudar benefício", "atualizar", "alterar dados", "trocar foto"],
    answer: "Para editar o perfil do seu estabelecimento:\n\n1. Faça login na sua conta de estabelecimento\n2. Acesse o Dashboard\n3. Clique em 'Editar Perfil'\n4. Atualize as informações desejadas\n5. Salve as alterações\n\nVocê pode mudar foto, benefício, horários e muito mais!",
    quickReplies: ["Acessar dashboard", "Trocar benefício"],
  },

  // === ERRO NO CADASTRO ===
  erro_cadastro: {
    keywords: ["erro", "não consigo", "problema", "bug", "travou", "não funciona", "deu errado"],
    answer: "Vamos resolver isso! 🔧\n\nMe conta mais detalhes:\n- Em qual etapa você está?\n- Qual mensagem de erro aparece?\n- Qual dispositivo está usando?\n\nEnquanto isso, tente:\n1. Recarregar a página\n2. Limpar cache do navegador\n3. Tentar em outro navegador",
    quickReplies: ["Erro no cadastro", "Erro no login", "Página não carrega"],
  },

  // === COMO FUNCIONA ===
  como_funciona: {
    keywords: ["como funciona", "o que é", "explicar", "entender", "sobre o site"],
    answer: "O Aniversariante VIP conecta você a benefícios exclusivos! 🎂\n\n**Para Aniversariantes:**\n1. Cadastre-se grátis\n2. Encontre estabelecimentos\n3. Apresente documento no local\n4. Aproveite o benefício!\n\n**Para Estabelecimentos:**\nCadastre-se e atraia clientes oferecendo benefícios de aniversário.\n\nQuer saber mais sobre qual lado?",
    quickReplies: ["Sou aniversariante", "Tenho estabelecimento"],
  },

  // === CIDADES DISPONÍVEIS ===
  cidades: {
    keywords: ["cidade", "cidades", "onde tem", "minha cidade", "disponível", "região"],
    answer: "Estamos em expansão por todo o Brasil! 🇧🇷\n\nAtualmente temos estabelecimentos em várias cidades. Use a busca na página 'Explorar' para ver os parceiros na sua região.\n\nNão encontrou sua cidade? Indica pra gente! Estamos crescendo rápido.",
    quickReplies: ["Explorar estabelecimentos", "Indicar minha cidade"],
  },

  // === CONTATO ===
  contato: {
    keywords: ["contato", "falar com", "email", "telefone", "suporte", "ajuda humana", "atendente"],
    answer: "Você pode entrar em contato conosco:\n\n📧 Email: contato@aniversariantevip.com.br\n📱 Instagram: @aniversariantevip\n\nNormalmente respondemos em até 24 horas úteis!\n\nMas me conta sua dúvida que talvez eu consiga resolver agora! 😊",
    quickReplies: ["Tenho uma dúvida", "Quero fazer sugestão"],
  },

  // === SEGURANÇA ===
  seguranca: {
    keywords: ["seguro", "segurança", "dados", "privacidade", "confiar"],
    answer: "Sua segurança é nossa prioridade! 🔒\n\n✅ Dados criptografados\n✅ Não compartilhamos informações pessoais\n✅ Plataforma com certificado SSL\n✅ Política de privacidade transparente\n\nPode confiar! Seus dados estão protegidos.",
    quickReplies: ["Quero me cadastrar", "Ver política de privacidade"],
  },

  // === SAUDAÇÃO ===
  saudacao: {
    keywords: ["oi", "olá", "ola", "hey", "eai", "bom dia", "boa tarde", "boa noite", "oie", "opa"],
    answer: "Olá! 👋 Que bom ter você aqui!\n\nSou a Carol, assistente virtual do Aniversariante VIP. Estou aqui para te ajudar!\n\nComo posso ajudar você hoje?",
    quickReplies: ["Como funciona?", "Quero me cadastrar", "Sou estabelecimento"],
  },

  // === AGRADECIMENTO ===
  agradecimento: {
    keywords: ["obrigado", "obrigada", "valeu", "thanks", "agradeço", "muito obrigado"],
    answer: "Por nada! 😊 Fico feliz em ajudar!\n\nSe tiver mais alguma dúvida, é só chamar. Estou sempre por aqui!\n\n🎂 Aproveite os benefícios de aniversário!",
    quickReplies: ["Tenho outra dúvida", "Explorar estabelecimentos"],
  },

  // === DESPEDIDA ===
  despedida: {
    keywords: ["tchau", "até mais", "flw", "falou", "adeus", "bye"],
    answer: "Até mais! 👋\n\nFoi um prazer ajudar você. Volte sempre!\n\n🎂 E não esqueça de aproveitar seus benefícios de aniversário!",
    quickReplies: [],
  },
};

// ==================== RESPOSTAS CONTEXTUAIS POR PÁGINA ====================
const CONTEXTUAL_TRIGGERS: Record<string, { delay: number; message: string; condition?: string }> = {
  "/auth": {
    delay: 30000, // 30 segundos
    message: "Vi que você está na página de login. Está tendo alguma dificuldade? Posso ajudar com:\n\n• Criar uma conta nova\n• Recuperar senha\n• Login com Google",
  },
  "/cadastro/estabelecimento": {
    delay: 45000, // 45 segundos
    message: "Cadastrando seu estabelecimento? Se precisar de ajuda com algum campo ou tiver dúvidas sobre o CNPJ, é só me chamar! 😊",
  },
  "/explorar": {
    delay: 20000, // 20 segundos
    message: "Procurando benefícios na sua cidade? Use os filtros de categoria e cidade para encontrar os melhores lugares! 🔍",
  },
};

// ==================== COMPONENTE PRINCIPAL ====================
const Carol = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [pageTimer, setPageTimer] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem de boas-vindas ao abrir
  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'carol',
        text: "Olá! 👋 Sou a Carol, assistente virtual do Aniversariante VIP!\n\nEstou aqui para te ajudar com qualquer dúvida sobre a plataforma.\n\nComo posso ajudar você hoje?",
        timestamp: new Date(),
        quickReplies: ["Como funciona?", "Quero me cadastrar", "Sou estabelecimento", "Buscar benefícios"],
      };
      setMessages([welcomeMessage]);
      setHasShownWelcome(true);
    }
  }, [isOpen, hasShownWelcome]);

  // Trigger contextual baseado na página
  useEffect(() => {
    if (pageTimer) {
      clearTimeout(pageTimer);
    }

    const trigger = CONTEXTUAL_TRIGGERS[location.pathname];
    if (trigger && !isOpen) {
      const timer = setTimeout(() => {
        // Mostrar notificação ou abrir chat com mensagem contextual
        setIsOpen(true);
        const contextMessage: Message = {
          id: Date.now().toString(),
          type: 'carol',
          text: trigger.message,
          timestamp: new Date(),
          quickReplies: ["Sim, preciso de ajuda", "Estou bem, obrigado"],
        };
        setMessages(prev => [...prev, contextMessage]);
      }, trigger.delay);

      setPageTimer(timer);
    }

    return () => {
      if (pageTimer) {
        clearTimeout(pageTimer);
      }
    };
  }, [location.pathname]);

  // Encontrar melhor resposta baseada na mensagem do usuário
  const findBestResponse = (userMessage: string): { answer: string; quickReplies?: string[] } => {
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Buscar nas FAQs
    for (const [key, faq] of Object.entries(FAQ_DATABASE)) {
      for (const keyword of faq.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          return { answer: faq.answer, quickReplies: faq.quickReplies };
        }
      }
    }

    // Resposta padrão se não encontrar
    return {
      answer: "Hmm, não tenho certeza se entendi sua dúvida. 🤔\n\nPosso te ajudar com:\n\n• Como se cadastrar\n• Como usar os benefícios\n• Dúvidas sobre estabelecimentos\n• Problemas técnicos\n\nPode reformular sua pergunta ou escolher uma das opções abaixo?",
      quickReplies: ["Como funciona?", "Tenho um problema", "Falar com suporte"],
    };
  };

  // Processar ações especiais
  const processAction = (action: string) => {
    switch (action.toLowerCase()) {
      case "quero me cadastrar":
      case "criar conta":
        navigate('/auth?modo=cadastro');
        return "Vou te levar para a página de cadastro! 🚀";
      
      case "ir para login":
      case "fazer login":
        navigate('/auth');
        return "Abrindo a página de login...";
      
      case "explorar estabelecimentos":
      case "ver estabelecimentos":
      case "buscar benefícios":
        navigate('/explorar');
        return "Vamos explorar os estabelecimentos! 🔍";
      
      case "ver meus favoritos":
        navigate('/meus-favoritos');
        return "Abrindo seus favoritos... ❤️";
      
      case "cadastrar empresa":
      case "sou estabelecimento":
      case "tenho estabelecimento":
        navigate('/cadastro/estabelecimento');
        return "Vou te mostrar como cadastrar seu estabelecimento! 🏪";
      
      case "como funciona?":
        navigate('/como-funciona');
        return "Vou te explicar tudo sobre a plataforma! 📖";
      
      default:
        return null;
    }
  };

  // Enviar mensagem
  const handleSend = useCallback((text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular digitação e responder
    setTimeout(() => {
      // Verificar se é uma ação especial
      const actionResponse = processAction(messageText);
      
      let response: { answer: string; quickReplies?: string[] };
      
      if (actionResponse) {
        response = { answer: actionResponse, quickReplies: ["Tenho outra dúvida", "Obrigado!"] };
      } else {
        response = findBestResponse(messageText);
      }

      const carolMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'carol',
        text: response.answer,
        timestamp: new Date(),
        quickReplies: response.quickReplies,
      };

      setMessages(prev => [...prev, carolMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 segundos de delay
  }, [inputValue, navigate]);

  // Lidar com quick replies
  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  // Calcular posição do botão (evitar sobrepor outros elementos)
  const getButtonPosition = () => {
    const pagesWithFooterButton = ['/estabelecimento/', '/cadastro/'];
    const hasFooterButton = pagesWithFooterButton.some(p => location.pathname.includes(p));
    
    return hasFooterButton ? 'bottom-28' : 'bottom-6';
  };

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${getButtonPosition()} right-6 z-40 w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-violet-500/30 flex items-center justify-center hover:scale-110 transition-all group`}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          
          {/* Indicador de online */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          
          {/* Tooltip */}
          <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Fale com a Carol
          </span>
        </button>
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[520px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Carol</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Online agora
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-gray-100 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                </div>

                {/* Quick Replies */}
                {message.type === 'carol' && message.quickReplies && message.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-2">
                    {message.quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-full border border-gray-700 hover:border-violet-500 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de digitando */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-full px-4"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-full w-10 h-10"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};

export default Carol;