import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type NotificationPermission = 'default' | 'granted' | 'denied';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Verifica permissão atual ao montar
    if ('Notification' in window) {
      setPermission(Notification.permission as NotificationPermission);
      
      // Registrar Service Worker para notificações push
      if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        registerServiceWorker();
      }
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Service Worker será criado pelo PWA plugin
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker registrado:', registration);
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações');
      return;
    }

    if (Notification.permission === 'granted') {
      toast.success('Notificações já estão ativadas! 🔔');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      if (result === 'granted') {
        toast.success('Notificações ativadas! Você será lembrado no dia. 🎉');
        
        // Envia uma notificação de teste
        new Notification('Aniversariante VIP', {
          body: 'Você receberá lembretes sobre seus cupons! 🎂',
          icon: '/favicon.png',
          badge: '/favicon.png',
        });
      } else if (result === 'denied') {
        toast.error('Você negou as notificações. Ative nas configurações do navegador.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao ativar notificações');
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        ...options,
      });
    }
  };

  const subscribeToRegionUpdates = async (userId: string) => {
    if (permission !== 'granted') {
      toast.error('Você precisa permitir notificações primeiro');
      return false;
    }

    try {
      // Buscar dados do usuário
      const { data: user } = await supabase
        .from('aniversariantes')
        .select('cidade, estado')
        .eq('id', userId)
        .single();

      if (!user?.cidade || !user?.estado) {
        toast.error('Precisamos da sua cidade para enviar notificações relevantes');
        return false;
      }

      // Registrar interesse em notificações no analytics
      await supabase.from('analytics').insert({
        event_type: 'notification_subscription',
        user_id: userId,
        metadata: {
          cidade: user.cidade,
          estado: user.estado,
          subscribed_at: new Date().toISOString(),
        },
      });

      toast.success('✅ Você será notificado sobre novos estabelecimentos na sua região!');
      return true;
    } catch (error) {
      console.error('Erro ao inscrever para notificações:', error);
      toast.error('Erro ao ativar notificações');
      return false;
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    subscribeToRegionUpdates,
    isSupported: 'Notification' in window,
  };
};
