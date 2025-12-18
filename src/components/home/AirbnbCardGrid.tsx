// =============================================================================
// CARDGRID.TSX - ANIVERSARIANTE VIP
// Design: Grid responsivo, 2 colunas mobile
// =============================================================================

import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import { EstablishmentCard } from "@/components/cards/EstablishmentCard";
import { getEstabelecimentoUrl } from "@/lib/slugUtils";

// =============================================================================
// TYPES
// =============================================================================

interface Estabelecimento {
  id: string;
  nome_fantasia?: string;
  categoria?: string | string[];
  bairro?: string;
  cidade?: string;
  estado?: string;
  logo_url?: string;
  imagem_url?: string;
  descricao_beneficio?: string;
  slug?: string;
}

interface CardGridProps {
  items: Estabelecimento[];
  isLoading?: boolean;
}

// =============================================================================
// SKELETON
// =============================================================================

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[4/5] rounded-xl bg-gray-200 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
  </div>
);

// =============================================================================
// EMPTY
// =============================================================================

const Empty = () => (
  <div className="text-center py-16 col-span-full">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
      <Gift className="w-8 h-8 text-gray-400" />
    </div>
    <p className="text-gray-900 font-medium">Nenhum resultado</p>
    <p className="text-gray-500 text-sm mt-1">Tente ajustar os filtros</p>
  </div>
);

// =============================================================================
// MAIN
// =============================================================================

export const CardGrid = memo(function CardGrid({ items, isLoading = false }: CardGridProps) {
  const navigate = useNavigate();

  const handleClick = (est: Estabelecimento) => {
    const url = getEstabelecimentoUrl({
      estado: est.estado || "",
      cidade: est.cidade || "",
      slug: est.slug || null,
      id: est.id,
    });
    navigate(url);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <Empty />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((est) => (
        <EstablishmentCard key={est.id} data={est} onClick={() => handleClick(est)} />
      ))}
    </div>
  );
});

export default CardGrid;
