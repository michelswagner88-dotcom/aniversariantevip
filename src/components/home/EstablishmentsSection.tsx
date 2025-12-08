import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EstablishmentCard from '../EstablishmentCard';

interface Establishment {
  id: string;
  slug?: string;
  nome_fantasia?: string;
  logo_url?: string;
  galeria_fotos?: string[];
  categoria?: string[];
  especialidades?: string[];
  bairro?: string;
  cidade?: string;
  descricao_beneficio?: string;
  created_at?: string;
}

interface EstablishmentsSectionProps {
  title: string;
  subtitle?: string;
  establishments: Establishment[];
  viewAllLink?: string;
  variant?: 'default' | 'featured' | 'compact';
  showViewMoreCard?: boolean;
}

const EstablishmentsSection = ({ 
  title, 
  subtitle, 
  establishments,
  viewAllLink,
  variant = 'default',
  showViewMoreCard = true
}: EstablishmentsSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Check scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [establishments]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = variant === 'featured' ? 350 : 300;
      const scrollAmount = cardWidth + 16;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  // Definir tamanho dos cards baseado na variante
  const cardWidth = variant === 'featured' 
    ? 'w-[300px] sm:w-[350px]' 
    : variant === 'compact'
    ? 'w-[220px] sm:w-[260px]'
    : 'w-[260px] sm:w-[300px]';

  if (!establishments || establishments.length === 0) {
    return null;
  }

  return (
    <section 
      ref={sectionRef}
      className={`
        py-8
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      <div className="container mx-auto px-4">
        {/* Header da seção */}
        <div className="flex items-end justify-between mb-6">
          <div className="max-w-lg">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>
            )}
          </div>
          
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="
                hidden sm:flex items-center gap-1.5
                text-primary 
                hover:text-primary/80
                transition-all duration-300
                group
                font-medium
              "
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Carrossel */}
        <div className="relative group/carousel">
          
          {/* Botão Esquerda */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 z-20
              w-12 h-12
              bg-background/90
              backdrop-blur-md
              rounded-full
              flex items-center justify-center
              border border-border
              transition-all duration-300
              hover:bg-background hover:scale-110 hover:border-primary/30
              active:scale-95
              -translate-x-1/2
              shadow-lg
              ${canScrollLeft 
                ? 'opacity-0 group-hover/carousel:opacity-100' 
                : 'opacity-0 pointer-events-none'
              }
            `}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>

          {/* Container dos Cards */}
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="
              flex gap-4 
              overflow-x-auto 
              scrollbar-hide
              pb-4 -mb-4
              scroll-smooth
            "
          >
            {establishments.map((establishment, index) => {
              // Verificar se é novo (criado nos últimos 7 dias)
              const isNew = establishment.created_at 
                ? (Date.now() - new Date(establishment.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000
                : false;

              return (
                <div 
                  key={establishment.id || index}
                  className={`flex-shrink-0 ${cardWidth}`}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.5s ease-out ${index * 0.08}s`
                  }}
                >
                  <EstablishmentCard 
                    establishment={{
                      id: establishment.id,
                      slug: establishment.slug || establishment.id,
                      name: establishment.nome_fantasia || 'Estabelecimento',
                      photo_url: establishment.galeria_fotos?.[0] || establishment.logo_url || '',
                      category: establishment.categoria?.[0] || '',
                      subcategory: establishment.especialidades?.[0],
                      bairro: establishment.bairro || '',
                      cidade: establishment.cidade,
                      benefit_description: establishment.descricao_beneficio,
                      is_new: isNew,
                      is_popular: index < 3 && variant === 'featured',
                    }}
                    index={index}
                  />
                </div>
              );
            })}
            
            {/* Card "Ver mais" no final */}
            {showViewMoreCard && viewAllLink && (
              <Link 
                to={viewAllLink}
                className={`
                  flex-shrink-0 ${cardWidth}
                  aspect-[4/3]
                  bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10
                  hover:from-primary/20 hover:via-accent/10 hover:to-primary/20
                  border border-primary/20
                  hover:border-primary/40
                  rounded-2xl
                  flex flex-col items-center justify-center
                  gap-4
                  transition-all duration-300
                  hover:scale-[1.02]
                  hover:shadow-xl hover:shadow-primary/10
                  group
                `}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease-out ${establishments.length * 0.08}s`
                }}
              >
                <div className="
                  w-16 h-16
                  bg-gradient-to-br from-primary/20 to-accent/20
                  rounded-2xl
                  flex items-center justify-center
                  transition-all duration-300
                  group-hover:scale-110
                  group-hover:rotate-3
                ">
                  <ArrowRight className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-primary font-semibold">Ver todos</p>
                  <p className="text-muted-foreground text-sm">Explorar categoria</p>
                </div>
              </Link>
            )}
          </div>

          {/* Botão Direita */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 z-20
              w-12 h-12
              bg-background/90
              backdrop-blur-md
              rounded-full
              flex items-center justify-center
              border border-border
              transition-all duration-300
              hover:bg-background hover:scale-110 hover:border-primary/30
              active:scale-95
              translate-x-1/2
              shadow-lg
              ${canScrollRight 
                ? 'opacity-0 group-hover/carousel:opacity-100' 
                : 'opacity-0 pointer-events-none'
              }
            `}
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>

          {/* Gradiente de fade nas bordas */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>

        {/* Link "Ver todos" mobile */}
        {viewAllLink && (
          <Link 
            to={viewAllLink}
            className="
              sm:hidden
              flex items-center justify-center gap-2
              mt-4
              py-3
              text-primary 
              hover:text-primary/80
              transition-colors
              font-medium
            "
          >
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </section>
  );
};

export default EstablishmentsSection;
