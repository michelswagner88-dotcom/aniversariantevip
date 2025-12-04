import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { getExplorarUrl, getEstabelecimentoUrl } from '@/utils/urls';

/**
 * Hook para navegação segura e consistente em todo o app
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();

  // Navegar para explorar com filtros
  const goToExplorar = useCallback((params?: {
    cidade?: string;
    estado?: string;
    categoria?: string;
    subcategoria?: string;
    q?: string;
  }) => {
    try {
      const url = getExplorarUrl(params || {});
      console.log('[Navigation] goToExplorar - Params:', params);
      console.log('[Navigation] goToExplorar - URL gerada:', url);
      console.log('[Navigation] goToExplorar - Executando navigate()...');
      navigate(url, { replace: false });
      console.log('[Navigation] goToExplorar - navigate() concluído');
    } catch (error) {
      console.error('[Navigation] ERRO em goToExplorar:', error);
      // Fallback: navegar direto para /explorar sem params
      navigate('/explorar');
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
