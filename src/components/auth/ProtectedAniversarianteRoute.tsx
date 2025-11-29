import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: React.ReactNode;
}

export const ProtectedAniversarianteRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (mounted) {
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // Verificar se é aniversariante
        const { data: aniversariante } = await supabase
          .from('aniversariantes')
          .select('id, cpf')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!aniversariante || !aniversariante.cpf) {
          if (mounted) {
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setIsAuthorized(true);
          setLoading(false);
        }

      } catch (error) {
        console.error('Erro na verificação:', error);
        if (mounted) {
          setIsAuthorized(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (mounted) {
          setIsAuthorized(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    toast.error('Faça login para acessar esta página');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAniversarianteRoute;
