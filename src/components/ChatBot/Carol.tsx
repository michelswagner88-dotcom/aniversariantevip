import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, X, Send, Loader2, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

// ==================== TIPOS ====================
interface Message {
  id: string;
  type: 'user' | 'carol';
  text: string;
  timestamp: Date;
}


// ==================== COMPONENTE PRINCIPAL ====================
const Carol = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user) {
        const nome = session.user.user_metadata?.nome || session.user.email?.split('@')[0];
        setUserName(nome);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        const nome = session.user.user_metadata?.nome || session.user.email?.split('@')[0];
        setUserName(nome);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mensagem de boas-vindas ao abrir
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = userName 
        ? `Oi, ${userName}! 👋 Sou a Carol, sua assistente aqui no Aniversariante VIP. Como posso te ajudar hoje?`
        : `Olá! 👋 Sou a Carol, assistente virtual do Aniversariante VIP. Estou aqui pra te ajudar com qualquer dúvida!\n\nComo posso te ajudar hoje?`;
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'carol',
        text: greeting,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userName]);

  // Contexto do usuário para a Carol
  const getUserContext = () => {
    const contexts: string[] = [];
    
    if (isLoggedIn && userName) {
      contexts.push(`Usuário logado: ${userName}`);
    } else {
      contexts.push('Visitante não logado');
    }
    
    contexts.push(`Página atual: ${location.pathname}`);
    
    switch (location.pathname) {
      case '/':
        contexts.push('Está na página inicial');
        break;
      case '/explorar':
        contexts.push('Está buscando estabelecimentos');
        break;
      case '/auth':
        contexts.push('Está na página de login/cadastro de aniversariante');
        break;
      case '/cadastro/estabelecimento':
        contexts.push('Está na página de cadastro de estabelecimento');
        break;
      case '/como-funciona':
        contexts.push('Está vendo como a plataforma funciona');
        break;
      case '/para-empresas':
        contexts.push('Está vendo informações para estabelecimentos parceiros');
        break;
      case '/meus-favoritos':
        contexts.push('Está vendo seus estabelecimentos favoritos');
        break;
      default:
        if (location.pathname.includes('/estabelecimento/') || location.pathname.match(/^\/[a-z]{2}\/[^/]+\/[^/]+$/)) {
          contexts.push('Está vendo o perfil de um estabelecimento');
        }
    }
    
    return contexts.join('. ');
  };

  // Detectar comandos de navegação na resposta
  const processNavigation = (response: string) => {
    const navigationPatterns = [
      { pattern: /vou te levar.*cadastro|vamos.*cadastro|acesse.*cadastro/i, route: '/auth?modo=cadastro' },
      { pattern: /vou te levar.*login|vamos.*login|acesse.*login/i, route: '/auth' },
      { pattern: /vou te levar.*explorar|vamos.*explorar|acesse.*explorar/i, route: '/explorar' },
      { pattern: /vou te levar.*favoritos|vamos.*favoritos|acesse.*favoritos/i, route: '/meus-favoritos' },
      { pattern: /vou te levar.*como funciona|vamos.*como funciona/i, route: '/como-funciona' },
      { pattern: /vou te levar.*empresas|vamos.*empresas|acesse.*para-empresas|vou te levar.*para empresas|página de cadastro de estabelecimento/i, route: '/para-empresas' },
      { pattern: /vou te levar.*cadastro.*estabelecimento|cadastrar.*empresa|cadastrar.*estabelecimento/i, route: '/cadastro/estabelecimento' },
    ];

    for (const { pattern, route } of navigationPatterns) {
      if (pattern.test(response)) {
        setTimeout(() => navigate(route), 1500);
        break;
      }
    }
  };

  // Enviar mensagem para Carol (via Lovable AI)
  const sendToCarol = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('carol-chat', {
        body: {
          message: userMessage,
          conversationHistory: messages.slice(-10),
          userContext: getUserContext(),
        },
      });

      if (error) {
        console.error('Erro ao chamar Carol:', error);
        throw error;
      }
      
      if (!data?.response) {
        throw new Error('Resposta vazia da Carol');
      }
      
      return data.response;
    } catch (error) {
      console.error('Erro ao chamar Carol:', error);
      return "Ops, tive um probleminha técnico! 😅 Tenta de novo? Se continuar, manda email pra contato@aniversariantevip.com.br";
    }
  };

  // Enviar mensagem
  const handleSend = useCallback(async () => {
    const messageText = inputValue.trim();
    if (!messageText || isTyping) return;

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

    // Chamar Lovable AI
    const response = await sendToCarol(messageText);

    // Adicionar resposta da Carol
    const carolMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'carol',
      text: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, carolMessage]);
    setIsTyping(false);

    // Verificar se precisa navegar
    processNavigation(response);
  }, [inputValue, isTyping, messages]);

  // Calcular posição do botão
  const getButtonPosition = () => {
    const pagesWithFooterButton = ['/estabelecimento/', '/cadastro/'];
    const hasFooterButton = pagesWithFooterButton.some(p => location.pathname.includes(p)) ||
      location.pathname.match(/^\/[a-z]{2}\/[^/]+\/[^/]+$/);
    
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
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          <span className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Fale com a Carol
          </span>
        </button>
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] max-h-[80vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
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
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'carol' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                      : 'bg-gray-800 text-gray-100 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}

            {/* Indicador de digitando */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões rápidas (só na primeira interação) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {["Como funciona?", "Quero me cadastrar", "Sou estabelecimento"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInputValue(suggestion);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-full border border-gray-700 hover:border-violet-500 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-800 flex-shrink-0">
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
                disabled={isTyping}
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-full px-4 focus:ring-violet-500 focus:border-violet-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-full w-10 h-10 flex-shrink-0"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};

export default Carol;