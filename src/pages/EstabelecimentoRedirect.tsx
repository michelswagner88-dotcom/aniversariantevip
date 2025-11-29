import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getEstabelecimentoUrl } from '@/lib/slugUtils';

const EstabelecimentoRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = async () => {
      if (!id) {
        navigate('/explorar');
        return;
      }

      const { data } = await supabase
        .from('public_estabelecimentos')
        .select('estado, cidade, slug')
        .eq('id', id)
        .maybeSingle();

      if (data?.slug && data?.cidade && data?.estado) {
        // Redirect permanente para URL amigável
        const newUrl = getEstabelecimentoUrl(data);
        navigate(newUrl, { replace: true });
      } else {
        // Se não tem slug, vai pro explorar
        navigate('/explorar');
      }
    };

    redirect();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default EstabelecimentoRedirect;
