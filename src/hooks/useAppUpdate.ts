import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para gerenciar atualizações do Service Worker e notificar usuários
 * sobre novas versões disponíveis do aplicativo.
 */
export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Função para forçar atualização
  const updateNow = useCallback(() => {
    if (registration?.waiting) {
      // Enviar mensagem para o SW waiting ativar
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Recarregar a página
    window.location.reload();
  }, [registration]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleUpdate = (reg: ServiceWorkerRegistration) => {
      // Quando um novo SW é instalado mas está esperando
      if (reg.waiting) {
        setUpdateAvailable(true);
        setRegistration(reg);
        
        toast.info('Nova versão disponível!', {
          description: 'Clique para atualizar o aplicativo.',
          action: {
            label: 'Atualizar',
            onClick: () => {
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            },
          },
          duration: 10000,
        });
      }
    };

    // Verificar se já existe um SW esperando
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      
      if (reg.waiting) {
        handleUpdate(reg);
      }

      // Escutar por novas instalações
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleUpdate(reg);
            }
          });
        }
      });
    });

    // Auto-atualizar quando SW assume controle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  // Auto-atualizar após 5 segundos se houver nova versão
  useEffect(() => {
    if (updateAvailable) {
      const timer = setTimeout(() => {
        console.log('[SW] Auto-atualizando após 5 segundos...');
        updateNow();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateAvailable, updateNow]);

  return {
    updateAvailable,
    updateNow,
  };
};
