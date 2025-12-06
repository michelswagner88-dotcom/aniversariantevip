import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Gift, MapPin, Star } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { cn } from '@/lib/utils';
import { TiltCard } from '@/components/ui/tilt-card';

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

// Animação para títulos das seções
const titleVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
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
    <TiltCard 
      tiltAmount={6} 
      shadowAmount={12}
      className="group flex-shrink-0 w-[280px] md:w-[300px] cursor-pointer"
    >
      <article
        onClick={handleClick}
        className="transition-all duration-300"
      >
        {/* Container da imagem com glassmorphism */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-3 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-300 ring-1 ring-white/10 dark:ring-white/5 backdrop-blur-sm bg-white/5 dark:bg-slate-800/30">
        <SafeImage
          src={est.logo_url || est.galeria_fotos?.[0]}
          alt={est.nome_fantasia || 'Estabelecimento'}
          className="w-full h-full"
          enableParallax
        />
        
        {/* Badge de benefício com pulse e glow no hover */}
        {temBeneficio && (
          <div className="absolute top-3 left-3">
            <div className="relative flex items-center gap-1.5 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.5)] group-hover:ring-2 group-hover:ring-violet-400/50">
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-violet-400/20 animate-ping" />
              <Gift className="relative w-3 h-3 text-violet-600 animate-pulse" />
              <span className="relative text-[11px] font-semibold text-slate-900 dark:text-white">
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
    </TiltCard>
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Calcular número de dots e estado de scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const updateScrollState = () => {
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;
      const maxScroll = scrollWidth - clientWidth;
      
      // Atualizar capacidade de scroll
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < maxScroll - 10);
      
      // Calcular dots
      const dots = Math.ceil(maxScroll / 320) + 1;
      setTotalDots(Math.max(dots, 1));
      
      const index = Math.round(scrollLeft / 320);
      setActiveIndex(Math.min(index, dots - 1));
    };
    
    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    return () => container.removeEventListener('scroll', updateScrollState);
  }, [estabelecimentos]);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const maxScroll = scrollWidth - clientWidth;
    
    let scrollAmount = direction === 'left' ? -320 : 320;
    
    // Scroll infinito: volta ao início/fim
    if (direction === 'right' && scrollLeft >= maxScroll - 10) {
      // Chegou no final, volta ao início
      container.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    
    if (direction === 'left' && scrollLeft <= 10) {
      // Chegou no início, vai para o final
      container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      return;
    }
    
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: index * 320, behavior: 'smooth' });
    }
  };

  if (estabelecimentos.length === 0) return null;
  
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-50px" });
  
  return (
    <section className="relative group/section">
      {/* Header da seção com animação de entrada */}
      <motion.div 
        ref={titleRef}
        className="flex items-center justify-between mb-4"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={titleVariants}
      >
        <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        {onVerTodos && estabelecimentos.length > 4 && (
          <motion.button 
            onClick={onVerTodos}
            className="text-sm font-medium text-slate-900 dark:text-white underline underline-offset-4 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            Ver todos
          </motion.button>
        )}
      </motion.div>
      
      {/* Container do carrossel com fade nas bordas */}
      <div className="relative">
        {/* Fade esquerda */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-[5] pointer-events-none transition-opacity duration-300",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />
        
        {/* Fade direita */}
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-[5] pointer-events-none transition-opacity duration-300",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
        />
        
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
