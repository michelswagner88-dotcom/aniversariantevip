import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, AlertCircle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceSearchModalProps {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  isListening,
  transcript,
  error,
  onClose,
  onRetry,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X size={20} className="text-muted-foreground" />
            </button>

            {/* Ícone do microfone animado */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className={`
                w-full h-full rounded-full flex items-center justify-center transition-colors
                ${isListening 
                  ? 'bg-gradient-to-br from-red-500 to-red-600' 
                  : error 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                }
              `}>
                {error ? (
                  <AlertCircle size={40} className="text-white" />
                ) : (
                  <Mic size={40} className="text-white" />
                )}
              </div>
              
              {/* Ondas de áudio */}
              {isListening && (
                <>
                  <motion.span 
                    className="absolute inset-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.span 
                    className="absolute inset-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                </>
              )}
            </div>

            {/* Status */}
            <h3 className="text-xl font-bold text-foreground mb-2">
              {error 
                ? 'Ops!' 
                : isListening 
                  ? 'Estou ouvindo...' 
                  : transcript 
                    ? 'Processando...'
                    : 'Pronto para ouvir'
              }
            </h3>

            {/* Transcript ou erro */}
            <div className="min-h-[3rem] flex items-center justify-center">
              {error ? (
                <p className="text-destructive">{error}</p>
              ) : transcript ? (
                <div className="flex items-center gap-2 text-foreground">
                  <Volume2 size={16} className="text-violet-500 shrink-0" />
                  <p className="font-medium">"{transcript}"</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Diga o que você procura</p>
              )}
            </div>

            {/* Exemplos */}
            {isListening && !transcript && (
              <div className="mt-6 text-sm text-muted-foreground">
                <p className="mb-3 font-medium">Experimente dizer:</p>
                <div className="space-y-2">
                  <p className="bg-muted/50 rounded-lg py-1.5 px-3">"Pizzaria no centro"</p>
                  <p className="bg-muted/50 rounded-lg py-1.5 px-3">"Bar com música ao vivo"</p>
                  <p className="bg-muted/50 rounded-lg py-1.5 px-3">"Academia perto de mim"</p>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            {error && (
              <Button
                onClick={onRetry}
                className="mt-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
              >
                <Mic size={18} className="mr-2" />
                Tentar novamente
              </Button>
            )}
            
            {isListening && (
              <p className="mt-6 text-xs text-muted-foreground">
                Toque em qualquer lugar para cancelar
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};