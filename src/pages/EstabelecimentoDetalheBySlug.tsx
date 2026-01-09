// =============================================================================
// ESTABELECIMENTO DETALHE BY SLUG
// Rota que busca por slug e renderiza o componente Premium
// =============================================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import EstabelecimentoDetalhePremium from "./EstabelecimentoDetalhePremium";

const EstabelecimentoDetalheBySlug = () => {
  const { estado, cidade, slug } = useParams();
  const navigate = useNavigate();
  const [estabelecimentoId, setEstabelecimentoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEstabelecimento = async () => {
      if (!estado || !cidade || !slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const estadoNormalizado = decodeURIComponent(estado).trim();

      const cidadeNormalizada = cidade.replace(/-/g, " ");

      const { data, error } = await supabase
        .from("public_estabelecimentos")
        .select("id, nome_fantasia, cidade, estado, slug")
        .eq("slug", slug)
        .ilike("estado", `%${estadoNormalizado}%`)
        .eq("ativo", true)
        .maybeSingle();

      if (error) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setEstabelecimentoId(data.id);
      setLoading(false);
    };

    fetchEstabelecimento();
  }, [estado, cidade, slug]);

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero skeleton */}
        <Skeleton className="w-full h-[60vh] rounded-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="lg:grid lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-40 w-full rounded-2xl" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === NOT FOUND STATE ===
  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Ícone */}
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>

          {/* Texto */}
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Estabelecimento não encontrado</h1>
          <p className="text-zinc-500 mb-8">
            O estabelecimento que você procura não existe ou foi removido da nossa plataforma.
          </p>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/explorar")}
              className="w-full px-6 py-3 bg-[#240046] text-white font-semibold rounded-xl hover:bg-[#3C096C] transition-colors"
            >
              Explorar Estabelecimentos
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 text-zinc-700 font-medium rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === RENDER PREMIUM COMPONENT ===
  return <EstabelecimentoDetalhePremium estabelecimentoIdProp={estabelecimentoId} />;
};

export default EstabelecimentoDetalheBySlug;
