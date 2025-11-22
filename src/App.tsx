import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";
import { Loader2 } from "lucide-react";
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
import NotFound from "./pages/NotFound";
import ComoFunciona from "./pages/ComoFunciona";
import SejaParceito from "./pages/SejaParceito";
import FAQ from "./pages/FAQ";

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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/seja-parceiro" element={<SejaParceito />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/cadastro/aniversariante" element={<CadastroAniversariante />} />
            <Route path="/login/aniversariante" element={<LoginAniversariante />} />
            <Route path="/area-aniversariante" element={<AreaAniversariante />} />
            <Route path="/cadastro/estabelecimento" element={<CadastroEstabelecimento />} />
            <Route path="/login/estabelecimento" element={<LoginEstabelecimento />} />
            <Route path="/area-estabelecimento" element={<AreaEstabelecimento />} />
            <Route path="/login/colaborador" element={<LoginColaborador />} />
            <Route path="/area-colaborador" element={<AreaColaborador />} />
            <Route path="/setup-admin" element={<SetupAdmin />} />
            <Route path="/selecionar-categoria" element={<SelecionarCategoria />} />
            <Route path="/planos-pagamento" element={<PlanosPagamento />} />
            <Route path="/planos" element={<PlanosPagamento />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
