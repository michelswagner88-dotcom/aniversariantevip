import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false, // Desabilitar SW em desenvolvimento
      },
      includeAssets: ["favicon.png"],
      manifest: {
        name: "Aniversariante VIP",
        short_name: "VIP",
        description: "Plataforma de benefícios para aniversariantes",
        theme_color: "#FFB800",
        background_color: "#0D0D0D",
        display: "standalone",
        icons: [
          {
            src: "/favicon.png",
            sizes: "any",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // NÃO cachear HTML - apenas assets estáticos
        globPatterns: ["**/*.{js,css,ico,png,svg,woff,woff2}"],
        
        // Limpar caches antigos automaticamente
        cleanupOutdatedCaches: true,
        
        // Ativar novo SW imediatamente
        skipWaiting: true,
        clientsClaim: true,
        
        // Não usar fallback para navegação (SPA handled by router)
        navigateFallback: null,
        
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        
        runtimeCaching: [
          {
            // Fontes Google - Cache First (nunca mudam)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Fontes estáticas Google
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-static",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Supabase API - SEMPRE buscar do servidor (NUNCA cachear)
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkOnly",
          },
          {
            // Google Maps - Network First com timeout curto
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "google-maps-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          {
            // Imagens - Stale While Revalidate (mostra cache, busca nova versão)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Garantir hashes nos nomes dos arquivos para cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // Vendor chunks principais
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-toast',
          ],
          'supabase': ['@supabase/supabase-js'],
          'maps': ['@react-google-maps/api'],
          'query': ['@tanstack/react-query'],
          'icons': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
}));
