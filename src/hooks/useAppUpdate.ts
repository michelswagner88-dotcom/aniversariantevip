import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

// Versão do app - atualizada a cada build pelo Vite
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
const BUILD_TIME = import.meta.env.VITE_BUILD_TIME || Date.now().toString();

/**
 * Hook para gerenciar atualizações do Service Worker e verificação de versão.
 * Detecta novas versões automaticamente e força atualização.
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
    // === VERIFICAÇÃO DE VERSÃO ===
    const storedVersion = localStorage.getItem('app_version');
    const storedBuildTime = localStorage.getItem('app_build_time');

    // Se é primeira visita, salvar versão atual
    if (!storedVersion || !storedBuildTime) {
      localStorage.setItem('app_version', APP_VERSION);
      localStorage.setItem('app_build_time', BUILD_TIME);
      console.log('[Version] Primeira visita, versão salva:', APP_VERSION, BUILD_TIME);
    } 
    // Se versão mudou, limpar caches e notificar
    else if (storedBuildTime !== BUILD_TIME) {
      console.log('[Version] Nova versão detectada!', {
        oldBuild: storedBuildTime,
        newBuild: BUILD_TIME,
        oldVersion: storedVersion,
        newVersion: APP_VERSION,
      });

      setUpdateAvailable(true);

      // Limpar caches do browser
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
            console.log('[Version] Cache removido:', name);
          });
        });
      }

      // Atualizar versão armazenada
      localStorage.setItem('app_version', APP_VERSION);
      localStorage.setItem('app_build_time', BUILD_TIME);

      // Notificar usuário
      toast.info('App atualizado!', {
        description: 'Uma nova versão foi carregada.',
        duration: 3000,
      });
    }

    // === SERVICE WORKER ===
    if (!('serviceWorker' in navigator)) return;

    // Helper para verificar se erro é de SW removido (não crítico)
    const isSwNotFoundError = (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      return message.includes('Not found') || message.includes('not found');
    };

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
      // Verificar atualizações imediatamente (com tratamento de erro)
      reg.update().catch((err) => {
        if (isSwNotFoundError(err)) {
          console.log('[SW] Service Worker removido, ignorando erro inicial');
          return;
        }
        console.error('[SW] Erro ao verificar atualizações:', err);
      });
      
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

      // Verificar atualizações periodicamente (a cada 60 segundos) com tratamento de erro
      const checkInterval = setInterval(() => {
        reg.update().catch((err) => {
          if (isSwNotFoundError(err)) {
            console.log('[SW] Service Worker removido, parando verificação periódica');
            clearInterval(checkInterval);
            return;
          }
          console.log('[SW] Erro de update ignorado:', err instanceof Error ? err.message : err);
        });
      }, 60 * 1000);

      return () => clearInterval(checkInterval);
    }).catch((err) => {
      if (isSwNotFoundError(err)) {
        console.log('[SW] Service Worker não encontrado');
        return;
      }
      console.error('[SW] Erro ao aguardar SW ready:', err);
    });

    // Recarregar quando novo SW assumir controle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[SW] Novo Service Worker ativo, recarregando...');
        window.location.reload();
      }
    });
  }, []);

  return { updateAvailable, updateNow };
};
