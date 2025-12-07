import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight as ChevronRightIcon, Heart, Gift } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { SafeImage } from '@/components/SafeImage';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { cn } from '@/lib/utils';
import { TiltCard } from '@/components/ui/tilt-card';
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from '@/lib/photoUtils';
import { getCategoriaIcon } from '@/lib/constants';

interface CategoryCarouselProps {
  title: string;
  subtitle?: string;
  estabelecimentos: any[];
  linkHref?: string;
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
  
  // Badge de categoria + subcategoria
  const categoriaIcon = getCategoriaIcon(categoria);
  const subcategoria = est.especialidades?.[0];
  const categoryLabel = subcategoria || categoria || 'Estabelecimento';
  
  // Obter a melhor foto com fallback inteligente
  const fotoUrl = getFotoEstabelecimento(
    est.logo_url,
    null,
    est.galeria_fotos,
    est.categoria
  );
  const fallbackUrl = getPlaceholderPorCategoria(est.categoria);
  
  return (
    <TiltCard 
      tiltAmount={6} 
      shadowAmount={12}
      className="group flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[280px] md:w-[300px] cursor-pointer"
    >
      <article
        onClick={handleClick}
        className="h-full flex flex-col transition-all duration-300 active:scale-[0.98]"
      >
        {/* Container da imagem - PROPORÇÃO FIXA 4:3 - Foto domina o card */}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-slate-800 shadow-lg shadow-black/20 transition-all duration-300 ring-1 ring-white/5 group-hover:shadow-xl group-hover:shadow-violet-500/15">
          <SafeImage
            src={fotoUrl}
            alt={est.nome_fantasia || 'Estabelecimento'}
            fallbackSrc={fallbackUrl}
            className="w-full h-full object-cover object-center transition-transform duration-400 ease-out group-hover:scale-[1.08]"
            enableParallax
          />
          
          {/* Overlay gradient sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          
          {/* Badge de categoria + subcategoria - posição inferior esquerda */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
              <span className="text-sm">{categoriaIcon}</span>
              <span className="text-xs font-medium text-white truncate max-w-[100px]">
                {categoryLabel}
              </span>
            </div>
            
            {/* Badge de benefício */}
            {temBeneficio && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)]">
                <Gift className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-white hidden sm:inline">
                  Benefício
                </span>
              </div>
            )}
          </div>
          
          {/* Coração de favoritar - aparece no hover (desktop), sempre visível no mobile */}
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                       hover:bg-black/60 hover:scale-110 
                       transition-all duration-200"
          >
            <Heart className="w-[18px] h-[18px] text-white transition-colors hover:fill-white/50" />
          </button>
        </div>
      
        {/* Info do estabelecimento - Hierarquia clara */}
        <div className="pt-3 flex flex-col gap-1">
          {/* Nome - Hierarquia 1 (mais importante) */}
          <h3 className="font-semibold text-base sm:text-[16px] leading-snug text-slate-900 dark:text-white truncate transition-colors duration-200 group-hover:text-violet-600 dark:group-hover:text-violet-400">
            {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
          </h3>
          
          {/* Bairro - Hierarquia 2 (secundário) */}
          <p className="text-sm text-muted-foreground truncate">
            {est.bairro || est.cidade}
          </p>
        </div>
      </article>
    </TiltCard>
  );
};

export const CategoryCarousel = ({
  title,
  subtitle,
  estabelecimentos,
  linkHref,
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
      {/* Header da seção com storytelling e link animado */}
      <motion.div 
        ref={titleRef}
        className="flex items-center justify-between mb-6 md:mb-8"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={titleVariants}
      >
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {(linkHref || onVerTodos) && estabelecimentos.length > 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            {linkHref ? (
              <Link 
                to={linkHref}
                className="group/link flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver todos
                <ChevronRightIcon 
                  size={16} 
                  className="transition-transform group-hover/link:translate-x-1" 
                />
              </Link>
            ) : onVerTodos ? (
              <button 
                onClick={onVerTodos}
                className="group/link flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver todos
                <ChevronRightIcon 
                  size={16} 
                  className="transition-transform group-hover/link:translate-x-1" 
                />
              </button>
            ) : null}
          </motion.div>
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
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-4 -mx-4"
          style={{ 
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {estabelecimentos.map((est, index) => (
            <motion.div 
              key={est.id} 
              style={{ 
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always'
              }}
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
          <ChevronRightIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
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
