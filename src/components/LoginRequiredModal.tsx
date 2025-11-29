import { X, UserPlus, LogIn, Gift, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl?: string;
}

const LoginRequiredModal = ({ isOpen, onClose, returnUrl }: LoginRequiredModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCadastrar = () => {
    if (returnUrl) {
      sessionStorage.setItem('redirectAfterLogin', returnUrl);
    }
    navigate('/auth');
    onClose();
  };

  const handleEntrar = () => {
    if (returnUrl) {
      sessionStorage.setItem('redirectAfterLogin', returnUrl);
    }
    navigate('/auth');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-800">
        
        <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Gift className="w-8 h-8 text-white" />
          </div>
          
          <Sparkles className="absolute top-4 left-4 w-5 h-5 text-white/40" />
          <Sparkles className="absolute top-6 right-6 w-4 h-4 text-white/30" />
          <Sparkles className="absolute bottom-4 right-4 w-5 h-5 text-white/40" />
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Quer ver o benefício?
          </h2>
          
          <p className="text-gray-400 mb-6">
            Cadastre-se gratuitamente para desbloquear benefícios exclusivos de aniversário!
          </p>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Com sua conta você pode:
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Ver benefícios exclusivos
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Salvar estabelecimentos favoritos
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                Compartilhar cupons
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-green-400">✓</span>
                100% grátis, sempre!
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCadastrar}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 py-6 text-lg h-auto"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Cadastrar Grátis
            </Button>
            
            <Button
              onClick={handleEntrar}
              variant="outline"
              className="w-full py-5 h-auto border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Já tenho conta
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Leva menos de 1 minuto para cadastrar
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginRequiredModal;
