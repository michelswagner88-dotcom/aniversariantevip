import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type NotificationPermission = 'default' | 'granted' | 'denied';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Verifica permissão atual ao montar
    if ('Notification' in window) {
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

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

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window,
  };
};
