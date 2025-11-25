import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Loader2 } from "lucide-react";
import ChatAssistant from "@/components/ChatAssistant";
import { PageTransition } from "@/components/PageTransition";
import Index from "./pages/Index";
import CadastroAniversariante from "./pages/CadastroAniversariante";
import LoginAniversariante from "./pages/LoginAniversariante";
import AreaAniversariante from "./pages/AreaAniversariante";
import CadastroEstabelecimento from "./pages/CadastroEstabelecimento";
import PlanosPagamento from "./pages/PlanosPagamento";
import SelecionarCategoria from "./pages/SelecionarCategoria";
import LoginEstabelecimento from "./pages/LoginEstabelecimento";
import AreaEstabelecimento from "./pages/AreaEstabelecimento";
import LoginColaborador from "./pages/LoginColaborador";
import AreaColaborador from "./pages/AreaColaborador";
import SetupAdmin from "./pages/SetupAdmin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Afiliado from "./pages/Afiliado";
import NotFound from "./pages/NotFound";
import ComoFunciona from "./pages/ComoFunciona";
import SejaParceito from "./pages/SejaParceito";
import FAQ from "./pages/FAQ";
import MeusCupons from "./pages/MeusCupons";
import MeusFavoritos from "./pages/MeusFavoritos";
import EmitirCupom from "./pages/EmitirCupom";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosUso from "./pages/TermosUso";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Explorar from "./pages/Explorar";
import EstabelecimentoDetalhes from "./pages/EstabelecimentoDetalhes";
import SmartAuth from "./pages/SmartAuth";
import SelecionarPerfil from "./pages/SelecionarPerfil";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vip-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ChatAssistant />
        <BrowserRouter>
          <PageTransition>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Index />} />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/estabelecimento/:id" element={<EstabelecimentoDetalhes />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
                <Route path="/seja-parceiro" element={<SejaParceito />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/meus-cupons" element={<MeusCupons />} />
                <Route path="/meus-favoritos" element={<MeusFavoritos />} />
                <Route path="/emitir-cupom" element={<EmitirCupom />} />
                <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/termos-uso" element={<TermosUso />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<ResetPassword />} />
                <Route path="/auth" element={<SmartAuth />} />
                <Route path="/selecionar-perfil" element={<SelecionarPerfil />} />
                <Route path="/cadastro/aniversariante" element={<CadastroAniversariante />} />
                <Route path="/login/aniversariante" element={<LoginAniversariante />} />
                <Route path="/area-aniversariante" element={<AreaAniversariante />} />
                <Route path="/cadastro/estabelecimento" element={<CadastroEstabelecimento />} />
                <Route path="/login/estabelecimento" element={<LoginEstabelecimento />} />
                <Route path="/area-estabelecimento" element={<AreaEstabelecimento />} />
                <Route path="/login/colaborador" element={<LoginColaborador />} />
                <Route path="/area-colaborador" element={<AreaColaborador />} />
                <Route path="/setup-admin" element={<SetupAdmin />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/afiliado" element={<Afiliado />} />
                <Route path="/selecionar-categoria" element={<SelecionarCategoria />} />
                <Route path="/planos-pagamento" element={<PlanosPagamento />} />
                <Route path="/planos" element={<PlanosPagamento />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageTransition>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
