import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Versão do app para controle de cache
const APP_VERSION = '2.3.0';

// Verificação de versão - limpar caches se versão mudou
const storedVersion = localStorage.getItem('app_version');
if (storedVersion && storedVersion !== APP_VERSION) {
  console.log(`[Cache] Versão mudou: ${storedVersion} → ${APP_VERSION}`);
  // Limpar caches programaticamente
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        console.log(`[Cache] Limpando: ${name}`);
        caches.delete(name);
      });
    });
  }
}
localStorage.setItem('app_version', APP_VERSION);

// Gerenciamento de Service Worker - forçar atualização em novos deploys
if ('serviceWorker' in navigator) {
  // Quando o SW estiver pronto, verificar por atualizações
  navigator.serviceWorker.ready.then((registration) => {
    // Verificar por atualizações imediatamente
    registration.update().catch((err) => {
      console.error('[SW] Erro ao verificar atualizações:', err);
    });
    
    // Verificar atualizações periodicamente (a cada 60 segundos)
    setInterval(() => {
      registration.update().catch(console.error);
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
  });
  
  // Detectar quando o SW assume controle (nova versão ativada)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW] Service Worker atualizado, recarregando página...');
    window.location.reload();
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
