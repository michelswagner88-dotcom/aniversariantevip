import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para gerenciar atualizações do Service Worker e forçar atualizações automáticas.
 */
export const useAppUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Função para forçar atualização completa
  const updateNow = useCallback(async () => {
    console.log('[SW] Forçando atualização...');
    
    // Limpar todos os caches
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
      console.log('[SW] Caches limpos');
    }
    
    // Desregistrar SWs e recarregar
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
      console.log('[SW] SWs desregistrados');
    }
    
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleUpdate = async (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        setUpdateAvailable(true);
        
        // Ativar novo SW imediatamente
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        toast.info('Atualizando...', {
          description: 'Nova versão disponível!',
          duration: 2000,
        });
        
        // Auto-reload após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    };

    // Verificar atualizações ao carregar
    navigator.serviceWorker.ready.then((reg) => {
      // Verificar atualizações imediatamente
      reg.update().catch(console.error);
      
      if (reg.waiting) {
        handleUpdate(reg);
        return;
      }

      // Detectar novas instalações
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

    // Recarregar quando novo SW assumir controle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  return { updateAvailable, updateNow };
};
