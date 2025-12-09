import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Mic, Gift } from "lucide-react";
import { CityCombobox } from "@/components/CityCombobox";
import { motion } from "framer-motion";

interface HeroSectionProps {
  cidade?: string;
  estado?: string;
  onCidadeSelect: (cidade: string, estado: string) => void;
  onBuscaChange: (termo: string) => void;
  onBuscar: () => void;
}

const HeroSection = ({ cidade, estado, onCidadeSelect, onBuscaChange, onBuscar }: HeroSectionProps) => {
  const placeholders = [
    "Restaurante japonês...",
    "Spa e massagem...",
    "Bar com música ao vivo...",
    "Buffet infantil...",
    "Salão de beleza...",
    "Academia com benefício...",
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [busca, setBusca] = useState("");
  const [showCitySelector, setShowCitySelector] = useState(false);

  // Ref para armazenar o timeout e poder limpar no cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(false);

      // Limpa timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Armazena referência do novo timeout
      timeoutRef.current = setTimeout(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
        setIsTyping(true);
      }, 200);
    }, 3000);

    return () => {
      clearInterval(interval);
      // Limpa o timeout pendente no cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [placeholders.length]);

  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscaChange(busca);
    onBuscar();
  };

  const handleCidadeSelect = (novaCidade: string, novoEstado: string) => {
    onCidadeSelect(novaCidade, novoEstado);
    setShowCitySelector(false);
  };

  return (
    <section className="relative min-h-[400px] sm:min-h-[450px] md:min-h-[500px] flex items-center justify-center overflow-hidden pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 bg-[#240046]">
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Gift className="w-4 h-4 text-white" />
          <span className="text-sm text-white font-medium">
            O maior guia de benefícios para aniversariantes do Brasil
          </span>
        </motion.div>

        <motion.h1
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Seu aniversário merece
          <br />
          <span className="text-gradient-animated">benefícios exclusivos</span>
        </motion.h1>

        <motion.p
          className="text-sm sm:text-base lg:text-lg text-white mb-6 sm:mb-10 max-w-2xl mx-auto px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Descubra restaurantes, bares, lojas e muito mais para você aproveitar
        </motion.p>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <form
            onSubmit={handleBuscaSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 bg-white rounded-2xl sm:rounded-full p-2 shadow-2xl shadow-black/20"
          >
            <div
              className="flex items-center gap-3 px-4 py-3 sm:border-r border-[#240046]/10 cursor-pointer hover:bg-[#240046]/5 rounded-xl sm:rounded-l-full transition-colors"
              onClick={() => setShowCitySelector(!showCitySelector)}
            >
              <MapPin className="w-5 h-5 text-[#240046]" />
              <div className="text-left">
                <p className="text-xs text-[#240046] uppercase tracking-wide font-medium">Onde</p>
                <p className="text-[#240046] font-semibold">
                  {cidade && estado ? `${cidade}, ${estado}` : "Todo o Brasil"}
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 text-[#240046] flex-shrink-0" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={placeholders[currentPlaceholder]}
                aria-label="Buscar estabelecimentos"
                className={`flex-1 bg-transparent text-[#240046] placeholder-[#240046]/60 outline-none text-sm sm:text-base min-w-0 transition-opacity duration-200 ${isTyping ? "opacity-100" : "opacity-50"}`}
              />
              <button
                type="button"
                className="p-2 hover:bg-[#240046]/10 rounded-full transition-colors"
                aria-label="Busca por voz"
              >
                <Mic className="w-5 h-5 text-[#240046]" />
              </button>
            </div>

            <button
              type="submit"
              aria-label="Buscar estabelecimentos"
              className="relative bg-gradient-to-r from-[#240046] to-[#3C096C] text-white font-semibold px-6 sm:px-8 py-3 rounded-xl sm:rounded-full shadow-lg shadow-[#240046]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#240046]/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Search className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Buscar</span>
            </button>
          </form>

          {showCitySelector && (
            <motion.div
              className="mt-3 p-4 bg-[#1a0033] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CityCombobox onSelect={handleCidadeSelect} placeholder="Digite o nome da cidade..." />
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
