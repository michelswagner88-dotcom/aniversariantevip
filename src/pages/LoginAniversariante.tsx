import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LoginAniversariante = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redireciona automaticamente para a nova tela de autenticação
    navigate('/auth', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  );
};

export default LoginAniversariante;
