import { useState, useEffect } from 'react';
import { Search, MapPin, Mic, Gift, Users, Building2 } from 'lucide-react';
import { CityCombobox } from '@/components/CityCombobox';
import { motion } from 'framer-motion';

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

  // Números animados (contador)
  const [counters, setCounters] = useState({ establishments: 0, users: 0, cities: 0 });

  useEffect(() => {
    const targets = { establishments: 500, users: 10000, cities: 15 };
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounters({
        establishments: Math.round(targets.establishments * progress),
        users: Math.round(targets.users * progress),
        cities: Math.round(targets.cities * progress),
      });
      if (step >= steps) clearInterval(interval);
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

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
    <section className="relative min-h-[600px] md:min-h-[650px] flex items-center justify-center overflow-hidden pt-20 pb-12">
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

        {/* Título principal */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Seu aniversário merece
          <br />
          <span className="text-gradient-animated">vantagens exclusivas</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p 
          className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Descubra restaurantes, bares, spas e muito mais oferecendo benefícios especiais no seu dia
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
              bg-white/5 
              backdrop-blur-xl 
              rounded-2xl sm:rounded-full 
              p-2
              border border-white/10
              shadow-2xl shadow-violet-500/10
            "
          >
            {/* Campo de Localização */}
            <div 
              className="flex items-center gap-3 px-4 py-3 sm:border-r border-white/10 cursor-pointer hover:bg-white/5 rounded-xl sm:rounded-l-full transition-colors"
              onClick={() => setShowCitySelector(!showCitySelector)}
            >
              <MapPin className="w-5 h-5 text-pink-400" />
              <div className="text-left">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Onde</p>
                <p className="text-white font-medium">
                  {cidade && estado ? `${cidade}, ${estado}` : 'Todo o Brasil'}
                </p>
              </div>
            </div>

            {/* Campo de Busca */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={placeholders[currentPlaceholder]}
                className={`
                  flex-1 bg-transparent text-white placeholder-slate-500
                  outline-none text-base
                  transition-opacity duration-200
                  ${isTyping ? 'opacity-100' : 'opacity-50'}
                `}
              />
              <button 
                type="button"
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Busca por voz"
              >
                <Mic className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Botão de Busca */}
            <button 
              type="submit"
              className="
                relative
                bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500
                text-white font-semibold
                px-8 py-4 sm:py-3
                rounded-xl sm:rounded-full
                shadow-lg shadow-violet-500/30
                transition-all duration-300
                hover:shadow-xl hover:shadow-violet-500/40
                hover:scale-105
                active:scale-95
                flex items-center justify-center gap-2
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

        {/* Prova Social - Números */}
        <motion.div 
          className="flex flex-wrap justify-center gap-8 sm:gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Estabelecimentos */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-violet-400" />
              <span className="text-3xl sm:text-4xl font-bold text-white counter-glow animate-count-pulse">
                {counters.establishments}+
              </span>
            </div>
            <p className="text-sm text-slate-500">Estabelecimentos</p>
          </div>

          {/* Usuários */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-5 h-5 text-pink-400" />
              <span className="text-3xl sm:text-4xl font-bold text-white counter-glow animate-count-pulse">
                {counters.users.toLocaleString()}+
              </span>
            </div>
            <p className="text-sm text-slate-500">Aniversariantes</p>
          </div>

          {/* Cidades */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span className="text-3xl sm:text-4xl font-bold text-white counter-glow animate-count-pulse">
                {counters.cities}+
              </span>
            </div>
            <p className="text-sm text-slate-500">Cidades</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
