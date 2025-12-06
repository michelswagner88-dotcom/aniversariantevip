import { Store, MapPin, Search, Building2, Rocket, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type EmptyStateType = 'cidade' | 'categoria' | 'busca' | 'geral';

interface EmptyStateProps {
  type?: EmptyStateType;
  cidade?: string;
  categoria?: string;
  termoBusca?: string;
  onAction?: () => void;
}

const configs = {
  cidade: {
    icon: Rocket,
    emoji: '🚀',
    getTitulo: (cidade?: string) => cidade ? `Ainda não chegamos em ${cidade}` : 'Estamos expandindo!',
    getSubtitulo: (cidade?: string) => 
      cidade 
        ? `Em breve teremos parceiros incríveis em ${cidade}. Fique de olho!`
        : 'Estamos trabalhando para trazer os melhores benefícios para sua região.',
    acao: 'Explorar outras cidades'
  },
  categoria: {
    icon: Building2,
    emoji: '🔍',
    getTitulo: (categoria?: string) => `Nenhum ${categoria?.toLowerCase() || 'estabelecimento'} encontrado`,
    getSubtitulo: (cidade?: string, categoria?: string) => 
      cidade 
        ? `Ainda não temos ${categoria?.toLowerCase()} em ${cidade}. Em breve!`
        : 'Tente outra categoria ou explore outras cidades.',
    acao: 'Ver todas as categorias'
  },
  busca: {
    icon: Search,
    emoji: '🤔',
    getTitulo: (termo?: string) => termo ? `Nenhum resultado para "${termo}"` : 'Nenhum resultado',
    getSubtitulo: () => 'Tente buscar com outras palavras ou explore as categorias.',
    acao: 'Limpar busca'
  },
  geral: {
    icon: Store,
    emoji: '🎂',
    getTitulo: () => 'Estamos chegando na sua região!',
    getSubtitulo: () => 'O maior guia de benefícios está sendo atualizado com os melhores lugares.',
    acao: 'Indicar um lugar'
  }
};

export const EmptyState = ({ 
  type = 'geral', 
  cidade, 
  categoria, 
  termoBusca,
  onAction 
}: EmptyStateProps) => {
  const navigate = useNavigate();
  const config = configs[type];
  const Icon = config.icon;

  // Gerar título e subtítulo dinamicamente
  const titulo = type === 'busca' 
    ? config.getTitulo(termoBusca) 
    : type === 'cidade' 
      ? config.getTitulo(cidade)
      : type === 'categoria'
        ? config.getTitulo(categoria)
        : config.getTitulo();
        
  const subtitulo = type === 'categoria' 
    ? config.getSubtitulo(cidade, categoria)
    : type === 'cidade'
      ? config.getSubtitulo(cidade)
      : config.getSubtitulo();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (type === 'geral') {
      navigate('/seja-parceiro');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 sm:py-20 px-6 text-center"
    >
      {/* Ícone com efeito glow */}
      <div className="relative mb-6 sm:mb-8">
        {/* Glow Effect */}
        <div className="absolute inset-0 blur-3xl opacity-20">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full" />
        </div>
        
        {/* Container do Ícone */}
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
          <Icon className="w-10 h-10 sm:w-16 sm:h-16 text-violet-400" strokeWidth={1.5} />
          
          {/* Emoji flutuante */}
          <span className="absolute -top-2 -right-2 text-2xl sm:text-3xl animate-bounce">
            {config.emoji}
          </span>
        </div>
      </div>

      {/* Título */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 font-plus-jakarta max-w-md">
        {titulo}
      </h2>

      {/* Subtítulo */}
      <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md leading-relaxed">
        {subtitulo}
      </p>

      {/* Botão de ação */}
      <Button
        onClick={handleAction}
        size="lg"
        className="group bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-violet-500/20 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold min-h-[44px] min-w-[44px]"
      >
        <span>{config.acao}</span>
        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      {/* Divider decorativo */}
      <div className="flex items-center gap-3 w-full max-w-xs my-6 sm:my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-white/10 to-transparent" />
        <MapPin className="w-4 h-4 text-violet-400" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-white/10 to-transparent" />
      </div>

      {/* Sugestão de indicar estabelecimento */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mb-2">
          Conhece um lugar que deveria estar aqui?
        </p>
        <button
          onClick={() => navigate('/seja-parceiro')}
          className="text-xs sm:text-sm font-medium text-violet-500 hover:text-violet-400 transition-colors underline-offset-2 hover:underline"
        >
          Indique um estabelecimento →
        </button>
      </div>
    </motion.div>
  );
};
