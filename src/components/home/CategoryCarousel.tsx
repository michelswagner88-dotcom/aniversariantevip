import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Gift, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { cn } from '@/lib/utils';

interface CategoryCarouselProps {
  title: string;
  estabelecimentos: any[];
  onVerTodos?: () => void;
}

// Variantes de animação
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut" as const
    }
  })
};

// Card individual compacto para carrossel
const CarouselCard = ({ estabelecimento }: { estabelecimento: any }) => {
  const navigate = useNavigate();
  const est = estabelecimento;
  
  const handleClick = () => {
    const url = getEstabelecimentoUrl({
      estado: est.estado,
      cidade: est.cidade,
      slug: est.slug,
      id: est.id
    });
    navigate(url);
  };

  const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
  const temBeneficio = !!est.descricao_beneficio;
  
  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer flex-shrink-0 w-[280px] md:w-[300px] transition-all duration-200 hover:scale-[1.02]"
    >
      {/* Container da imagem */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3 shadow-sm group-hover:shadow-lg group-hover:shadow-violet-500/10 transition-shadow">
        <SafeImage
          src={est.logo_url || est.galeria_fotos?.[0]}
          alt={est.nome_fantasia || 'Estabelecimento'}
          className="w-full h-full"
          enableParallax
        />
        
        {/* Badge de benefício */}
        {temBeneficio && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 rounded-full shadow-md backdrop-blur-sm">
              <Gift className="w-3 h-3 text-violet-600" />
              <span className="text-[11px] font-semibold text-slate-900 dark:text-white">
                Benefício
              </span>
            </div>
          </div>
        )}
        
        {/* Coração de favoritar */}
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-3 right-3 p-1.5 hover:scale-110 transition-transform"
        >
          <Heart className="w-5 h-5 text-white drop-shadow-md hover:fill-white/50 transition-colors" />
        </button>
      </div>
      
      {/* Info do estabelecimento */}
      <div className="space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">
            {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="w-3 h-3 fill-slate-900 dark:fill-white text-slate-900 dark:text-white" />
            <span className="text-xs text-slate-900 dark:text-white">Novo</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <MapPin className="w-3 h-3" />
          <span className="text-xs line-clamp-1">
            {est.bairro || est.cidade}
          </span>
        </div>
        
        {temBeneficio && (
          <p className="text-xs font-medium text-violet-600 dark:text-violet-400 line-clamp-1">
            {est.descricao_beneficio}
          </p>
        )}
      </div>
    </article>
  );
};

export const CategoryCarousel = ({
  title,
  estabelecimentos,
  onVerTodos
}: CategoryCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalDots, setTotalDots] = useState(1);
  
  // Calcular número de dots baseado no scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const updateDots = () => {
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      const dots = Math.ceil(maxScroll / 320) + 1;
      setTotalDots(Math.max(dots, 1));
      
      const scrollLeft = container.scrollLeft;
      const index = Math.round(scrollLeft / 320);
      setActiveIndex(Math.min(index, dots - 1));
    };
    
    updateDots();
    container.addEventListener('scroll', updateDots);
    return () => container.removeEventListener('scroll', updateDots);
  }, [estabelecimentos]);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: index * 320, behavior: 'smooth' });
    }
  };

  if (estabelecimentos.length === 0) return null;
  
  return (
    <section className="relative group/section">
      {/* Header da seção */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        {onVerTodos && estabelecimentos.length > 4 && (
          <button 
            onClick={onVerTodos}
            className="text-sm font-medium text-slate-900 dark:text-white underline underline-offset-4 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Ver todos
          </button>
        )}
      </div>
      
      {/* Container do carrossel */}
      <div className="relative">
        {/* Botão esquerda */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity hover:scale-105 -translate-x-1/2"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        
        {/* Carrossel */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {estabelecimentos.map((est, index) => (
            <motion.div 
              key={est.id} 
              style={{ scrollSnapAlign: 'start' }}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <CarouselCard estabelecimento={est} />
            </motion.div>
          ))}
        </div>
        
        {/* Botão direita */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-opacity hover:scale-105 translate-x-1/2"
        >
          <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>
      
      {/* Indicadores de progresso (dots) */}
      {totalDots > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: Math.min(totalDots, 5) }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                activeIndex === i 
                  ? 'bg-violet-500 w-4' 
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
              )}
            />
          ))}
          {totalDots > 5 && (
            <span className="text-xs text-slate-400 ml-1">+{totalDots - 5}</span>
          )}
        </div>
      )}
    </section>
  );
};
