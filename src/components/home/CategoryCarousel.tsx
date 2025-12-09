import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight as ChevronRightIcon, Heart } from "lucide-react";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";
import { cn } from "@/lib/utils";
import { getFotoEstabelecimento, getPlaceholderPorCategoria } from "@/lib/photoUtils";

interface CategoryCarouselProps {
  title: string;
  subtitle?: string;
  estabelecimentos: any[];
  variant?: "default" | "featured" | "compact";
}

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

  const categoria = Array.isArray(est.categoria) ? est.categoria[0] : est.categoria;
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

        <p className="text-[15px] text-[#3C096C]">{categoria || "Estabelecimento"}</p>

        {temBeneficio && (
          <p className="text-[15px] text-[#3C096C] mt-1">
            <span className="font-semibold text-[#240046]">🎁 Benefício</span> no aniversário
          </p>
        )}
      </div>
    </article>
  );
};

export const CategoryCarousel = ({ title, subtitle, estabelecimentos, variant = "default" }: CategoryCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Largura fixa do card + gap
  const cardWidth = variant === "featured" ? 300 : variant === "compact" ? 240 : 280;
  const gap = 24;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;

      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < maxScroll - 10);
    };

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);
    return () => container.removeEventListener("scroll", updateScrollState);
  }, [estabelecimentos]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;

    // Calcular quantos cards cabem inteiros na tela
    const cardsVisiveis = Math.floor(clientWidth / (cardWidth + gap));
    const scrollAmount = cardsVisiveis * (cardWidth + gap);

    if (direction === "right") {
      if (scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    } else {
      if (scrollLeft <= 10) {
        container.scrollTo({ left: maxScroll, behavior: "smooth" });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  if (estabelecimentos.length === 0) return null;

  return (
    <section className="relative">
      {/* Header da seção */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[22px] font-semibold text-[#240046]">{title}</h2>
          {subtitle && <p className="text-sm text-[#3C096C] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Container do carrossel */}
      <div className="relative">
        {/* Botão esquerda */}
        <button
          onClick={() => scroll("left")}
          aria-label="Anterior"
          className={cn(
            "absolute left-2 top-1/3 -translate-y-1/2 z-10",
            "w-10 h-10 bg-white rounded-full",
            "shadow-lg border border-[#DDDDDD] flex items-center justify-center",
            "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
            !canScrollLeft && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft className="w-5 h-5 text-[#240046]" />
        </button>

        {/* Carrossel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {estabelecimentos.map((est) => (
            <div
              key={est.id}
              className="flex-shrink-0 snap-start"
              style={{
                width: `${cardWidth}px`,
              }}
            >
              <CarouselCard estabelecimento={est} />
            </div>
          ))}
        </div>

        {/* Botão direita */}
        <button
          onClick={() => scroll("right")}
          aria-label="Próximo"
          className={cn(
            "absolute right-2 top-1/3 -translate-y-1/2 z-10",
            "w-10 h-10 bg-white rounded-full",
            "shadow-lg border border-[#DDDDDD] flex items-center justify-center",
            "transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95",
            !canScrollRight && "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRightIcon className="w-5 h-5 text-[#240046]" />
        </button>
      </div>
    </section>
  );
};
