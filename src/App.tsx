import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PageTransition } from "@/components/PageTransition";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { LazyRoute } from "@/components/LazyRoute";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import ProtectedEstabelecimentoRoute from "@/components/auth/ProtectedEstabelecimentoRoute";
import ProtectedAniversarianteRoute from "@/components/auth/ProtectedAniversarianteRoute";
import ProtectedAdminRoute from "@/components/auth/ProtectedAdminRoute";
import { CarolProvider } from "@/components/ChatBot/CarolProvider";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import VersionBadge from "@/components/debug/VersionBadge";

// Lazy load das páginas principais
const Index = lazy(() => import("./pages/Index"));
const Explorar = lazy(() => import("./pages/Explorar"));
const EstabelecimentoDetalhe = lazy(() => import("./pages/EstabelecimentoDetalhe"));
const EstabelecimentoDetalhePremium = lazy(() => import("./pages/EstabelecimentoDetalhePremium"));
const EstabelecimentoDetalheBySlug = lazy(() => import("./pages/EstabelecimentoDetalheBySlug"));
const EstabelecimentoRedirect = lazy(() => import("./pages/EstabelecimentoRedirect"));
const SmartAuth = lazy(() => import("./pages/SmartAuth"));
const Feed = lazy(() => import("./pages/Feed"));
const FlashDeals = lazy(() => import("./pages/FlashDeals"));

// Lazy load das páginas de autenticação
const CadastroAniversariante = lazy(() => import("./pages/CadastroAniversariante"));
const LoginAniversariante = lazy(() => import("./pages/LoginAniversariante"));
const AreaAniversariante = lazy(() => import("./pages/AreaAniversariante"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

// Lazy load das páginas de estabelecimento
const CadastroEstabelecimento = lazy(() => import("./pages/CadastroEstabelecimento"));
const LoginEstabelecimento = lazy(() => import("./pages/LoginEstabelecimento"));
const AreaEstabelecimento = lazy(() => import("./pages/AreaEstabelecimento"));
const SelecionarCategoria = lazy(() => import("./pages/SelecionarCategoria"));

// Lazy load das páginas administrativas
const SetupAdmin = lazy(() => import("./pages/SetupAdmin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminImport = lazy(() => import("./pages/AdminImport"));
const LoginColaborador = lazy(() => import("./pages/LoginColaborador"));
const AreaColaborador = lazy(() => import("./pages/AreaColaborador"));

// Lazy load das páginas institucionais
const ComoFunciona = lazy(() => import("./pages/ComoFunciona"));
const SejaParceito = lazy(() => import("./pages/SejaParceito"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Sobre = lazy(() => import("./pages/Sobre"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosUso = lazy(() => import("./pages/TermosUso"));
const SelecionarPerfil = lazy(() => import("./pages/SelecionarPerfil"));

// Lazy load de outras páginas
const MeusFavoritos = lazy(() => import("./pages/MeusFavoritos"));
const Afiliado = lazy(() => import("./pages/Afiliado"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Componente interno para usar hooks
const AppContent = () => {
  // Gerenciar atualizações automáticas do Service Worker
  useAppUpdate();
  
  return null;
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vip-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Sentry.ErrorBoundary
        fallback={({ error, resetError }) => (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-foreground mb-4">Ops! Algo deu errado</h1>
              <p className="text-muted-foreground mb-6">
                Encontramos um problema inesperado. Nossa equipe já foi notificada.
              </p>
              <div className="space-y-3">
                <Button onClick={resetError} className="w-full">
                  Tentar novamente
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'} className="w-full">
                  Voltar para o início
                </Button>
              </div>
            </div>
          </div>
        )}
      >
        <BrowserRouter>
            <ScrollToTop />
            <CarolProvider>
            <AnalyticsProvider>
              <AppContent />
          <ErrorBoundary>
              <PageTransition>
                <BottomNav />
                <ScrollToTopButton showAfter={400} />
                <Routes>
                <Route path="/" element={<LazyRoute><Index /></LazyRoute>} />
                {/* /explorar agora redireciona para / */}
                <Route path="/explorar" element={<Navigate to="/" replace />} />
                {/* Relâmpago - ofertas por tempo limitado */}
                <Route path="/relampago" element={<LazyRoute><FlashDeals /></LazyRoute>} />
                {/* Redirects para rotas legadas */}
                <Route path="/flash-deals" element={<Navigate to="/relampago" replace />} />
                <Route path="/feed" element={<Navigate to="/relampago" replace />} />
                
                {/* URLs amigáveis - DEVEM VIR ANTES da rota antiga */}
                <Route path="/:estado/:cidade/:slug" element={<LazyRoute><EstabelecimentoDetalheBySlug /></LazyRoute>} />
                
                {/* Rota antiga com redirect para nova URL */}
                <Route path="/estabelecimento/:id" element={<LazyRoute><EstabelecimentoRedirect /></LazyRoute>} />
                
                {/* Rota premium para testes */}
                <Route path="/premium/:id" element={<LazyRoute><EstabelecimentoDetalhePremium /></LazyRoute>} />
                
                <Route path="/como-funciona" element={<LazyRoute><ComoFunciona /></LazyRoute>} />
                <Route path="/seja-parceiro" element={<LazyRoute><SejaParceito /></LazyRoute>} />
                <Route path="/faq" element={<LazyRoute><FAQ /></LazyRoute>} />
                {/* CUPONS E PLANOS REMOVIDOS TEMPORARIAMENTE */}
                {/* <Route path="/meus-cupons" element={<MeusCupons />} /> */}
                {/* <Route path="/emitir-cupom" element={<EmitirCupom />} /> */}
                {/* <Route path="/planos-pagamento" element={<PlanosPagamento />} /> */}
                {/* <Route path="/planos" element={<PlanosPagamento />} /> */}
                <Route 
                  path="/meus-favoritos" 
                  element={
                    <ProtectedAniversarianteRoute>
                      <LazyRoute><MeusFavoritos /></LazyRoute>
                    </ProtectedAniversarianteRoute>
                  } 
                />
                <Route path="/politica-privacidade" element={<LazyRoute><PoliticaPrivacidade /></LazyRoute>} />
                <Route path="/termos-uso" element={<LazyRoute><TermosUso /></LazyRoute>} />
                <Route path="/forgot-password" element={<LazyRoute><ForgotPassword /></LazyRoute>} />
                <Route path="/update-password" element={<LazyRoute><ResetPassword /></LazyRoute>} />
                <Route path="/auth" element={<LazyRoute><SmartAuth /></LazyRoute>} />
                <Route path="/auth/callback" element={<LazyRoute><AuthCallback /></LazyRoute>} />
                <Route path="/selecionar-perfil" element={<LazyRoute><SelecionarPerfil /></LazyRoute>} />
                <Route path="/cadastro/aniversariante" element={<LazyRoute><CadastroAniversariante /></LazyRoute>} />
                <Route path="/login/aniversariante" element={<LazyRoute><LoginAniversariante /></LazyRoute>} />
                <Route 
                  path="/area-aniversariante" 
                  element={
                    <ProtectedAniversarianteRoute>
                      <LazyRoute><AreaAniversariante /></LazyRoute>
                    </ProtectedAniversarianteRoute>
                  } 
                />
                <Route path="/cadastro/estabelecimento" element={<LazyRoute><CadastroEstabelecimento /></LazyRoute>} />
                <Route path="/login/estabelecimento" element={<LazyRoute><LoginEstabelecimento /></LazyRoute>} />
                <Route 
                  path="/area-estabelecimento" 
                  element={
                    <ProtectedEstabelecimentoRoute>
                      <LazyRoute><AreaEstabelecimento /></LazyRoute>
                    </ProtectedEstabelecimentoRoute>
                  } 
                />
                <Route 
                  path="/estabelecimento/dashboard" 
                  element={
                    <ProtectedEstabelecimentoRoute>
                      <LazyRoute><AreaEstabelecimento /></LazyRoute>
                    </ProtectedEstabelecimentoRoute>
                  } 
                />
                <Route path="/login/colaborador" element={<LazyRoute><LoginColaborador /></LazyRoute>} />
                <Route path="/area-colaborador" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/setup-admin" element={<LazyRoute><SetupAdmin /></LazyRoute>} />
                <Route path="/admin" element={<LazyRoute><AdminLogin /></LazyRoute>} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedAdminRoute>
                      <LazyRoute><AdminDashboard /></LazyRoute>
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/admin/import" 
                  element={
                    <ProtectedAdminRoute>
                      <LazyRoute><AdminImport /></LazyRoute>
                    </ProtectedAdminRoute>
                  } 
                />
                <Route 
                  path="/afiliado" 
                  element={
                    <ProtectedAniversarianteRoute>
                      <LazyRoute><Afiliado /></LazyRoute>
                    </ProtectedAniversarianteRoute>
                  } 
                />
                <Route path="/selecionar-categoria" element={<LazyRoute><SelecionarCategoria /></LazyRoute>} />
                
                {/* Redirects para rotas legadas */}
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/login-estabelecimento" element={<Navigate to="/login/estabelecimento" replace />} />
                <Route path="/login-aniversariante" element={<Navigate to="/auth" replace />} />
                <Route path="/entrar" element={<Navigate to="/auth" replace />} />
                <Route path="/cadastro" element={<Navigate to="/auth" replace />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/registro" element={<Navigate to="/auth" replace />} />
                <Route path="/cadastro/aniversariante" element={<Navigate to="/auth" replace />} />
                <Route path="/login/aniversariante" element={<Navigate to="/auth" replace />} />
                
                {/* Aliases - rotas curtas redirecionam para as corretas */}
                <Route path="/favoritos" element={<Navigate to="/meus-favoritos" replace />} />
                <Route path="/perfil" element={<Navigate to="/area-aniversariante" replace />} />
                <Route path="/termos" element={<Navigate to="/termos-uso" replace />} />
                <Route path="/privacidade" element={<Navigate to="/politica-privacidade" replace />} />
                
                {/* Página Sobre */}
                <Route path="/sobre" element={<LazyRoute><Sobre /></LazyRoute>} />
                
                <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
              </Routes>
            </PageTransition>
            <CookieConsent />
            <VersionBadge />
          </ErrorBoundary>
          </AnalyticsProvider>
          </CarolProvider>
        </BrowserRouter>
      </Sentry.ErrorBoundary>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
