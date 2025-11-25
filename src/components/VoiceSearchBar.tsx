import React, { useEffect, useState } from 'react';
import { Search, MapPin, Mic, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useNavigate } from 'react-router-dom';

const VoiceSearchBar = () => {
  const navigate = useNavigate();
  const { isListening, transcript, startListening, hasSupport } = useSpeechRecognition();
  const [searchQuery, setSearchQuery] = useState("");

  // Atualiza o input quando a voz detecta texto
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
      // Opcional: Navegar automaticamente após falar
      // navigate(`/explorar?q=${transcript}`); 
    }
  }, [transcript]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/explorar?q=${searchQuery}`);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 md:px-0 z-50">
      
      {/* Efeito de 'Ouvindo' (Backdrop) */}
      {isListening && (
        <div className="absolute -inset-4 rounded-3xl bg-violet-600/20 blur-2xl animate-pulse z-0"></div>
      )}

      <div className={`relative flex flex-col md:flex-row items-center gap-2 rounded-3xl border p-2 backdrop-blur-xl transition-all duration-300 ${
        isListening 
          ? 'border-violet-500 bg-slate-900/90 shadow-[0_0_30px_rgba(139,92,246,0.3)]' 
          : 'border-white/10 bg-white/5 shadow-2xl'
      }`}>
        
        {/* Input 1: Localização */}
        <div className="flex h-14 w-full flex-1 items-center gap-3 rounded-2xl bg-white/5 px-4 transition-colors focus-within:bg-white/10 md:bg-transparent md:focus-within:bg-transparent">
          <MapPin className="text-violet-400" size={20} />
          <input 
            type="text" 
            placeholder="Onde?" 
            className="w-full bg-transparent text-white placeholder-slate-400 outline-none"
          />
        </div>

        {/* Divisor Desktop */}
        <div className="hidden h-8 w-[1px] bg-white/10 md:block"></div>

        {/* Input 2: Busca + Microfone */}
        <div className="flex h-14 w-full flex-[1.5] items-center gap-3 rounded-2xl bg-white/5 px-4 transition-colors focus-within:bg-white/10 md:bg-transparent md:focus-within:bg-transparent">
          <Search className={isListening ? "text-violet-400 animate-pulse" : "text-slate-400"} size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isListening ? "Pode falar, estou ouvindo..." : "Buscar restaurante, loja..."}
            className={`w-full bg-transparent outline-none transition-all ${
              isListening ? "text-violet-300 placeholder-violet-300/70" : "text-white placeholder-slate-400"
            }`}
          />
          
          {/* Botão do Microfone */}
          {hasSupport && (
            <button 
              onClick={startListening}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 scale-110' 
                  : 'hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
              title="Pesquisar por voz"
            >
              {isListening ? (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-500/30"></span>
                  <Loader2 size={20} className="animate-spin" />
                </>
              ) : (
                <Mic size={20} />
              )}
            </button>
          )}
        </div>

        {/* Botão de Buscar Principal */}
        <button 
          onClick={handleSearch}
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 font-bold text-white shadow-lg shadow-violet-500/20 transition-transform active:scale-95 md:w-auto md:px-8"
        >
          Buscar
        </button>

      </div>
      
      {/* Feedback Visual de Texto Falado */}
      {isListening && (
        <div className="absolute -bottom-12 left-0 right-0 text-center">
          <span className="inline-block rounded-full bg-slate-900/80 px-4 py-1 text-xs font-medium text-violet-300 backdrop-blur-md border border-violet-500/30">
            🎤 Ouvindo... Fale agora
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceSearchBar;
