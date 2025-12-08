import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight as ChevronRightIcon, Heart, Gift, ArrowRight } from 'lucide-react';
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
  variant?: 'default' | 'featured' | 'compact';
  showViewMoreCard?: boolean;
}

// Variantes de animação
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
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

// Card individual compacto para carrossel - Design LIMPO estilo Airbnb
const CarouselCard = ({ estabelecimento }: { estabelecimento: any }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
  
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
      className="group w-full cursor-pointer"
    >
      <article
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-full flex flex-col transition-all duration-300 active:scale-[0.98]"
      >
        {/* Container da imagem - PROPORÇÃO FIXA 4:3 */}
        <div className={cn(
          "relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-slate-800 transition-all duration-500",
          "shadow-lg shadow-black/20 ring-1 ring-white/5",
          isHovered && "shadow-xl shadow-violet-500/20 ring-violet-500/30"
        )}>
          <SafeImage
            src={fotoUrl}
            alt={est.nome_fantasia || 'Estabelecimento'}
            fallbackSrc={fallbackUrl}
            className={cn(
              "w-full h-full object-cover object-center transition-transform duration-700 ease-out",
              isHovered && "scale-110"
            )}
            enableParallax
          />
          
          {/* Overlay gradient premium */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          
          {/* Vinheta sutil */}
          <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)] pointer-events-none" />
          
          {/* Badge de categoria - ÚNICO badge, canto inferior esquerdo */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
              <span>{categoriaIcon}</span>
              {categoryLabel}
            </span>
          </div>
          
          {/* Botão favoritar - topo direito */}
          <button 
            onClick={handleFavorite}
            className={cn(
              "absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md border transition-all duration-300",
              isFavorited 
                ? "bg-pink-500/90 border-pink-400/50 shadow-lg shadow-pink-500/30" 
                : "bg-black/40 border-white/10 hover:bg-black/60 hover:border-white/20",
              isHovered && "scale-110"
            )}
          >
            <Heart className={cn(
              "w-4 h-4 transition-all duration-300",
              isFavorited ? "text-white fill-white" : "text-white"
            )} />
          </button>

        </div>
      
        {/* Info do estabelecimento */}
        <div className="pt-3 flex flex-col gap-1">
          {/* Nome */}
          <h3 className={cn(
            "font-semibold text-base sm:text-[16px] leading-snug truncate transition-colors duration-300",
            isHovered ? "text-violet-600 dark:text-violet-400" : "text-slate-900 dark:text-white"
          )}>
            {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
          </h3>
          
          {/* Bairro */}
          <p className="text-sm text-muted-foreground truncate">
            {est.bairro || est.cidade}
          </p>
        </div>
      </article>
    </TiltCard>
  );
};

// Card "Ver mais" no final do carrossel
const ViewMoreCard = ({ linkHref }: { linkHref: string }) => (
  <Link 
    to={linkHref}
    className="
      flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[280px] md:w-[300px]
      aspect-[4/3]
      bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-violet-500/10
      hover:from-violet-500/20 hover:via-fuchsia-500/10 hover:to-violet-500/20
      border border-violet-500/20
      hover:border-violet-500/40
      rounded-xl
      flex flex-col items-center justify-center
      gap-4
      transition-all duration-300
      hover:scale-[1.02]
      hover:shadow-xl hover:shadow-violet-500/10
      group
    "
  >
    <div className="
      w-16 h-16
      bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20
      rounded-2xl
      flex items-center justify-center
      transition-all duration-300
      group-hover:scale-110
      group-hover:rotate-3
    ">
      <ArrowRight className="w-8 h-8 text-violet-400" />
    </div>
    <div className="text-center">
      <p className="text-violet-300 font-semibold">Ver todos</p>
      <p className="text-muted-foreground text-sm">Explorar categoria</p>
    </div>
  </Link>
);

export const CategoryCarousel = ({
  title,
  subtitle,
  estabelecimentos,
  linkHref,
  onVerTodos,
  variant = 'default',
  showViewMoreCard = true
}: CategoryCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalDots, setTotalDots] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Definir tamanho dos cards baseado na variante
  const cardWidthClass = variant === 'featured' 
    ? 'w-[calc(100vw-2rem)] sm:w-[320px] md:w-[350px]' 
    : variant === 'compact'
    ? 'w-[calc(100vw-4rem)] sm:w-[240px] md:w-[260px]'
    : 'w-[calc(100vw-3rem)] sm:w-[280px] md:w-[300px]';
  
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
      
      // Calcular dots baseado na largura real do card
      const firstCard = container.querySelector(':scope > div') as HTMLElement;
      const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 316;
      
      const dots = Math.ceil(maxScroll / cardWidth) + 1;
      setTotalDots(Math.max(dots, 1));
      
      const index = Math.round(scrollLeft / cardWidth);
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
    
    // Pegar largura real do primeiro card + gap
    const firstCard = container.querySelector(':scope > div') as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 316;
    
    let scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    
    // Scroll infinito: volta ao início/fim
    if (direction === 'right' && scrollLeft >= maxScroll - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    
    if (direction === 'left' && scrollLeft <= 10) {
      container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      return;
    }
    
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const firstCard = container.querySelector(':scope > div') as HTMLElement;
    const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 316;
    container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
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
          aria-label="Anterior"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10",
            "w-12 h-12 bg-background/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full",
            "shadow-lg border border-border flex items-center justify-center",
            "transition-all duration-300 hover:scale-110 hover:border-violet-500/30 active:scale-95",
            "opacity-0 group-hover/section:opacity-100",
            !canScrollLeft && "!opacity-40"
          )}
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
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
              className={cn("flex-shrink-0", cardWidthClass)}
              style={{ 
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always'
              }}
              custom={index}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={cardVariants}
            >
              <CarouselCard estabelecimento={est} />
            </motion.div>
          ))}

          {/* Card "Ver mais" no final */}
          {showViewMoreCard && linkHref && estabelecimentos.length >= 4 && (
            <motion.div
              className={cn("flex-shrink-0", cardWidthClass)}
              custom={estabelecimentos.length}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={cardVariants}
              style={{ scrollSnapAlign: 'start' }}
            >
              <ViewMoreCard linkHref={linkHref} />
            </motion.div>
          )}
        </div>
        
        {/* Botão direita */}
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10",
            "w-12 h-12 bg-background/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full",
            "shadow-lg border border-border flex items-center justify-center",
            "transition-all duration-300 hover:scale-110 hover:border-violet-500/30 active:scale-95",
            "opacity-0 group-hover/section:opacity-100",
            !canScrollRight && "!opacity-40"
          )}
        >
          <ChevronRightIcon className="w-5 h-5 text-foreground" />
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

      {/* Link "Ver todos" mobile */}
      {linkHref && (
        <Link 
          to={linkHref}
          className="
            sm:hidden
            flex items-center justify-center gap-2
            mt-4
            py-3
            text-violet-500 
            hover:text-violet-400
            transition-colors
            font-medium
          "
        >
          <span>Ver todos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </section>
  );
};