// =============================================================================
// ESTABELECIMENTO DETALHE (ROTA POR ID)
// Wrapper que usa o componente Premium para manter consistência visual
// Rota: /estabelecimento/:id
// =============================================================================

import { useParams } from "react-router-dom";
import EstabelecimentoDetalhePremium from "./EstabelecimentoDetalhePremium";

interface EstabelecimentoDetalheProps {
  estabelecimentoIdProp?: string | null;
}

const EstabelecimentoDetalhe = ({ estabelecimentoIdProp }: EstabelecimentoDetalheProps = {}) => {
  const { id: idFromParams } = useParams();

  // Prioridade: prop > params
  const id = estabelecimentoIdProp || idFromParams || null;

  // Renderiza o componente Premium com o ID
  return <EstabelecimentoDetalhePremium estabelecimentoIdProp={id} />;
};

export default EstabelecimentoDetalhe;
