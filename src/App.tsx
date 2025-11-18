import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CadastroAniversariante from "./pages/CadastroAniversariante";
import LoginAniversariante from "./pages/LoginAniversariante";
import AreaAniversariante from "./pages/AreaAniversariante";
import CadastroEstabelecimento from "./pages/CadastroEstabelecimento";
import LoginEstabelecimento from "./pages/LoginEstabelecimento";
import AreaEstabelecimento from "./pages/AreaEstabelecimento";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cadastro/aniversariante" element={<CadastroAniversariante />} />
          <Route path="/login/aniversariante" element={<LoginAniversariante />} />
          <Route path="/area-aniversariante" element={<AreaAniversariante />} />
          <Route path="/cadastro/estabelecimento" element={<CadastroEstabelecimento />} />
          <Route path="/login/estabelecimento" element={<LoginEstabelecimento />} />
          <Route path="/area-estabelecimento" element={<AreaEstabelecimento />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
