import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
        console.log("❌ Parâmetros faltando:", { estado, cidade, slug });
        setNotFound(true);
        setLoading(false);
        return;
      }

      const estadoNormalizado = decodeURIComponent(estado).trim();

      console.log("🔍 Buscando estabelecimento:", {
        estadoOriginal: estado,
        estadoNormalizado,
        cidade,
        slug,
        url: window.location.pathname,
      });

      const cidadeNormalizada = cidade.replace(/-/g, " ");

      const { data, error } = await supabase
        .from("public_estabelecimentos")
        .select("id, nome_fantasia, cidade, estado, slug")
        .eq("slug", slug)
        .ilike("estado", `%${estadoNormalizado}%`)
        .eq("ativo", true)
        .maybeSingle();

      console.log("📊 Resultado da busca:", { data, error });

      if (error) {
        console.error("❌ Erro na query:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (!data) {
        console.log("❌ Estabelecimento não encontrado com os filtros:", {
          slug,
          estado: estado.toUpperCase(),
        });

        const { data: debugData } = await supabase
          .from("public_estabelecimentos")
          .select("id, nome_fantasia, cidade, estado, slug")
          .eq("slug", slug)
          .eq("ativo", true)
          .maybeSingle();

        console.log("🔍 Debug - Estabelecimento existe com esse slug?", debugData);

        setNotFound(true);
        setLoading(false);
        return;
      }

      console.log("✅ Estabelecimento encontrado:", data);
      setEstabelecimentoId(data.id);
      setLoading(false);
    };

    fetchEstabelecimento();
  }, [estado, cidade, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Estabelecimento não encontrado</h1>
          <p className="text-zinc-500 mb-6">O estabelecimento que você procura não existe ou foi removido.</p>
          <button
            onClick={() => navigate("/explorar")}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Explorar Estabelecimentos
          </button>
        </div>
      </div>
    );
  }

  return <EstabelecimentoDetalhePremium estabelecimentoIdProp={estabelecimentoId} />;
};

export default EstabelecimentoDetalheBySlug;
