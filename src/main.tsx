import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Versão do app para controle de cache - INCREMENTAR A CADA DEPLOY
const APP_VERSION = '2.11.0';

// Verificação de versão - limpar caches se versão mudou
const storedVersion = localStorage.getItem('app_version');
if (storedVersion !== APP_VERSION) {
  console.log(`[Cache] Versão mudou: ${storedVersion} → ${APP_VERSION}`);
  
  // Limpar todos os caches
  if ('caches' in window) {
    caches.keys().then(async (names) => {
      await Promise.all(names.map((name) => {
        console.log(`[Cache] Limpando: ${name}`);
        return caches.delete(name);
      }));
      console.log('[Cache] Todos os caches removidos');
    });
  }
  
  // Desregistrar Service Workers antigos
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      await Promise.all(registrations.map((reg) => reg.unregister()));
      console.log('[SW] Service Workers desregistrados');
    });
  }
  
  localStorage.setItem('app_version', APP_VERSION);
}

// Gerenciamento de Service Worker - forçar atualização em novos deploys
if ('serviceWorker' in navigator) {
  // Helper para verificar se erro é de SW removido (não crítico)
  const isSwNotFoundError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    return message.includes('Not found') || message.includes('not found');
  };

  // Quando o SW estiver pronto, verificar por atualizações
  navigator.serviceWorker.ready.then((registration) => {
    // Verificar por atualizações imediatamente (silenciando erros não críticos)
    registration.update().catch((err) => {
      if (isSwNotFoundError(err)) {
        console.log('[SW] Service Worker removido, ignorando erro de update');
        return;
      }
      console.error('[SW] Erro ao verificar atualizações:', err);
    });
    
    // Verificar atualizações periodicamente (a cada 60 segundos)
    setInterval(() => {
      registration.update().catch((err) => {
        if (isSwNotFoundError(err)) {
          console.log('[SW] Service Worker removido, ignorando');
          return;
        }
        console.error('[SW] Erro periódico:', err);
      });
    }, 60 * 1000);
    
    // Escutar quando um novo SW for instalado
    registration.onupdatefound = () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] Nova versão disponível!');
          }
        };
      }
    };
  }).catch((err) => {
    if (isSwNotFoundError(err)) {
      console.log('[SW] Service Worker não encontrado, será registrado no próximo deploy');
      return;
    }
    console.error('[SW] Erro ao aguardar SW:', err);
  });
  
  // Detectar quando o SW assume controle (nova versão ativada)
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloading) {
      reloading = true;
      console.log('[SW] Service Worker atualizado, recarregando página...');
      window.location.reload();
    }
  });
}

// Inicializar Sentry (apenas em produção)
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD, // Só ativa em produção
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% das transações
  replaysSessionSampleRate: 0.1, // 10% das sessões
  replaysOnErrorSampleRate: 1.0, // 100% das sessões com erro
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
