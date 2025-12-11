import { useEffect, useCallback } from "react";
import { X, UserPlus, LogIn, Gift, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl?: string;
}

const LoginRequiredModal = ({ isOpen, onClose, returnUrl }: LoginRequiredModalProps) => {
  const navigate = useNavigate();

  // Fechar com Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevenir scroll do body
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const saveReturnUrl = () => {
    if (returnUrl) {
      sessionStorage.setItem("redirectAfterLogin", returnUrl);
    }
  };

  const handleCadastrar = () => {
    saveReturnUrl();
    navigate("/auth?modo=cadastro");
    onClose();
  };

  const handleEntrar = () => {
    saveReturnUrl();
    navigate("/auth?modo=login");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-800">
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Gift className="w-8 h-8 text-white" aria-hidden="true" />
          </div>

          <Sparkles className="absolute top-4 left-4 w-5 h-5 text-white/40" aria-hidden="true" />
          <Sparkles className="absolute top-6 right-6 w-4 h-4 text-white/30" aria-hidden="true" />
          <Sparkles className="absolute bottom-4 right-4 w-5 h-5 text-white/40" aria-hidden="true" />

          {/* Botão fechar - 44px touch target */}
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-2 right-2 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" aria-hidden="true" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 text-center">
          <h2 id="login-modal-title" className="text-xl font-bold text-white mb-2">
            Quer ver o benefício?
          </h2>

          <p className="text-gray-400 mb-6">
            Crie sua conta grátis e aproveite vantagens exclusivas no seu aniversário!
          </p>

          {/* Lista de benefícios */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Com sua conta você pode:</p>
            <ul className="space-y-2">
              {[
                "Desbloquear benefícios de aniversário",
                "Salvar estabelecimentos favoritos",
                "Receber alertas de novos parceiros",
                "100% grátis, sempre!",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400" aria-hidden="true">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={handleCadastrar}
              className="w-full min-h-[52px] bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 py-4 text-base h-auto"
            >
              <UserPlus className="w-5 h-5 mr-2" aria-hidden="true" />
              Criar Conta Grátis
            </Button>

            <Button
              onClick={handleEntrar}
              variant="outline"
              className="w-full min-h-[48px] py-3.5 h-auto border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
              Já tenho conta
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">Leva menos de 1 minuto</p>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
