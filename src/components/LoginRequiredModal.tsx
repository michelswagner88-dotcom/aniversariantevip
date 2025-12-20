import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Check, X } from "lucide-react";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl?: string;
}

const LoginRequiredModal = ({ isOpen, onClose, returnUrl }: LoginRequiredModalProps) => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    onClose();
    navigate("/cadastro", { state: { returnUrl } });
  };

  const handleLogin = () => {
    onClose();
    navigate("/entrar", { state: { returnUrl } });
  };

  const benefits = [
    "Ver regras e como usar",
    "Salvar estabelecimentos nos favoritos",
    "100% grátis para aniversariantes",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 bg-white border border-zinc-200 shadow-xl rounded-2xl overflow-hidden">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors z-10"
          aria-label="Fechar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Conteúdo */}
        <div className="px-6 pt-8 pb-6">
          {/* Badge com ícone */}
          <div className="flex justify-center mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
            >
              <Gift className="w-7 h-7 text-violet-600" />
            </div>
          </div>

          {/* Título */}
          <DialogTitle className="text-xl font-semibold text-zinc-900 text-center mb-2">
            Para ver este benefício
          </DialogTitle>

          {/* Subtítulo */}
          <p className="text-sm text-zinc-500 text-center leading-relaxed mb-6">
            Crie uma conta grátis e desbloqueie benefícios de aniversário na sua cidade.
          </p>

          {/* Lista de benefícios */}
          <div className="space-y-3 mb-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-violet-600" />
                </div>
                <span className="text-sm text-zinc-700">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleCreateAccount}
              className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
            >
              Criar conta grátis
            </Button>

            <Button
              onClick={handleLogin}
              variant="outline"
              className="w-full h-12 border-zinc-200 text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 transition-colors"
            >
              Entrar
            </Button>
          </div>

          {/* Microcopy */}
          <p className="text-xs text-zinc-400 text-center mt-4">Leva menos de 1 minuto.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginRequiredModal;
