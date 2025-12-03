import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Gerar ou recuperar session_id
const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('aniversariante_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('aniversariante_session', sessionId);
  }
  return sessionId;
};

type EventType = 
  | 'page_view' 
  | 'benefit_click' 
  | 'whatsapp_click' 
  | 'phone_click' 
  | 'directions_click' 
  | 'share' 
  | 'favorite_add'
  | 'cupom_emitido'
  | 'visualizacao_perfil';

export const useEstablishmentMetrics = () => {
  
  const trackEvent = useCallback(async (
    establishmentId: string,
    eventType: EventType,
    metadata?: Record<string, any>
  ) => {
    if (!establishmentId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('estabelecimento_analytics').insert({
        estabelecimento_id: establishmentId,
        tipo_evento: eventType,
        user_id: user?.id || null,
        metadata: {
          ...metadata,
          session_id: getSessionId(),
          referrer: typeof document !== 'undefined' ? document.referrer : null,
          url: typeof window !== 'undefined' ? window.location.href : null,
        }
      });
    } catch (error) {
      // Silently fail - não bloqueia a UX
      console.error('Erro ao rastrear métrica:', error);
    }
  }, []);

  // Atalhos para eventos comuns
  const trackPageView = useCallback((establishmentId: string) => 
    trackEvent(establishmentId, 'page_view'), [trackEvent]);
  
  const trackBenefitClick = useCallback((establishmentId: string) => 
    trackEvent(establishmentId, 'benefit_click'), [trackEvent]);
  
  const trackWhatsAppClick = useCallback((establishmentId: string) => 
    trackEvent(establishmentId, 'whatsapp_click'), [trackEvent]);
  
  const trackPhoneClick = useCallback((establishmentId: string) => 
    trackEvent(establishmentId, 'phone_click'), [trackEvent]);
  
  const trackDirectionsClick = useCallback((establishmentId: string, app: string) => 
    trackEvent(establishmentId, 'directions_click', { app }), [trackEvent]);
  
  const trackShare = useCallback((establishmentId: string) => 
    trackEvent(establishmentId, 'share'), [trackEvent]);
  
  const trackFavorite = useCallback((establishmentId: string) => 
    trackEvent(establishmentId, 'favorite_add'), [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackBenefitClick,
    trackWhatsAppClick,
    trackPhoneClick,
    trackDirectionsClick,
    trackShare,
    trackFavorite
  };
};
