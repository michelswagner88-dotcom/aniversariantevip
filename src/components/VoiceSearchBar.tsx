import React, { useEffect, useState } from 'react';
import { Search, MapPin, Mic, Loader2, LocateFixed, X } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCepLookup } from '../hooks/useCepLookup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GeolocationProgress } from './GeolocationProgress';
import { LocationConfirmDialog } from './LocationConfirmDialog';

const VoiceSearchBar = () => {
  const navigate = useNavigate();
  const { isListening, transcript, startListening, hasSupport } = useSpeechRecognition();
  const { 
    location, 
    loading: geoLoading, 
    currentStep, 
    cachedLocation,
    showLocationConfirm,
    requestLocation,
    confirmCachedLocation,
    rejectCachedLocation
  } = useGeolocation();
  const { fetchCep, formatCep, loading: cepLoading } = useCepLookup();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [locationText, setLocationText] = useState("");
  const [showCepDialog, setShowCepDialog] = useState(false);
  const [cepInput, setCepInput] = useState("");

  // Atualiza o texto de localização quando detectada
  useEffect(() => {
    if (location) {
      setLocationText(`${location.cidade}, ${location.estado}`);
    }
  }, [location]);

  // Atualiza o input quando a voz detecta texto
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  const handleDetectLocation = async () => {
    try {
      await requestLocation();
    } catch (error) {
      // Se falhar, abre o diálogo de CEP
      setShowCepDialog(true);
    }
  };

  const handleCepSubmit = async () => {
    const data = await fetchCep(cepInput);
    if (data) {
      setLocationText(`${data.localidade}, ${data.uf}`);
      setShowCepDialog(false);
      setCepInput("");
    }
  };

  const clearLocation = () => {
    setLocationText("");
    localStorage.removeItem('user_location');
  };

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
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder="Onde?" 
            className="w-full bg-transparent text-white placeholder-slate-400 outline-none"
          />
          {locationText && (
            <button onClick={clearLocation} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          )}
          <button 
            onClick={handleDetectLocation}
            disabled={geoLoading}
            className="group flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-white/10"
            title="Detectar minha localização"
          >
            {geoLoading ? (
              <Loader2 size={20} className="animate-spin text-violet-400" />
            ) : (
              <LocateFixed size={20} className="text-slate-400 group-hover:text-violet-400" />
            )}
          </button>
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

      {/* Progress da Geolocalização */}
      <GeolocationProgress currentStep={currentStep} />

      {/* Diálogo de Confirmação de Localização em Cache */}
      {cachedLocation && (
        <LocationConfirmDialog
          open={showLocationConfirm}
          cidade={cachedLocation.cidade}
          estado={cachedLocation.estado}
          onConfirm={confirmCachedLocation}
          onReject={rejectCachedLocation}
        />
      )}

      {/* Diálogo de CEP */}
      <Dialog open={showCepDialog} onOpenChange={setShowCepDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Informe seu CEP</DialogTitle>
            <DialogDescription className="text-slate-400">
              Não conseguimos detectar sua localização automaticamente. Por favor, digite seu CEP para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              type="text"
              value={cepInput}
              onChange={(e) => setCepInput(formatCep(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowCepDialog(false)} 
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCepSubmit}
                disabled={cepLoading}
                className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600"
              >
                {cepLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceSearchBar;
