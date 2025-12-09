import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight as ChevronRightIcon, Heart } from "lucide-react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { cn } from "@/lib/utils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";
import { CATEGORIAS } from "@/constants/categories";

interface CategoryCarouselProps {
  title: string;
  subtitle?: string;
  estabelecimentos: any[];
  variant?: "default" | "featured" | "compact";
  sectionId?: string;
  onUserInteraction?: (sectionId: string) => void;
}

// Função para converter categoria para singular
const getCategoriaLabel = (categoria: string): string => {
  if (!categoria) return "Estabelecimento";

  const cat = CATEGORIAS.find(
    (c) =>
      c.label.toLowerCase() === categoria.toLowerCase() ||
      c.plural.toLowerCase() === categoria.toLowerCase() ||
      c.id === categoria.toLowerCase(),
  );

  return cat?.label || categoria;
};

// Card individual - Estilo Airbnb LIMPO
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
      id: est.id,
    });
    navigate(url);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const categoriaRaw = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
  const categoria = getCategoriaLabel(categoriaRaw);
  const temBeneficio = !!est.descricao_beneficio;

  const fotoUrl = getFotoEstabelecimento(est.logo_url, null, est.galeria_fotos, est.categoria);
  const fallbackUrl = getPlaceholderPorCategoria(est.categoria);

  return (
    <article onClick={handleClick} className="group cursor-pointer w-full">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img
          src={fotoUrl || fallbackUrl}
          alt={est.nome_fantasia || "Estabelecimento"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackUrl) {
              target.src = fallbackUrl;
            }
          }}
        />

        <button
          onClick={handleFavorite}
          aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute top-3 right-3 z-10"
        >
          <Heart
            className={cn(
              "w-6 h-6 drop-shadow-md hover:scale-110 transition-transform",
              isFavorited ? "text-red-500 fill-red-500" : "text-white",
              isAnimating && "animate-[heart-pop_0.4s_ease]",
            )}
            strokeWidth={1.5}
          />
        </button>
      </div>

      <div className="space-y-0.5">
        <h3 className="font-semibold text-[15px] text-[#240046] truncate">
          {est.nome_fantasia || est.razao_social || "Estabelecimento"}
        </h3>

        <p className="text-[15px] text-[#3C096C] truncate">{est.bairro || est.cidade}</p>

        <p className="text-[15px] text-[#3C096C]">{categoria}</p>

        {temBeneficio && (
          <p className="text-[15px] text-[#3C096C] mt-1">
            <span className="font-semibold text-[#240046]">🎁 Benefício</span> no aniversário
          </p>
        )}
      </div>
    </article>
  );
};

export const CategoryCarousel = ({
  title,
  subtitle,
  estabelecimentos,
  variant = "default",
  sectionId,
  onUserInteraction,
}: CategoryCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(4);

  // Notifica interação do usuário
  const notifyInteraction = useCallback(() => {
    if (sectionId && onUserInteraction) {
      onUserInteraction(sectionId);
    }
  }, [sectionId, onUserInteraction]);

  // Calcular quantos cards cabem por página baseado na largura da tela
  useEffect(() => {
    const calculateCardsPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCardsPerPage(1);
      } else if (width < 768) {
        setCardsPerPage(2);
      } else if (width < 1024) {
        setCardsPerPage(3);
      } else if (width < 1280) {
        setCardsPerPage(4);
      } else if (width < 1536) {
        setCardsPerPage(5);
      } else {
        setCardsPerPage(6);
      }
    };

    // Debounce para evitar recálculos excessivos durante resize
    let timeoutId: NodeJS.Timeout;
    const debouncedCalculate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateCardsPerPage, 150);
    };

    // Calcular imediatamente no mount
    calculateCardsPerPage();

    window.addEventListener("resize", debouncedCalculate);
    return () => {
      window.removeEventListener("resize", debouncedCalculate);
      clearTimeout(timeoutId);
    };
  }, []);

  // Reset página quando muda quantidade de cards por página
  useEffect(() => {
    setCurrentPage(0);
  }, [cardsPerPage]);

  // Total de páginas
  const totalPages = Math.ceil(estabelecimentos.length / cardsPerPage);

  // Cards da página atual
  const startIndex = currentPage * cardsPerPage;
  const visibleCards = estabelecimentos.slice(startIndex, startIndex + cardsPerPage);

  // Navegação
  const canScrollLeft = currentPage > 0;
  const canScrollRight = currentPage < totalPages - 1;

  const scroll = useCallback(
    (direction: "left" | "right") => {
      // Notifica que usuário interagiu - TRAVA ROTAÇÃO
      notifyInteraction();

      setCurrentPage((prev) => {
        if (direction === "right") {
          return prev < totalPages - 1 ? prev + 1 : 0;
        } else {
          return prev > 0 ? prev - 1 : totalPages - 1;
        }
      });
    },
    [notifyInteraction, totalPages],
  );

  // Clique nos dots também notifica interação
  const goToPage = useCallback(
    (page: number) => {
      notifyInteraction();
      setCurrentPage(page);
    },
    [notifyInteraction],
  );

  if (estabelecimentos.length === 0) return null;

  return (
    <section className="relative">
      {/* Header da seção */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#240046]">{title}</h2>
          {subtitle && <p className="text-sm text-[#3C096C] mt-0.5">{subtitle}</p>}
        </div>

        {/* Indicador de página */}
        {totalPages > 1 && (
          <div className="text-sm text-[#3C096C]">
            {currentPage + 1} / {totalPages}
          </div>
        )}
      </div>

      {/* Container do carrossel */}
      <div className="relative" ref={containerRef}>
        {/* Botão esquerda */}
        <button
          onClick={() => scroll("left")}
          aria-label="Anterior"
          className={cn(
            "absolute -left-4 top-1/3 -translate-y-1/2 z-10",
            "w-10 h-10 bg-white rounded-full",
            "shadow-lg border border-[#DDDDDD] flex items-center justify-center",
            "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
            !canScrollLeft && "opacity-40 cursor-not-allowed hover:scale-100",
          )}
        >
          <ChevronLeft className="w-5 h-5 text-[#240046]" />
        </button>

        {/* Grid de Cards */}
        <div
          className={cn(
            "grid gap-6 transition-opacity duration-300",
            cardsPerPage === 1 && "grid-cols-1",
            cardsPerPage === 2 && "grid-cols-2",
            cardsPerPage === 3 && "grid-cols-3",
            cardsPerPage === 4 && "grid-cols-4",
            cardsPerPage === 5 && "grid-cols-5",
            cardsPerPage === 6 && "grid-cols-6",
          )}
        >
          {visibleCards.map((est) => (
            <div key={est.id}>
              <CarouselCard estabelecimento={est} />
            </div>
          ))}
        </div>

        {/* Botão direita */}
        <button
          onClick={() => scroll("right")}
          aria-label="Próximo"
          className={cn(
            "absolute -right-4 top-1/3 -translate-y-1/2 z-10",
            "w-10 h-10 bg-white rounded-full",
            "shadow-lg border border-[#DDDDDD] flex items-center justify-center",
            "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
            !canScrollRight && "opacity-40 cursor-not-allowed hover:scale-100",
          )}
        >
          <ChevronRightIcon className="w-5 h-5 text-[#240046]" />
        </button>
      </div>

      {/* Dots indicadores */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`Ir para página ${i + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentPage === i ? "bg-[#240046] w-4" : "bg-[#DDDDDD] hover:bg-[#3C096C]",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
};
