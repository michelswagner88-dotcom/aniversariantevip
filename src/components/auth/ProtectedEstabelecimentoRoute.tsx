import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: React.ReactNode;
}

export const ProtectedEstabelecimentoRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Verificar sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.log('ProtectedEstabelecimento: Sem sessão');
          if (mounted) {
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // Verificar se tem estabelecimento cadastrado (id do estabelecimento = id do usuário)
        const { data: estabelecimento, error: estabError } = await supabase
          .from('estabelecimentos')
          .select('id, ativo')
          .eq('id', session.user.id)
          .maybeSingle();

        if (estabError || !estabelecimento) {
          console.log('ProtectedEstabelecimento: Usuário não tem estabelecimento');
          if (mounted) {
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // Tudo OK
        console.log('ProtectedEstabelecimento: Autorizado');
        if (mounted) {
          setIsAuthorized(true);
          setLoading(false);
        }

      } catch (error) {
        console.error('ProtectedEstabelecimento: Erro na verificação', error);
        if (mounted) {
          setIsAuthorized(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listener para mudanças de auth
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

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não autorizado - redirecionar para login
  if (!isAuthorized) {
    toast.error('Faça login para acessar esta página');
    return <Navigate to="/login/estabelecimento" state={{ from: location }} replace />;
  }

  // Autorizado - renderizar conteúdo
  return <>{children}</>;
};

export default ProtectedEstabelecimentoRoute;
