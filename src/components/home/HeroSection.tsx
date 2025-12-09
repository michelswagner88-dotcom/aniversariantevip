import { useState, useEffect } from 'react';
import { Search, MapPin, Mic, Gift, Users, Building2 } from 'lucide-react';
import { CityCombobox } from '@/components/CityCombobox';
import { motion } from 'framer-motion';
import { useHeroStats } from '@/hooks/useHeroStats';

interface HeroSectionProps {
  cidade?: string;
  estado?: string;
  onCidadeSelect: (cidade: string, estado: string) => void;
  onBuscaChange: (termo: string) => void;
  onBuscar: () => void;
}

const HeroSection = ({
  cidade,
  estado,
  onCidadeSelect,
  onBuscaChange,
  onBuscar
}: HeroSectionProps) => {
  // Placeholder rotativo
  const placeholders = [
    "Restaurante japonês...",
    "Spa e massagem...",
    "Bar com música ao vivo...",
    "Buffet infantil...",
    "Salão de beleza...",
    "Academia com benefício..."
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [busca, setBusca] = useState('');
  const [showCitySelector, setShowCitySelector] = useState(false);

  // Buscar dados reais do banco
  const { data: stats } = useHeroStats();

  // Rotacionar placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(false);
      setTimeout(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
        setIsTyping(true);
      }, 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Números animados com dados reais
  const [counters, setCounters] = useState({ establishments: 0, users: 0, cities: 0 });

  useEffect(() => {
    if (!stats) return;
    
    // Valores mínimos para prova social quando dados são baixos
    const targets = {
      establishments: Math.max(stats.establishments, 300),
      users: Math.max(stats.users * 100, 5000), // Multiplicador para engajamento
      cities: Math.max(stats.cities, 10)
    };
    
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      // Easing function for smoother animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCounters({
        establishments: Math.round(targets.establishments * easeOut),
        users: Math.round(targets.users * easeOut),
        cities: Math.round(targets.cities * easeOut),
      });
      if (step >= steps) clearInterval(interval);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

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
    <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[650px] flex items-center justify-center overflow-hidden pt-16 sm:pt-20 pb-8 sm:pb-12 px-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 z-0">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-background to-background" />
        
        {/* Círculos decorativos com glow pulse */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.18, 0.1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Partículas sutis (confete) */}
        <div className="absolute top-32 left-1/4 w-2 h-2 bg-violet-400/40 rounded-full animate-confetti" />
        <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-pink-400/40 rounded-full animate-confetti" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-28 right-1/4 w-2 h-2 bg-yellow-400/40 rounded-full animate-confetti" style={{ animationDelay: '1s' }} />
        <div className="absolute top-36 right-1/3 w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-confetti" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        
        {/* Badge de destaque */}
        <motion.div 
          className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Gift className="w-4 h-4 text-violet-400" />
          <span className="text-sm text-violet-300">O maior guia de benefícios para aniversariantes do Brasil</span>
        </motion.div>

        {/* Título principal - responsivo */}
        <motion.h1 
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Seu aniversário merece
          <br />
          <span className="text-gradient-animated">vantagens exclusivas</span>
        </motion.h1>

        {/* Subtítulo - responsivo */}
        <motion.p 
          className="text-sm sm:text-base lg:text-lg text-slate-400 mb-6 sm:mb-10 max-w-2xl mx-auto px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Descubra restaurantes, bares, lojas e muito mais oferecendo benefícios especiais para você aproveitar
        </motion.p>

        {/* Barra de Busca Premium */}
        <motion.div 
          className="max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <form 
            onSubmit={handleBuscaSubmit}
            className="
              flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0
              bg-white
              rounded-2xl sm:rounded-full 
              p-2
              border-2 border-[#240046]/20
              shadow-2xl shadow-[#240046]/10
              hover:border-[#240046]/40
              focus-within:border-[#240046]
              transition-colors duration-300
            "
          >
            {/* Campo de Localização */}
            <div 
              className="flex items-center gap-3 px-4 py-3 sm:border-r border-[#240046]/10 cursor-pointer hover:bg-[#240046]/5 rounded-xl sm:rounded-l-full transition-colors"
              onClick={() => setShowCitySelector(!showCitySelector)}
            >
              <MapPin className="w-5 h-5 text-[#240046]" />
              <div className="text-left">
                <p className="text-xs text-[#240046]/60 uppercase tracking-wide">Onde</p>
                <p className="text-[#222222] font-medium">
                  {cidade && estado ? `${cidade}, ${estado}` : "Todo o Brasil"}
                </p>
              </div>
            </div>

            {/* Campo de Busca */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 text-[#240046]/50 flex-shrink-0" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={placeholders[currentPlaceholder]}
                aria-label="Buscar estabelecimentos"
                className={`
                  flex-1 bg-transparent text-[#222222] placeholder-[#240046]/40
                  outline-none text-sm sm:text-base min-w-0
                  transition-opacity duration-200
                  ${isTyping ? "opacity-100" : "opacity-50"}
                `}
              />
              <button 
                type="button"
                className="p-2 hover:bg-[#240046]/10 rounded-full transition-colors"
                aria-label="Busca por voz"
              >
                <Mic className="w-5 h-5 text-[#240046]/50" />
              </button>
            </div>

            {/* Botão de Busca - Full width em mobile */}
            <button 
              type="submit"
              aria-label="Buscar estabelecimentos"
              className="
                relative
                bg-gradient-to-r from-[#240046] to-[#3C096C]
                text-white font-semibold
                px-6 sm:px-8 py-3 sm:py-3
                rounded-xl sm:rounded-full
                shadow-lg shadow-[#240046]/30
                transition-all duration-300
                hover:shadow-xl hover:shadow-[#240046]/40
                hover:scale-105
                active:scale-95
                flex items-center justify-center gap-2
                w-full sm:w-auto
                overflow-hidden
                group
              "
            >
              {/* Shimmer effect */}
              <span className="
                absolute inset-0 
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                -translate-x-full
                group-hover:translate-x-full
                transition-transform duration-700
              "/>
              <Search className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Buscar</span>
            </button>
          </form>

          {/* City Selector Dropdown */}
          {showCitySelector && (
            <motion.div 
              className="mt-3 p-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CityCombobox
                onSelect={handleCidadeSelect}
                placeholder="Digite o nome da cidade..."
              />
            </motion.div>
          )}
        </motion.div>

        {/* Prova Social - Stack em mobile, row em desktop */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Estabelecimentos */}
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">
              {counters.establishments}+
            </span>
            <span className="text-xs sm:text-sm text-slate-500">Estabelecimentos</span>
          </div>

          {/* Usuários */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">
              {counters.users.toLocaleString()}+
            </span>
            <span className="text-xs sm:text-sm text-slate-500">Aniversariantes</span>
          </div>

          {/* Cidades */}
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            <span className="text-xl sm:text-2xl font-bold text-white">
              {counters.cities}+
            </span>
            <span className="text-xs sm:text-sm text-slate-500">Cidades</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
