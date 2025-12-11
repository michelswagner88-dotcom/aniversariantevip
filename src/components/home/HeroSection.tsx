import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Mic, MicOff, Gift, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCidadesAutocomplete } from "@/hooks/useCidadesAutocomplete";

interface HeroSectionProps {
  cidade?: string;
  estado?: string;
  onCidadeSelect: (cidade: string, estado: string) => void;
  onBuscaChange: (termo: string) => void;
  onBuscar: () => void;
}

interface EstabelecimentoSugestao {
  id: string;
  nome_fantasia: string;
  categoria: string[] | string;
  cidade: string;
  estado: string;
  slug: string;
  foraDaCidade?: boolean;
}

const HeroSection = ({ cidade, estado, onCidadeSelect, onBuscaChange, onBuscar }: HeroSectionProps) => {
  const navigate = useNavigate();

  // Placeholders rotativos - instruções claras
  const placeholders = [
    "Digite o nome de um restaurante...",
    "Busque por um bar ou pub...",
    "Encontre sua academia...",
    "Procure um salão de beleza...",
    "Busque uma loja...",
    "Digite o nome do estabelecimento...",
  ];

  // Estados
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [busca, setBusca] = useState("");
  const [buscaEstabelecimentos, setBuscaEstabelecimentos] = useState<EstabelecimentoSugestao[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showEstabelecimentoDropdown, setShowEstabelecimentoDropdown] = useState(false);

  // Estados do campo de cidade
  const [editandoCidade, setEditandoCidade] = useState(false);
  const [cidadeInput, setCidadeInput] = useState("");
  const [showCidadeDropdown, setShowCidadeDropdown] = useState(false);

  // Estados do microfone
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cidadeInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook de cidades disponíveis
  const { cidades: cidadesSugestoes, isLoading: isLoadingCidades } = useCidadesAutocomplete(cidadeInput);

  // Verificar suporte a Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setMicSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "pt-BR";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setBusca(transcript);
        setIsListening(false);
        // Disparar busca automática após reconhecimento
        buscarEstabelecimentos(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Rotação de placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3500);

    return () => {
      clearInterval(interval);
    };
  }, [placeholders.length]);

  // Buscar estabelecimentos por nome (com debounce)
  const buscarEstabelecimentos = useCallback(
    async (termo: string) => {
      if (!termo || termo.length < 2) {
        setBuscaEstabelecimentos([]);
        setShowEstabelecimentoDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowEstabelecimentoDropdown(true);

      try {
        let query = supabase
          .from("estabelecimentos")
          .select("id, nome_fantasia, categoria, cidade, estado, slug")
          .eq("ativo", true)
          .ilike("nome_fantasia", `%${termo}%`)
          .limit(8);

        // Filtrar por cidade se selecionada
        if (cidade && estado) {
          query = query.ilike("cidade", cidade).ilike("estado", estado);
        }

        const { data, error } = await query;

        if (error) {
          console.error("[Hero] Erro ao buscar:", error);
          setBuscaEstabelecimentos([]);
          return;
        }

        setBuscaEstabelecimentos(data || []);

        // Se não encontrou na cidade, buscar em todo Brasil
        if ((!data || data.length === 0) && cidade && estado) {
          const { data: dataBrasil } = await supabase
            .from("estabelecimentos")
            .select("id, nome_fantasia, categoria, cidade, estado, slug")
            .eq("ativo", true)
            .ilike("nome_fantasia", `%${termo}%`)
            .limit(5);

          if (dataBrasil && dataBrasil.length > 0) {
            setBuscaEstabelecimentos(dataBrasil.map((e) => ({ ...e, foraDaCidade: true })));
          }
        }
      } catch (err) {
        console.error("[Hero] Erro:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [cidade, estado],
  );

  // Debounce da busca
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      buscarEstabelecimentos(busca);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [busca, buscarEstabelecimentos]);

  // Handlers
  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Se tem apenas 1 resultado, abre direto
    if (buscaEstabelecimentos.length === 1) {
      navigate(`/estabelecimento/${buscaEstabelecimentos[0].slug}`);
      return;
    }

    onBuscaChange(busca);
    onBuscar();
    setShowEstabelecimentoDropdown(false);
  };

  const handleEstabelecimentoClick = (estabelecimento: EstabelecimentoSugestao) => {
    navigate(`/estabelecimento/${estabelecimento.slug}`);
    setShowEstabelecimentoDropdown(false);
    setBusca("");
  };

  const handleCidadeClick = () => {
    setEditandoCidade(true);
    setCidadeInput("");
    setShowCidadeDropdown(true);
    setTimeout(() => cidadeInputRef.current?.focus(), 50);
  };

  const handleCidadeSelect = (novaCidade: string, novoEstado: string) => {
    onCidadeSelect(novaCidade, novoEstado);
    setEditandoCidade(false);
    setShowCidadeDropdown(false);
    setCidadeInput("");
  };

  const handleCidadeInputBlur = () => {
    // Delay para permitir clique no dropdown
    setTimeout(() => {
      if (!showCidadeDropdown) {
        setEditandoCidade(false);
      }
    }, 200);
  };

  const handleMicClick = () => {
    if (!micSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleBadgeClick = () => {
    navigate("/cadastro");
  };

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowEstabelecimentoDropdown(false);
      }
      if (!target.closest(".cidade-container")) {
        setShowCidadeDropdown(false);
        setEditandoCidade(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="relative min-h-[420px] sm:min-h-[450px] md:min-h-[500px] flex items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-8 sm:pb-12 px-3 sm:px-4 bg-[#240046]">
      <div className="relative z-10 container mx-auto px-2 sm:px-4 text-center">
        {/* Badge - Clicável - Vai para Cadastro */}
        <motion.button
          onClick={handleBadgeClick}
          className="inline-flex items-center gap-2 bg-[#3C096C] border border-white/40 rounded-full px-4 sm:px-5 py-2.5 mb-5 sm:mb-6 hover:bg-[#5B21B6] hover:border-white/60 transition-all cursor-pointer shadow-lg shadow-black/20 min-h-[44px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Fazer cadastro gratuito"
        >
          <Gift className="w-4 h-4 text-white" />
          <span className="text-xs sm:text-sm text-white font-semibold whitespace-nowrap">
            Cadastro gratuito para aniversariantes
          </span>
        </motion.button>

        {/* Título */}
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Seu aniversário merece
          <br />
          <span className="text-gradient-animated">benefícios exclusivos</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 max-w-xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Descubra restaurantes, bares, lojas e muito mais para você aproveitar
        </motion.p>

        {/* Barra de Busca */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <form
            onSubmit={handleBuscaSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 bg-white rounded-2xl sm:rounded-full p-2 shadow-2xl shadow-black/20"
          >
            {/* Campo Cidade - Editável Inline */}
            <div className="cidade-container relative">
              {editandoCidade ? (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 sm:border-r border-[#240046]/10 min-w-[140px] sm:min-w-[180px] min-h-[44px]">
                  <MapPin className="w-5 h-5 text-[#240046] flex-shrink-0" />
                  <input
                    ref={cidadeInputRef}
                    type="text"
                    value={cidadeInput}
                    onChange={(e) => {
                      setCidadeInput(e.target.value);
                      setShowCidadeDropdown(true);
                    }}
                    onBlur={handleCidadeInputBlur}
                    placeholder="Digite a cidade..."
                    aria-label="Digite o nome da cidade"
                    className="flex-1 bg-transparent text-[#240046] placeholder-[#240046]/60 outline-none text-sm min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoCidade(false);
                      setShowCidadeDropdown(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#240046]/10 rounded-full transition-colors"
                    aria-label="Fechar seleção de cidade"
                  >
                    <X className="w-4 h-4 text-[#240046]/60" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCidadeClick}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 sm:border-r border-[#240046]/10 hover:bg-[#240046]/5 rounded-xl sm:rounded-l-full transition-colors min-w-[140px] sm:min-w-[180px] min-h-[44px] text-left"
                  aria-label="Selecionar cidade"
                >
                  <MapPin className="w-5 h-5 text-[#240046] flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs text-[#240046]/70 uppercase tracking-wide font-medium">Onde</p>
                    <p className="text-[#240046] font-semibold text-sm sm:text-base truncate max-w-[100px] sm:max-w-[140px]">
                      {cidade && estado ? `${cidade}, ${estado}` : "Selecionar"}
                    </p>
                  </div>
                </button>
              )}

              {/* Dropdown de Cidades */}
              <AnimatePresence>
                {showCidadeDropdown && editandoCidade && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#240046]/10 overflow-hidden z-50 min-w-[200px] max-w-[calc(100vw-2rem)]"
                  >
                    {isLoadingCidades ? (
                      <div className="p-4 text-center text-[#240046]/60">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </div>
                    ) : cidadesSugestoes.length > 0 ? (
                      <ul className="max-h-[200px] overflow-y-auto" role="listbox" aria-label="Lista de cidades">
                        {cidadesSugestoes.map((c, i) => (
                          <li
                            key={`${c.cidade}-${c.estado}-${i}`}
                            onClick={() => handleCidadeSelect(c.cidade, c.estado)}
                            className="px-4 py-3 hover:bg-[#240046]/5 cursor-pointer flex items-center justify-between gap-2 border-b border-[#240046]/5 last:border-0 min-h-[44px]"
                            role="option"
                          >
                            <span className="text-[#240046] font-medium text-sm">
                              {c.cidade}, {c.estado}
                            </span>
                            <span className="text-[#240046]/50 text-xs">
                              {c.total} {c.total === 1 ? "lugar" : "lugares"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : cidadeInput.length >= 2 ? (
                      <div className="p-4 text-center text-[#240046]/60 text-sm">Nenhuma cidade encontrada</div>
                    ) : (
                      <div className="p-4 text-center text-[#240046]/60 text-sm">Digite para buscar cidades</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Campo de Busca por Estabelecimento */}
            <div className="search-container flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 relative min-h-[44px]">
              <Search className="w-5 h-5 text-[#240046] flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onFocus={() => busca.length >= 2 && setShowEstabelecimentoDropdown(true)}
                placeholder={placeholders[currentPlaceholder]}
                aria-label="Buscar estabelecimento por nome"
                className="flex-1 bg-transparent text-[#240046] placeholder-[#240046]/60 outline-none text-sm sm:text-base min-w-0"
              />

              {/* Botão Microfone */}
              {micSupported && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                    isListening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-[#240046]/10 text-[#240046]"
                  }`}
                  aria-label={isListening ? "Parar gravação de voz" : "Iniciar busca por voz"}
                  aria-pressed={isListening}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              {/* Dropdown de Estabelecimentos */}
              <AnimatePresence>
                {showEstabelecimentoDropdown && (busca.length >= 2 || isSearching) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#240046]/10 overflow-hidden z-50 max-w-[calc(100vw-2rem)]"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-[#240046]/60">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        <span className="text-sm">Buscando...</span>
                      </div>
                    ) : buscaEstabelecimentos.length > 0 ? (
                      <ul
                        className="max-h-[280px] overflow-y-auto"
                        role="listbox"
                        aria-label="Estabelecimentos encontrados"
                      >
                        {buscaEstabelecimentos.map((est) => (
                          <li
                            key={est.id}
                            onClick={() => handleEstabelecimentoClick(est)}
                            className="px-4 py-3 hover:bg-[#240046]/5 cursor-pointer border-b border-[#240046]/5 last:border-0 min-h-[44px]"
                            role="option"
                          >
                            <p className="text-[#240046] font-semibold text-sm">{est.nome_fantasia}</p>
                            <p className="text-[#240046]/60 text-xs">
                              {Array.isArray(est.categoria) ? est.categoria[0] : est.categoria} • {est.cidade},{" "}
                              {est.estado}
                              {est.foraDaCidade && <span className="ml-2 text-amber-600">(outra cidade)</span>}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-[#240046]/60 text-sm mb-2">
                          Nenhum "{busca}" encontrado{cidade ? ` em ${cidade}` : ""}
                        </p>
                        {cidade && (
                          <button
                            type="button"
                            onClick={() => {
                              onCidadeSelect("", "");
                              buscarEstabelecimentos(busca);
                            }}
                            className="text-[#240046] text-sm font-medium hover:underline min-h-[44px] px-4"
                          >
                            Buscar em todo Brasil
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botão Buscar */}
            <button
              type="submit"
              aria-label="Buscar estabelecimentos"
              className="bg-gradient-to-r from-[#240046] to-[#3C096C] text-white font-semibold px-5 sm:px-8 py-3 rounded-xl sm:rounded-full shadow-lg shadow-[#240046]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#240046]/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px]"
            >
              <Search className="w-5 h-5" />
              <span>Buscar</span>
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
