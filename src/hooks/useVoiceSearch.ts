/// <reference path="../types/speech.d.ts" />

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseVoiceSearchOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseVoiceSearchReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useVoiceSearch = (
  onResult?: (transcript: string) => void,
  options?: UseVoiceSearchOptions
): UseVoiceSearchReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<InstanceType<typeof window.SpeechRecognition> | null>(null);
  const onResultRef = useRef(onResult);

  // Atualizar ref quando callback mudar
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Verificar suporte
  const getSpeechRecognition = () => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  };
  
  const isSupported = !!getSpeechRecognition();

  // Inicializar reconhecimento
  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    
    recognition.lang = options?.language || 'pt-BR';
    recognition.continuous = options?.continuous || false;
    recognition.interimResults = options?.interimResults ?? true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('[VoiceSearch] Iniciou escuta');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      
      // Callback quando tiver resultado final
      if (finalTranscript && onResultRef.current) {
        console.log('[VoiceSearch] Resultado final:', finalTranscript.trim());
        onResultRef.current(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('[VoiceSearch] Erro:', event.error);
      
      const errorMessages: Record<string, string> = {
        'no-speech': 'Não detectei sua voz. Tente novamente.',
        'audio-capture': 'Microfone não encontrado.',
        'not-allowed': 'Permissão do microfone negada.',
        'network': 'Erro de conexão. Verifique sua internet.',
        'aborted': 'Busca por voz cancelada.',
        'service-not-allowed': 'Serviço não disponível.',
      };
      
      setError(errorMessages[event.error] || 'Erro na busca por voz.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('[VoiceSearch] Finalizou escuta');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [options?.language, options?.continuous, options?.interimResults]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Busca por voz não suportada neste navegador.');
      return;
    }

    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      // Já está escutando, ignorar
      console.warn('[VoiceSearch] Já está escutando ou erro ao iniciar');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignorar erros ao parar
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};