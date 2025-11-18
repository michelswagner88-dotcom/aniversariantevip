import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CadastroAniversariante from "./pages/CadastroAniversariante";
import LoginAniversariante from "./pages/LoginAniversariante";
import AreaAniversariante from "./pages/AreaAniversariante";
import CadastroEstabelecimento from "./pages/CadastroEstabelecimento";
import LoginEstabelecimento from "./pages/LoginEstabelecimento";
import AreaEstabelecimento from "./pages/AreaEstabelecimento";
import CupomView from "./pages/CupomView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro/aniversariante" element={<CadastroAniversariante />} />
          <Route path="/login/aniversariante" element={<LoginAniversariante />} />
          <Route path="/area-aniversariante" element={<AreaAniversariante />} />
          <Route path="/cadastro/estabelecimento" element={<CadastroEstabelecimento />} />
          <Route path="/login/estabelecimento" element={<LoginEstabelecimento />} />
          <Route path="/area-estabelecimento" element={<AreaEstabelecimento />} />
          <Route path="/cupom/:id" element={<CupomView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
