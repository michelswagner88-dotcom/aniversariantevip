import { useState, useEffect, useCallback } from 'react';

// Tipagem para a API do Navegador (que não existe no TS padrão as vezes)
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionApi) {
      const instance = new SpeechRecognitionApi();
      instance.continuous = false; // Para assim que a pessoa para de falar
      instance.interimResults = false; // Só pega o resultado final
      instance.lang = 'pt-BR'; // Força português Brasil

      instance.onstart = () => setIsListening(true);
      
      instance.onend = () => setIsListening(false);
      
      instance.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      instance.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        setError("Não entendi. Tente novamente.");
        setIsListening(false);
      };

      setRecognition(instance);
    } else {
      setError("Seu navegador não suporta busca por voz.");
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      try {
        // Primeiro para qualquer reconhecimento em andamento
        try {
          recognition.stop();
        } catch (e) {
          // Ignora erro se não estava rodando
        }
        
        // Aguarda um pouco e reinicia
        setTimeout(() => {
          try {
            recognition.start();
            setTranscript(""); // Limpa busca anterior
            setError(null);
          } catch (startError) {
            console.error("Erro ao iniciar reconhecimento:", startError);
            setError("Erro ao ativar o microfone. Verifique as permissões.");
          }
        }, 100);
      } catch (e) {
        console.error("Erro no reconhecimento de voz:", e);
        setError("Erro ao ativar o microfone.");
      }
    } else {
      setError("Reconhecimento de voz não disponível neste navegador.");
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) recognition.stop();
  }, [recognition]);

  return { isListening, transcript, startListening, stopListening, error, hasSupport: !!recognition };
};
