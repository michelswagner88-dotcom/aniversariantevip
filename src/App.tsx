import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Loader2 } from "lucide-react";
import ChatAssistant from "@/components/ChatAssistant";
import { PageTransition } from "@/components/PageTransition";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import CadastroAniversariante from "./pages/CadastroAniversariante";
import LoginAniversariante from "./pages/LoginAniversariante";
import AreaAniversariante from "./pages/AreaAniversariante";
import CadastroEstabelecimento from "./pages/CadastroEstabelecimento";
// import PlanosPagamento from "./pages/PlanosPagamento"; // REMOVIDO TEMPORARIAMENTE
import SelecionarCategoria from "./pages/SelecionarCategoria";
import LoginEstabelecimento from "./pages/LoginEstabelecimento";
import AreaEstabelecimento from "./pages/AreaEstabelecimento";
import LoginColaborador from "./pages/LoginColaborador";
import AreaColaborador from "./pages/AreaColaborador";
import SetupAdmin from "./pages/SetupAdmin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminImport from "./pages/AdminImport";
import EditarEstabelecimentoAdmin from "./pages/EditarEstabelecimentoAdmin";
import Afiliado from "./pages/Afiliado";
import NotFound from "./pages/NotFound";
import ComoFunciona from "./pages/ComoFunciona";
import SejaParceito from "./pages/SejaParceito";
import FAQ from "./pages/FAQ";
// import MeusCupons from "./pages/MeusCupons"; // REMOVIDO TEMPORARIAMENTE
import MeusFavoritos from "./pages/MeusFavoritos";
// import EmitirCupom from "./pages/EmitirCupom"; // REMOVIDO TEMPORARIAMENTE
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosUso from "./pages/TermosUso";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Explorar from "./pages/Explorar";
import EstabelecimentoDetalhes from "./pages/EstabelecimentoDetalhes";
import SmartAuth from "./pages/SmartAuth";
import SelecionarPerfil from "./pages/SelecionarPerfil";
import FlashDeals from "./pages/FlashDeals";
import Feed from "./pages/Feed";
import AuthCallback from "./pages/AuthCallback";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vip-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ChatAssistant />
        <BrowserRouter>
          <ErrorBoundary>
            <PageTransition>
              <Suspense fallback={<LoadingScreen />}>
                <BottomNav />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/explorar" element={<Explorar />} />
                  <Route path="/flash-deals" element={<FlashDeals />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/estabelecimento/:id" element={<EstabelecimentoDetalhes />} />
                  <Route path="/como-funciona" element={<ComoFunciona />} />
                  <Route path="/seja-parceiro" element={<SejaParceito />} />
                  <Route path="/faq" element={<FAQ />} />
                  {/* CUPONS E PLANOS REMOVIDOS TEMPORARIAMENTE */}
                  {/* <Route path="/meus-cupons" element={<MeusCupons />} /> */}
                  {/* <Route path="/emitir-cupom" element={<EmitirCupom />} /> */}
                  {/* <Route path="/planos-pagamento" element={<PlanosPagamento />} /> */}
                  {/* <Route path="/planos" element={<PlanosPagamento />} /> */}
                  <Route path="/meus-favoritos" element={<MeusFavoritos />} />
                  <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
                  <Route path="/termos-uso" element={<TermosUso />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/update-password" element={<ResetPassword />} />
                  <Route path="/auth" element={<SmartAuth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/selecionar-perfil" element={<SelecionarPerfil />} />
                  <Route path="/cadastro/aniversariante" element={<CadastroAniversariante />} />
                  <Route path="/login/aniversariante" element={<LoginAniversariante />} />
                  <Route path="/area-aniversariante" element={<AreaAniversariante />} />
                  <Route path="/cadastro/estabelecimento" element={<CadastroEstabelecimento />} />
                  <Route path="/login/estabelecimento" element={<LoginEstabelecimento />} />
                  <Route path="/area-estabelecimento" element={<AreaEstabelecimento />} />
                  <Route path="/estabelecimento/dashboard" element={<AreaEstabelecimento />} />
                  <Route path="/login/colaborador" element={<LoginColaborador />} />
                  <Route path="/area-colaborador" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/setup-admin" element={<SetupAdmin />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/import" element={<AdminImport />} />
                  <Route path="/admin/estabelecimento/:id/editar" element={<EditarEstabelecimentoAdmin />} />
                  <Route path="/afiliado" element={<Afiliado />} />
                  <Route path="/selecionar-categoria" element={<SelecionarCategoria />} />
                  
                  {/* Redirects para rotas legadas */}
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/login-estabelecimento" element={<Navigate to="/login/estabelecimento" replace />} />
                  <Route path="/login-aniversariante" element={<Navigate to="/auth" replace />} />
                  <Route path="/entrar" element={<Navigate to="/auth" replace />} />
                  <Route path="/cadastro" element={<Navigate to="/auth" replace />} />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  <Route path="/registro" element={<Navigate to="/auth" replace />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PageTransition>
            <CookieConsent />
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
);

export default App;
