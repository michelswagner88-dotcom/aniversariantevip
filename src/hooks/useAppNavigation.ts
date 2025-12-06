import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { getExplorarUrl, getEstabelecimentoUrl } from '@/utils/urls';

/**
 * Hook para navegação segura e consistente em todo o app
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();

  // Navegar para explorar com filtros (agora é a home /)
  const goToExplorar = useCallback((params?: {
    cidade?: string;
    estado?: string;
    categoria?: string;
    subcategoria?: string;
    q?: string;
  }) => {
    try {
      // Construir URL para a home com parâmetros
      const searchParams = new URLSearchParams();
      if (params?.cidade) searchParams.set('cidade', params.cidade);
      if (params?.estado) searchParams.set('estado', params.estado);
      if (params?.categoria) searchParams.set('categoria', params.categoria);
      if (params?.q) searchParams.set('q', params.q);
      
      const queryString = searchParams.toString();
      const url = queryString ? `/?${queryString}` : '/';
      
      console.log('[Navigation] goToExplorar - URL:', url);
      navigate(url, { replace: false });
    } catch (error) {
      console.error('[Navigation] ERRO em goToExplorar:', error);
      navigate('/');
    }
  }, [navigate]);

  // Navegar para estabelecimento
  const goToEstabelecimento = useCallback((slug: string) => {
    const url = getEstabelecimentoUrl(slug);
    console.log('[Navigation] Navegando para estabelecimento:', url);
    navigate(url);
  }, [navigate]);

  // Navegar para home
  const goToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Navegar para auth
  const goToAuth = useCallback(() => {
    navigate('/auth');
  }, [navigate]);

  // Voltar
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    goToExplorar,
    goToEstabelecimento,
    goToHome,
    goToAuth,
    goBack,
  };
};
