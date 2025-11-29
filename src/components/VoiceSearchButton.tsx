import { Mic } from 'lucide-react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
}

export const VoiceSearchButton = ({ onResult }: VoiceSearchButtonProps) => {
  const { isListening, transcript, startListening, isSupported, error } = useVoiceSearch();

  // Quando o transcript mudar e parar de ouvir, enviar resultado
  useEffect(() => {
    if (!isListening && transcript) {
      onResult(transcript);
    }
  }, [isListening, transcript, onResult]);

  // Mostrar erro
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (!isSupported) {
    return null; // Não mostra o botão se não suportar
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={startListening}
              disabled={isListening}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-lg transition-all group
                ${isListening 
                  ? 'bg-red-500/20 animate-pulse' 
                  : 'bg-white/10 hover:bg-white/20'
                }
              `}
            >
              {isListening ? (
                <div className="relative">
                  <Mic className="w-5 h-5 text-red-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </div>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-gray-400 group-hover:text-violet-400" />
                  <span className="text-[10px] text-gray-500 group-hover:text-violet-400 font-medium">
                    Voz
                  </span>
                </>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-slate-800 border-slate-700">
            <p className="text-sm">🎤 Buscar por voz</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Modal/Overlay quando está ouvindo */}
      {isListening && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-pulse mb-4 mx-auto">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <p className="text-white text-lg mb-2">Ouvindo...</p>
            <p className="text-gray-400 text-sm">Diga o nome do estabelecimento ou cidade</p>
            {transcript && (
              <p className="text-violet-400 mt-4 text-lg">"{transcript}"</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
