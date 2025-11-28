import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "@/components/ThemeProvider";
import ChatAssistant from "@/components/ChatAssistant";
import { PageTransition } from "@/components/PageTransition";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { LazyRoute } from "@/components/LazyRoute";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";

// Lazy load das páginas principais
const Index = lazy(() => import("./pages/Index"));
const Explorar = lazy(() => import("./pages/Explorar"));
const EstabelecimentoDetalhes = lazy(() => import("./pages/EstabelecimentoDetalhes"));
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
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosUso = lazy(() => import("./pages/TermosUso"));
const SelecionarPerfil = lazy(() => import("./pages/SelecionarPerfil"));

// Lazy load de outras páginas
const MeusFavoritos = lazy(() => import("./pages/MeusFavoritos"));
const Afiliado = lazy(() => import("./pages/Afiliado"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));


const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vip-theme">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ChatAssistant />
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
          <AnalyticsProvider>
            <ErrorBoundary>
              <PageTransition>
                <BottomNav />
                <Routes>
                <Route path="/" element={<LazyRoute><Index /></LazyRoute>} />
                <Route path="/explorar" element={<LazyRoute><Explorar /></LazyRoute>} />
                <Route path="/flash-deals" element={<LazyRoute><FlashDeals /></LazyRoute>} />
                <Route path="/feed" element={<LazyRoute><Feed /></LazyRoute>} />
                <Route path="/estabelecimento/:id" element={<LazyRoute><EstabelecimentoDetalhes /></LazyRoute>} />
                <Route path="/como-funciona" element={<LazyRoute><ComoFunciona /></LazyRoute>} />
                <Route path="/seja-parceiro" element={<LazyRoute><SejaParceito /></LazyRoute>} />
                <Route path="/faq" element={<LazyRoute><FAQ /></LazyRoute>} />
                {/* CUPONS E PLANOS REMOVIDOS TEMPORARIAMENTE */}
                {/* <Route path="/meus-cupons" element={<MeusCupons />} /> */}
                {/* <Route path="/emitir-cupom" element={<EmitirCupom />} /> */}
                {/* <Route path="/planos-pagamento" element={<PlanosPagamento />} /> */}
                {/* <Route path="/planos" element={<PlanosPagamento />} /> */}
                <Route path="/meus-favoritos" element={<LazyRoute><MeusFavoritos /></LazyRoute>} />
                <Route path="/politica-privacidade" element={<LazyRoute><PoliticaPrivacidade /></LazyRoute>} />
                <Route path="/termos-uso" element={<LazyRoute><TermosUso /></LazyRoute>} />
                <Route path="/forgot-password" element={<LazyRoute><ForgotPassword /></LazyRoute>} />
                <Route path="/update-password" element={<LazyRoute><ResetPassword /></LazyRoute>} />
                <Route path="/auth" element={<LazyRoute><SmartAuth /></LazyRoute>} />
                <Route path="/auth/callback" element={<LazyRoute><AuthCallback /></LazyRoute>} />
                <Route path="/selecionar-perfil" element={<LazyRoute><SelecionarPerfil /></LazyRoute>} />
                <Route path="/cadastro/aniversariante" element={<LazyRoute><CadastroAniversariante /></LazyRoute>} />
                <Route path="/login/aniversariante" element={<LazyRoute><LoginAniversariante /></LazyRoute>} />
                <Route path="/area-aniversariante" element={<LazyRoute><AreaAniversariante /></LazyRoute>} />
                <Route path="/cadastro/estabelecimento" element={<LazyRoute><CadastroEstabelecimento /></LazyRoute>} />
                <Route path="/login/estabelecimento" element={<LazyRoute><LoginEstabelecimento /></LazyRoute>} />
                <Route path="/area-estabelecimento" element={<LazyRoute><AreaEstabelecimento /></LazyRoute>} />
                <Route path="/estabelecimento/dashboard" element={<LazyRoute><AreaEstabelecimento /></LazyRoute>} />
                <Route path="/login/colaborador" element={<LazyRoute><LoginColaborador /></LazyRoute>} />
                <Route path="/area-colaborador" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/setup-admin" element={<LazyRoute><SetupAdmin /></LazyRoute>} />
                <Route path="/admin" element={<LazyRoute><AdminLogin /></LazyRoute>} />
                <Route path="/admin/dashboard" element={<LazyRoute><AdminDashboard /></LazyRoute>} />
                <Route path="/admin/import" element={<LazyRoute><AdminImport /></LazyRoute>} />
                <Route path="/afiliado" element={<LazyRoute><Afiliado /></LazyRoute>} />
                <Route path="/selecionar-categoria" element={<LazyRoute><SelecionarCategoria /></LazyRoute>} />
                
                {/* Redirects para rotas legadas */}
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/login-estabelecimento" element={<Navigate to="/login/estabelecimento" replace />} />
                <Route path="/login-aniversariante" element={<Navigate to="/auth" replace />} />
                <Route path="/entrar" element={<Navigate to="/auth" replace />} />
                <Route path="/cadastro" element={<Navigate to="/auth" replace />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/registro" element={<Navigate to="/auth" replace />} />
                
                <Route path="*" element={<LazyRoute><NotFound /></LazyRoute>} />
              </Routes>
            </PageTransition>
            <CookieConsent />
          </ErrorBoundary>
          </AnalyticsProvider>
        </BrowserRouter>
      </Sentry.ErrorBoundary>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
