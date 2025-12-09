import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight as ChevronRightIcon, Heart, ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';
import { cn } from '@/lib/utils';
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from '@/lib/photoUtils';

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

// Card individual - Estilo Airbnb LIMPO (sem box/sombra/borda)
const CarouselCard = ({ estabelecimento }: { estabelecimento: any }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
  const temBeneficio = !!est.descricao_beneficio;
  
  // Obter a melhor foto com fallback inteligente
  const fotoUrl = getFotoEstabelecimento(
    est.logo_url,
    null,
    est.galeria_fotos,
    est.categoria
  );
  const fallbackUrl = getPlaceholderPorCategoria(est.categoria);
  
  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer w-full"
    >
      {/* IMAGEM - apenas rounded, com favorito */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img 
          src={fotoUrl || fallbackUrl}
          alt={est.nome_fantasia || 'Estabelecimento'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackUrl) {
              target.src = fallbackUrl;
            }
          }}
        />
        
        {/* Botão favorito - canto superior direito */}
        <button 
          onClick={handleFavorite}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="absolute top-3 right-3 z-10"
        >
          <Heart 
            className={cn(
              "w-6 h-6 drop-shadow-md hover:scale-110 transition-transform",
              isFavorited 
                ? "text-red-500 fill-red-500" 
                : "text-white",
              isAnimating && "animate-[heart-pop_0.4s_ease]"
            )} 
            strokeWidth={1.5}
          />
        </button>
      </div>
      
      {/* TEXTO - solto no fundo branco, SEM box */}
      <div className="space-y-0.5">
        {/* Linha 1: Nome */}
        <h3 className="font-semibold text-[15px] text-[#222222] truncate">
          {est.nome_fantasia || est.razao_social || 'Estabelecimento'}
        </h3>
        
        {/* Linha 2: Bairro */}
        <p className="text-[15px] text-[#717171] truncate">
          {est.bairro || est.cidade}
        </p>
        
        {/* Linha 3: Categoria */}
        <p className="text-[15px] text-[#717171]">
          {categoria || 'Estabelecimento'}
        </p>
        
        {/* Linha 4: Benefício (destaque) */}
        {temBeneficio && (
          <p className="text-[15px] text-[#222222] mt-1">
            <span className="font-semibold">🎁 Benefício</span> no aniversário
          </p>
        )}
      </div>
    </article>
  );
};

// Card "Ver mais" no final do carrossel - Estilo Airbnb
const ViewMoreCard = ({ linkHref }: { linkHref: string }) => (
  <Link 
    to={linkHref}
    className="
      flex-shrink-0 w-full
      aspect-square
      bg-gray-100
      hover:bg-gray-200
      rounded-xl
      flex flex-col items-center justify-center
      gap-4
      transition-all duration-300
      group
    "
  >
    <div className="
      w-16 h-16
      bg-white
      rounded-full
      flex items-center justify-center
      transition-all duration-300
      group-hover:scale-110
      shadow-md
    ">
      <ArrowRight className="w-8 h-8 text-[#222222]" />
    </div>
    <div className="text-center">
      <p className="text-[#222222] font-semibold text-[15px]">Ver todos</p>
      <p className="text-[#717171] text-sm">Explorar categoria</p>
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
    ? 'w-[calc(100vw-2rem)] sm:w-[280px] md:w-[300px]' 
    : variant === 'compact'
    ? 'w-[calc(100vw-4rem)] sm:w-[220px] md:w-[240px]'
    : 'w-[calc(100vw-3rem)] sm:w-[260px] md:w-[280px]';
  
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
      const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 304;
      
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
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 304;
    
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
    const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 304;
    container.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
  };

  if (estabelecimentos.length === 0) return null;
  
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, margin: "-50px" });
  
  return (
    <section className="relative group/section">
      {/* Header da seção - Estilo Airbnb */}
      <motion.div 
        ref={titleRef}
        className="flex items-center justify-between mb-4"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={titleVariants}
      >
        <div>
          <h2 className="text-[22px] font-semibold text-[#222222]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[#717171] mt-0.5">{subtitle}</p>
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
                className="group/link flex items-center gap-1 text-sm font-semibold text-[#222222] hover:underline"
              >
                Ver todos
                <span className="transition-transform group-hover/link:translate-x-1">›</span>
              </Link>
            ) : onVerTodos ? (
              <button 
                onClick={onVerTodos}
                className="group/link flex items-center gap-1 text-sm font-semibold text-[#222222] hover:underline"
              >
                Ver todos
                <span className="transition-transform group-hover/link:translate-x-1">›</span>
              </button>
            ) : null}
          </motion.div>
        )}
      </motion.div>
      
      {/* Container do carrossel */}
      <div className="relative">
        {/* Botão esquerda - Estilo Airbnb */}
        <button
          onClick={() => scroll('left')}
          aria-label="Anterior"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10",
            "w-8 h-8 bg-white rounded-full",
            "shadow-md border border-[#DDDDDD] flex items-center justify-center",
            "transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95",
            "opacity-0 group-hover/section:opacity-100",
            !canScrollLeft && "!opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="w-4 h-4 text-[#222222]" />
        </button>
        
        {/* Carrossel */}
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
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
        
        {/* Botão direita - Estilo Airbnb */}
        <button
          onClick={() => scroll('right')}
          aria-label="Próximo"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10",
            "w-8 h-8 bg-white rounded-full",
            "shadow-md border border-[#DDDDDD] flex items-center justify-center",
            "transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95",
            "opacity-0 group-hover/section:opacity-100",
            !canScrollRight && "!opacity-0 pointer-events-none"
          )}
        >
          <ChevronRightIcon className="w-4 h-4 text-[#222222]" />
        </button>
      </div>
      
      {/* Indicadores de progresso (dots) - Estilo Airbnb */}
      {totalDots > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: Math.min(totalDots, 5) }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                activeIndex === i 
                  ? 'bg-[#222222] dark:bg-white w-4' 
                  : 'bg-[#DDDDDD] dark:bg-gray-600 hover:bg-[#717171]'
              )}
            />
          ))}
          {totalDots > 5 && (
            <span className="text-xs text-[#717171] ml-1">+{totalDots - 5}</span>
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
            text-[#222222] dark:text-white
            hover:underline
            transition-colors
            font-semibold
            text-sm
          "
        >
          <span>Ver todos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </section>
  );
};
