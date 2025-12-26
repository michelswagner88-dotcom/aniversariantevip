import React, { useEffect, useState, useCallback, useRef } from "react";
import { Search, MapPin, Mic, Loader2, LocateFixed, X, Store, Tag, Clock, Sparkles, CheckCircle } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useGeolocation } from "../hooks/useGeolocation";
import { useCepLookup } from "../hooks/useCepLookup";
import { useCidadesAutocomplete } from "../hooks/useCidadesAutocomplete";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizarCidade } from "@/lib/utils";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

// Constantes para histórico
const SEARCH_HISTORY_KEY = "voice_search_history";
const MAX_HISTORY_ITEMS = 5;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  type: "text" | "category" | "specialty";
}

interface Suggestion {
  type: "establishment" | "category" | "specialty" | "history";
  id?: string;
  name: string;
  icon?: string;
  slug?: string;
  cidade?: string;
  estado?: string;
  categoria?: string;
  parentCategory?: string;
}

const VoiceSearchBar = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [searchParams] = useSearchParams();
  const isOnExplorar = routeLocation.pathname === "/explorar";

  const { isListening, transcript, startListening, hasSupport } = useSpeechRecognition();
  const {
    location: geoLocation,
    loading: geoLoading,
    error: geoError,
    currentStep,
    requestLocation,
  } = useGeolocation();
  const { fetchCep, formatCep, loading: cepLoading } = useCepLookup();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationText, setLocationText] = useState("");
  const [showCepDialog, setShowCepDialog] = useState(false);
  const [cepInput, setCepInput] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flag para controlar se o usuário pediu geolocalização explicitamente
  const [userRequestedLocation, setUserRequestedLocation] = useState(false);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Search history state
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // City autocomplete state
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const { cidades: cidadesSugestoes, isLoading: loadingCidades } = useCidadesAutocomplete(locationText);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    }
  }, []);

  // Função para salvar busca no histórico
  const saveToHistory = useCallback(
    (query: string, type: "text" | "category" | "specialty") => {
      const newItem: SearchHistoryItem = { query, timestamp: Date.now(), type };
      const updated = [newItem, ...searchHistory.filter((h) => h.query.toLowerCase() !== query.toLowerCase())].slice(
        0,
        MAX_HISTORY_ITEMS,
      );
      setSearchHistory(updated);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    },
    [searchHistory],
  );

  // Função para limpar histórico
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  // Função para remover item do histórico
  const removeFromHistory = (query: string) => {
    const updated = searchHistory.filter((h) => h.query !== query);
    setSearchHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  // Inicializar com valores da URL se estiver na página Explorar
  useEffect(() => {
    if (isOnExplorar) {
      const cidadeParam = searchParams.get("cidade");
      const estadoParam = searchParams.get("estado");
      const qParam = searchParams.get("q");

      // Cidade da URL tem prioridade absoluta
      if (cidadeParam) {
        const fullLocation = estadoParam ? `${cidadeParam}, ${estadoParam}` : cidadeParam;
        setLocationText(fullLocation);
      }

      if (qParam && !searchQuery) {
        setSearchQuery(qParam);
      }
    }
  }, [isOnExplorar, searchParams]);

  // Atualiza o texto de localização APENAS quando o usuário pediu explicitamente
  useEffect(() => {
    if (geoLocation && userRequestedLocation) {
      const cidadeParam = searchParams.get("cidade");

      // Não sobrescrever se já existe cidade na URL
      if (!cidadeParam) {
        const newLocation = `${geoLocation.cidade}, ${geoLocation.estado}`;
        setLocationText(newLocation);
        if (isOnExplorar) {
          updateExplorarUrl(newLocation, searchQuery);
        }
      }

      // Reset da flag após processar
      setUserRequestedLocation(false);
    }
  }, [geoLocation, userRequestedLocation, searchParams]);

  // Atualiza o input e processa busca por voz quando detecta texto
  useEffect(() => {
    if (transcript && !isListening) {
      setSearchQuery(transcript);
      handleVoiceSearch(transcript);
    }
  }, [transcript, isListening]);

  const handleDetectLocation = async () => {
    try {
      setUserRequestedLocation(true); // Marcar que usuário pediu explicitamente
      await requestLocation();
    } catch (error) {
      setUserRequestedLocation(false);
      setShowCepDialog(true);
    }
  };

  const handleCepSubmit = async () => {
    const data = await fetchCep(cepInput);
    if (data) {
      const newLocation = `${data.localidade}, ${data.uf}`;
      handleLocationChange(newLocation);
      setShowCepDialog(false);
      setCepInput("");
    }
  };

  const clearLocation = () => {
    setLocationText("");
    localStorage.removeItem("user_location");
    if (isOnExplorar) {
      updateExplorarUrl("", searchQuery);
    }
  };

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar sugestões (categorias, especialidades e estabelecimentos)
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    const queryLower = query.toLowerCase();

    try {
      // 1. Buscar categorias correspondentes
      const matchingCategories: Suggestion[] = CATEGORIAS_ESTABELECIMENTO.filter((cat) =>
        cat.label.toLowerCase().includes(queryLower),
      )
        .slice(0, 3)
        .map((cat) => ({
          type: "category",
          name: cat.label,
          icon: cat.icon,
        }));

      // 2. Buscar especialidades
      const { data: specialties } = await supabase
        .from("especialidades")
        .select("nome, icone, categoria")
        .eq("ativo", true)
        .ilike("nome", `%${query}%`)
        .limit(5);

      const matchingSpecialties: Suggestion[] = (specialties || []).map((spec) => ({
        type: "specialty",
        name: spec.nome,
        icon: spec.icone || "✨",
        parentCategory: spec.categoria,
      }));

      // 3. Buscar estabelecimentos
      const { data: establishments } = await supabase
        .from("public_estabelecimentos")
        .select("id, nome_fantasia, slug, cidade, estado, categoria, tipo_beneficio")
        .eq("ativo", true)
        .ilike("nome_fantasia", `%${query}%`)
        .limit(5);

      const establishmentSuggestions: Suggestion[] = (establishments || []).map((est) => ({
        type: "establishment",
        id: est.id || "",
        name: est.nome_fantasia || "",
        slug: est.slug || "",
        cidade: est.cidade || "",
        estado: est.estado || "",
        categoria: Array.isArray(est.categoria) ? est.categoria[0] : est.categoria,
      }));

      // Combinar: Categorias > Especialidades > Estabelecimentos
      const allSuggestions = [...matchingCategories, ...matchingSpecialties, ...establishmentSuggestions];
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Função para atualizar URL em tempo real na página Explorar
  const updateExplorarUrl = useCallback(
    (cidade: string, query: string) => {
      const params = new URLSearchParams(searchParams);

      if (cidade.trim()) {
        const [cidadeNome] = cidade.split(",");
        params.set("cidade", cidadeNome.trim());
      } else {
        params.delete("cidade");
      }

      if (query.trim()) {
        params.set("q", query.trim().toLowerCase());
      } else {
        params.delete("q");
      }

      navigate(`/explorar?${params.toString()}`, { replace: true });
    },
    [searchParams, navigate],
  );

  // Busca em tempo real com debounce + sugestões
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (suggestionsRef.current) clearTimeout(suggestionsRef.current);

    // Se o campo estiver vazio, mostrar histórico
    if (value.length === 0) {
      setSuggestions([]);
      setShowSuggestions(searchHistory.length > 0);
    } else {
      // Buscar sugestões com debounce de 200ms
      suggestionsRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 200);
    }

    if (isOnExplorar) {
      debounceRef.current = setTimeout(() => {
        updateExplorarUrl(locationText, value);
      }, 300);
    }
  };

  // Selecionar sugestão
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setShowSuggestions(false);

    if (suggestion.type === "history") {
      // Re-executar busca do histórico
      setSearchQuery(suggestion.name);
      handleVoiceSearch(suggestion.name);
      return;
    }

    // Salvar no histórico
    const historyType =
      suggestion.type === "category" ? "category" : suggestion.type === "specialty" ? "specialty" : "text";
    saveToHistory(suggestion.name, historyType);

    if (suggestion.type === "category") {
      navigate(`/explorar?categoria=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === "specialty") {
      const params = new URLSearchParams();
      if (suggestion.parentCategory) {
        params.set("categoria", suggestion.parentCategory);
      }
      params.set("especialidade", suggestion.name);
      navigate(`/explorar?${params.toString()}`);
    } else if (suggestion.type === "establishment" && suggestion.slug) {
      const estado = suggestion.estado?.toLowerCase() || "";
      const cidade = suggestion.cidade?.toLowerCase().replace(/\s+/g, "-") || "";
      navigate(`/${estado}/${cidade}/${suggestion.slug}`);
    }

    setSearchQuery("");
  };

  // Total de itens navegáveis (histórico ou sugestões)
  const totalNavigableItems = searchQuery.length === 0 ? searchHistory.length : suggestions.length;

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || totalNavigableItems === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalNavigableItems - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalNavigableItems - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (searchQuery.length === 0 && searchHistory[selectedIndex]) {
            handleSelectSuggestion({ type: "history", name: searchHistory[selectedIndex].query });
          } else if (suggestions[selectedIndex]) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          }
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  // Atualizar cidade em tempo real
  const handleLocationChange = (value: string) => {
    setLocationText(value);

    if (isOnExplorar) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateExplorarUrl(value, searchQuery);
      }, 300);
    }
  };

  const handleVoiceSearch = async (texto: string) => {
    const textoLower = texto.toLowerCase().trim();

    // Salvar no histórico
    saveToHistory(texto, "text");

    // Detectar comandos de proximidade
    const comandosProximidade = [
      "perto de mim",
      "próximo",
      "proximo",
      "aqui perto",
      "por aqui",
      "na minha região",
      "na região",
      "ao redor",
    ];

    const isComandoProximidade = comandosProximidade.some((cmd) => textoLower.includes(cmd));

    if (isComandoProximidade) {
      if (!geoLocation && !locationText) {
        toast.info("Detectando sua localização...");
        try {
          await requestLocation();
          setTimeout(() => {
            handleVoiceSearch(texto);
          }, 2000);
          return;
        } catch (error) {
          toast.error("Não conseguimos detectar sua localização. Por favor, digite a cidade.");
          setShowCepDialog(true);
          return;
        }
      }
    }

    // Mapeamento de categorias com sinônimos
    const categoriasMap: Record<string, string> = {
      restaurante: "Restaurante",
      restaurantes: "Restaurante",
      comida: "Restaurante",
      bar: "Bar",
      bares: "Bar",
      pub: "Bar",
      cervejaria: "Bar",
      academia: "Academia",
      academias: "Academia",
      ginásio: "Academia",
      barbearia: "Barbearia",
      barbearias: "Barbearia",
      barbeiro: "Barbearia",
      salão: "Salão de Beleza",
      salao: "Salão de Beleza",
      cabeleireiro: "Salão de Beleza",
      café: "Cafeteria",
      cafe: "Cafeteria",
      cafeteria: "Cafeteria",
      balada: "Casa Noturna",
      boate: "Casa Noturna",
      "casa noturna": "Casa Noturna",
      confeitaria: "Confeitaria",
      doçaria: "Confeitaria",
      hotel: "Hospedagem",
      pousada: "Hospedagem",
      hospedagem: "Hospedagem",
      loja: "Outros Comércios",
      comércio: "Outros Comércios",
    };

    let categoriaEncontrada: string | null = null;
    for (const [key, value] of Object.entries(categoriasMap)) {
      if (textoLower.includes(key)) {
        categoriaEncontrada = value;
        break;
      }
    }

    const cidadesComuns = [
      "florianópolis",
      "florianopolis",
      "floripa",
      "curitiba",
      "porto alegre",
      "porto-alegre",
      "são paulo",
      "sao paulo",
      "sp",
      "rio de janeiro",
      "rio",
      "joinville",
      "blumenau",
      "balneário camboriú",
      "balneario camboriu",
      "bc",
      "chapecó",
      "chapeco",
      "criciúma",
      "criciuma",
    ];

    let cidadeEncontrada: string | null = null;
    for (const cidade of cidadesComuns) {
      if (textoLower.includes(cidade)) {
        cidadeEncontrada = normalizarCidade(cidade);
        break;
      }
    }

    if (!cidadeEncontrada && locationText) {
      const [cidade] = locationText.split(",");
      cidadeEncontrada = cidade.trim();
    }

    if (!categoriaEncontrada) {
      try {
        const { data: estabelecimentos } = await supabase
          .from("public_estabelecimentos")
          .select("slug, nome_fantasia, cidade, estado")
          .eq("ativo", true)
          .ilike("nome_fantasia", `%${textoLower}%`)
          .limit(5);

        if (estabelecimentos && estabelecimentos.length > 0) {
          const est = estabelecimentos[0];
          toast.success(`Encontrado: ${est.nome_fantasia}`);
          navigate(`/${est.estado?.toLowerCase()}/${est.cidade?.toLowerCase().replace(/\s+/g, "-")}/${est.slug}`);
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar estabelecimento:", error);
      }
    }

    const params = new URLSearchParams();

    if (isComandoProximidade) {
      if (geoLocation?.cidade) {
        params.set("cidade", geoLocation.cidade);
        cidadeEncontrada = geoLocation.cidade;
      } else if (locationText) {
        const [cidade] = locationText.split(",");
        params.set("cidade", cidade.trim());
        cidadeEncontrada = cidade.trim();
      }

      if (categoriaEncontrada) {
        params.set("categoria", categoriaEncontrada);
        toast.success(`Buscando ${categoriaEncontrada} perto de você em ${cidadeEncontrada || "sua região"}`);
      } else {
        toast.success(`Buscando estabelecimentos perto de você em ${cidadeEncontrada || "sua região"}`);
      }
    } else {
      if (categoriaEncontrada) {
        params.set("categoria", categoriaEncontrada);
        toast.success(`Buscando ${categoriaEncontrada}${cidadeEncontrada ? ` em ${cidadeEncontrada}` : ""}`);
      }
      if (cidadeEncontrada) {
        params.set("cidade", cidadeEncontrada);
      }
      if (!categoriaEncontrada && !cidadeEncontrada) {
        params.set("q", textoLower);
        toast.info("Buscando por: " + texto);
      }
    }

    navigate(`/explorar?${params.toString()}`);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      handleVoiceSearch(searchQuery);
    }
  };

  // Mostrar histórico quando focar no campo vazio
  const handleInputFocus = () => {
    if (searchQuery.length === 0 && searchHistory.length > 0) {
      setShowSuggestions(true);
    } else if (searchQuery.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 md:px-0 z-50" ref={containerRef}>
      {/* Efeito de 'Ouvindo' (Backdrop) */}
      {isListening && <div className="absolute -inset-4 rounded-3xl bg-violet-600/20 blur-2xl animate-pulse z-0"></div>}

      <div
        className={`relative flex flex-col md:flex-row items-center gap-2 rounded-3xl border p-2 backdrop-blur-xl transition-all duration-300 ${
          isListening
            ? "border-violet-500 bg-slate-900/90 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            : "border-white/10 bg-white/5 shadow-2xl"
        }`}
      >
        {/* Input 1: Localização com Autocomplete */}
        <div className="relative flex h-14 w-full flex-1 items-center gap-3 rounded-2xl bg-white/5 px-4 transition-colors focus-within:bg-white/10 md:bg-transparent md:focus-within:bg-transparent">
          <MapPin className="text-violet-400" size={20} />
          <input
            ref={cityInputRef}
            type="text"
            value={locationText}
            onChange={(e) => {
              handleLocationChange(e.target.value);
              setShowCitySuggestions(true);
            }}
            onFocus={() => setShowCitySuggestions(true)}
            placeholder="Digite a cidade"
            className="w-full bg-transparent text-white placeholder-slate-400 outline-none"
            autoComplete="off"
          />
          {loadingCidades && <Loader2 size={16} className="animate-spin text-violet-400" />}
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

          {/* Dropdown de Cidades - CORRIGIDO para nova interface */}
          <AnimatePresence>
            {showCitySuggestions && (cidadesSugestoes.length > 0 || locationText.length < 2) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[100]"
              >
                <div className="p-2 max-h-60 overflow-y-auto">
                  {/* Opção "Usar minha localização" sempre no topo */}
                  <button
                    onClick={() => {
                      setUserRequestedLocation(true);
                      requestLocation();
                      setShowCitySuggestions(false);
                    }}
                    disabled={geoLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-violet-500/10 text-slate-300 border-b border-white/10 mb-2"
                  >
                    <LocateFixed size={18} className="text-violet-400" />
                    <div className="flex-1">
                      <span className="text-white font-medium">Usar minha localização</span>
                      <p className="text-xs text-slate-400">Detectar cidade automaticamente</p>
                    </div>
                    {geoLoading && <Loader2 className="animate-spin text-violet-400" size={16} />}
                  </button>

                  {/* Lista de cidades sugeridas - CORRIGIDO: usa cidade ao invés de nome */}
                  {cidadesSugestoes.map((cidadeItem, index) => (
                    <button
                      key={`${cidadeItem.cidade}-${cidadeItem.estado}-${index}`}
                      onClick={() => {
                        const newLocation = `${cidadeItem.cidade}, ${cidadeItem.estado}`;
                        setLocationText(newLocation);
                        setShowCitySuggestions(false);
                        if (isOnExplorar) {
                          updateExplorarUrl(newLocation, searchQuery);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-white/5 text-slate-300"
                    >
                      <MapPin size={16} className="text-slate-500" />
                      <span className="flex-1">
                        {cidadeItem.cidade}, <span className="text-slate-500">{cidadeItem.estado}</span>
                      </span>
                      {/* Mostrar quantidade ao invés de "Disponível" */}
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle size={12} />
                        {cidadeItem.total} {cidadeItem.total === 1 ? "lugar" : "lugares"}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divisor Desktop */}
        <div className="hidden h-8 w-[1px] bg-white/10 md:block"></div>

        {/* Input 2: Busca + Microfone + Autocomplete */}
        <div className="relative flex h-14 w-full flex-[1.5] items-center gap-3 rounded-2xl bg-white/5 px-4 transition-colors focus-within:bg-white/10 md:bg-transparent md:focus-within:bg-transparent">
          <Search className={isListening ? "text-violet-400 animate-pulse" : "text-slate-400"} size={20} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={isListening ? "Pode falar, estou ouvindo..." : "Buscar restaurante, loja..."}
            className={`w-full bg-transparent outline-none transition-all ${
              isListening ? "text-violet-300 placeholder-violet-300/70" : "text-white placeholder-slate-400"
            }`}
            autoComplete="off"
          />

          {/* Loading indicator */}
          {loadingSuggestions && <Loader2 size={16} className="animate-spin text-violet-400" />}

          {/* Botão do Microfone */}
          {hasSupport && (
            <button
              onClick={startListening}
              className={`group relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                isListening
                  ? "bg-red-500/20 text-red-400 scale-105"
                  : "hover:bg-white/10 text-slate-400 hover:text-violet-400"
              }`}
              title="Pesquisar por voz"
            >
              {isListening ? (
                <>
                  <span className="absolute inset-0 animate-ping rounded-lg bg-red-500/30"></span>
                  <Loader2 size={20} className="animate-spin relative z-10" />
                  <span className="text-[9px] font-medium relative z-10">Ouvindo</span>
                </>
              ) : (
                <>
                  <Mic size={20} />
                  <span className="text-[9px] font-medium">Voz</span>
                </>
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

      {/* Dropdown de Sugestões e Histórico */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || (searchQuery.length === 0 && searchHistory.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-4 right-4 md:left-0 md:right-0 top-full mt-2 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[100]"
          >
            <div className="p-2 max-h-80 overflow-y-auto">
              {/* HISTÓRICO - Quando campo está vazio */}
              {searchQuery.length === 0 && searchHistory.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-2">
                      <Clock size={14} />
                      Buscas recentes
                    </span>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Limpar
                    </button>
                  </div>
                  {searchHistory.map((item, index) => (
                    <button
                      key={`history-${index}`}
                      onClick={() => handleSelectSuggestion({ type: "history", name: item.query })}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        selectedIndex === index ? "bg-violet-600/20 text-white" : "hover:bg-white/5 text-slate-300"
                      }`}
                    >
                      <Clock size={16} className="text-slate-500" />
                      <span className="flex-1 truncate">{item.query}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(item.query);
                        }}
                        className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </button>
                  ))}
                </>
              )}

              {/* SUGESTÕES - Quando há texto digitado */}
              {searchQuery.length > 0 && suggestions.length > 0 && (
                <>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.name}-${index}`}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        selectedIndex === index ? "bg-violet-600/20 text-white" : "hover:bg-white/5 text-slate-300"
                      }`}
                    >
                      {suggestion.type === "category" && (
                        <>
                          <span className="text-xl">{suggestion.icon}</span>
                          <div className="flex-1">
                            <span className="font-medium text-white">{suggestion.name}</span>
                            <span className="ml-2 text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                              Categoria
                            </span>
                          </div>
                          <Tag size={16} className="text-violet-400" />
                        </>
                      )}

                      {suggestion.type === "specialty" && (
                        <>
                          <span className="text-xl">{suggestion.icon}</span>
                          <div className="flex-1">
                            <span className="font-medium text-white">{suggestion.name}</span>
                            <span className="ml-2 text-xs text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
                              {suggestion.parentCategory}
                            </span>
                          </div>
                          <Sparkles size={16} className="text-pink-400" />
                        </>
                      )}

                      {suggestion.type === "establishment" && (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                            <Store size={16} className="text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{suggestion.name}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {suggestion.categoria && `${suggestion.categoria} • `}
                              {suggestion.cidade}, {suggestion.estado}
                            </p>
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Dica de navegação */}
            <div className="px-4 py-2 border-t border-white/5 bg-slate-800/50">
              <p className="text-xs text-slate-500 text-center">Use ↑↓ para navegar, Enter para selecionar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Visual de Texto Falado */}
      {isListening && (
        <div className="absolute -bottom-12 left-0 right-0 text-center">
          <span className="inline-block rounded-full bg-slate-900/80 px-4 py-1 text-xs font-medium text-violet-300 backdrop-blur-md border border-violet-500/30">
            🎤 Ouvindo... Fale agora
          </span>
        </div>
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
              <Button onClick={() => setShowCepDialog(false)} variant="outline" className="flex-1">
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
