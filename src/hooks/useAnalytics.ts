export const useAnalytics = () => {
  
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  };

  const trackBuscaEstabelecimento = (cidade: string, categoria?: string) => {
    trackEvent('busca_estabelecimento', { cidade, categoria });
  };

  const trackVisualizouEstabelecimento = (id: string, nome: string, categoria: string) => {
    trackEvent('visualizou_estabelecimento', { estabelecimento_id: id, nome, categoria });
  };

  const trackClicouBeneficio = (id: string, nome: string) => {
    trackEvent('clicou_beneficio', { estabelecimento_id: id, nome });
  };

  const trackCadastroIniciado = (tipo: 'aniversariante' | 'estabelecimento') => {
    trackEvent('cadastro_iniciado', { tipo });
  };

  const trackCadastroCompleto = (tipo: 'aniversariante' | 'estabelecimento') => {
    trackEvent('cadastro_completo', { tipo });
  };

  const trackLogin = (metodo: 'email' | 'google') => {
    trackEvent('login', { metodo });
  };

  const trackClicouNavegacao = (app: 'google_maps' | 'waze' | 'uber' | '99') => {
    trackEvent('clicou_navegacao', { app });
  };

  return {
    trackEvent,
    trackBuscaEstabelecimento,
    trackVisualizouEstabelecimento,
    trackClicouBeneficio,
    trackCadastroIniciado,
    trackCadastroCompleto,
    trackLogin,
    trackClicouNavegacao,
  };
};
