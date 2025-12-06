import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VoiceSearchButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  className?: string;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  isListening,
  isSupported,
  onClick,
  className,
}) => {
  if (!isSupported) {
    return null;
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 shrink-0",
        isListening 
          ? "bg-red-500 text-white" 
          : "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground",
        className
      )}
      title={isListening ? 'Parar busca por voz' : 'Buscar por voz'}
      aria-label={isListening ? 'Parar busca por voz' : 'Iniciar busca por voz'}
    >
      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            key="listening"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="relative"
          >
            <MicOff size={18} />
            {/* Onda de áudio animada */}
            <span className="absolute inset-0 -m-1 rounded-full bg-red-500 animate-ping opacity-40" />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Mic size={18} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};