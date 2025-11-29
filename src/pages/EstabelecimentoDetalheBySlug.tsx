import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import EstabelecimentoDetalhe from './EstabelecimentoDetalhe';

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

      // Converter cidade slug de volta (florianopolis -> Florianópolis)
      const { data, error } = await supabase
        .from('public_estabelecimentos')
        .select('id')
        .eq('slug', slug)
        .eq('estado', estado.toUpperCase())
        .ilike('cidade', cidade.replace(/-/g, ' ') + '%')
        .eq('ativo', true)
        .maybeSingle();

      if (error || !data) {
        console.log('Estabelecimento não encontrado:', { estado, cidade, slug });
        setNotFound(true);
        setLoading(false);
        return;
      }

      setEstabelecimentoId(data.id);
      setLoading(false);
    };

    fetchEstabelecimento();
  }, [estado, cidade, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Estabelecimento não encontrado</h1>
          <p className="text-gray-400 mb-6">O estabelecimento que você procura não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/explorar')}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Explorar Estabelecimentos
          </button>
        </div>
      </div>
    );
  }

  return <EstabelecimentoDetalhe estabelecimentoIdProp={estabelecimentoId} />;
};

export default EstabelecimentoDetalheBySlug;
