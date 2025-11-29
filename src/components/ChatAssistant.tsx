import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  onMount?: (sendMessage: (message: string) => void) => void;
}

const ChatAssistant = ({ onMount }: ChatAssistantProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou a Carol, assistente virtual do Aniversariante VIP. Como posso ajudar você hoje?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus no input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          includeContext: true
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = error.message || 'Erro ao processar sua mensagem';
      
      toast.error('Erro no chat', {
        description: errorMessage,
      });

      // Adicionar mensagem de erro ao chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Desculpe, ocorreu um erro: ${errorMessage}. Por favor, tente novamente.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Método público para enviar mensagens proativas
  const sendProactiveMessage = useCallback((message: string) => {
    const assistantMessage: Message = {
      role: 'assistant',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsOpen(true); // Abrir o chat automaticamente
  }, []);

  // Expor método para o componente pai
  useEffect(() => {
    if (onMount) {
      onMount(sendProactiveMessage);
    }
  }, [onMount, sendProactiveMessage]);

  return (
    <>
      {/* Botão Flutuante Premium com Safe Area */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-premium-lg shadow-violet-500/30 transition-all duration-180 hover:scale-105 hover:shadow-violet-500/40 active:scale-95"
          style={{ 
            bottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom, 0px)))',
            marginBottom: '80px'
          }}
          aria-label="Abrir chat assistente"
        >
          <MessageCircle size={22} strokeWidth={2.5} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-fuchsia-500"></span>
          </span>
        </button>
      )}

      {/* Janela do Chat Premium */}
      {isOpen && (
        <div 
          className="fixed right-5 z-40 flex h-[600px] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-premium-lg animate-in slide-in-from-bottom-10 fade-in"
          style={{ 
            bottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom, 0px)))',
            marginBottom: '80px'
          }}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-pink-600/20 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-600">
                <Sparkles size={20} className="text-white" />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400"></span>
              </div>
              <div>
                <h3 className="font-bold text-white">Assistente VIP</h3>
                <p className="text-xs text-slate-400">Online agora</p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Mensagens */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white'
                        : 'border border-white/10 bg-white/5 text-slate-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                    <Loader2 size={16} className="animate-spin text-violet-400" />
                    <span className="text-sm text-slate-400">Pensando...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500/50"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-violet-600 to-pink-600 hover:brightness-110"
              >
                <Send size={18} />
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              Assistente com IA • Dados em tempo real
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
