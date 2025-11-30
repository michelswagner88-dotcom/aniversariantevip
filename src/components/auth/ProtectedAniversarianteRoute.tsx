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
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // 1. Verificar se tem sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.log('ProtectedAniversariante: Sem sessão');
          if (mounted) {
            setRedirectTo('/auth');
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 2. Verificar role do usuário
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!roleData || roleData.role !== 'aniversariante') {
          console.log('ProtectedAniversariante: Usuário não é aniversariante');
          if (mounted) {
            setRedirectTo('/');
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 3. CRÍTICO: Verificar se cadastro está COMPLETO com TODOS os campos obrigatórios
        const { data: aniversariante, error: anivError } = await supabase
          .from('aniversariantes')
          .select('id, cadastro_completo, cpf, data_nascimento, telefone, cidade, estado, cep, logradouro, bairro')
          .eq('id', session.user.id)
          .maybeSingle();

        if (anivError || !aniversariante) {
          console.log('ProtectedAniversariante: Aniversariante não encontrado - redirecionando para cadastro');
          if (mounted) {
            setRedirectTo('/auth');
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 4. Verificar flag cadastro_completo E campos obrigatórios
        const camposObrigatorios = {
          cpf: aniversariante.cpf,
          data_nascimento: aniversariante.data_nascimento,
          telefone: aniversariante.telefone,
          cidade: aniversariante.cidade,
          estado: aniversariante.estado,
          cep: aniversariante.cep,
          logradouro: aniversariante.logradouro,
          bairro: aniversariante.bairro,
        };

        const camposFaltando = Object.entries(camposObrigatorios)
          .filter(([_, value]) => !value || value === '')
          .map(([key, _]) => key);

        if (!aniversariante.cadastro_completo || camposFaltando.length > 0) {
          console.log('ProtectedAniversariante: Cadastro incompleto - campos faltando:', camposFaltando);
          if (mounted) {
            // Redirecionar para completar cadastro com flag
            sessionStorage.setItem('needsCompletion', 'true');
            sessionStorage.setItem('forceStep2', 'true');
            setRedirectTo('/auth');
            setIsAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // 5. Tudo OK - autorizado
        console.log('ProtectedAniversariante: Autorizado');
        if (mounted) {
          setIsAuthorized(true);
          setLoading(false);
        }

      } catch (error) {
        console.error('ProtectedAniversariante: Erro na verificação', error);
        if (mounted) {
          setRedirectTo('/auth');
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
          setRedirectTo('/auth');
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

  if (redirectTo) {
    if (redirectTo === '/auth' && !isAuthorized) {
      toast.error('Complete seu cadastro para acessar esta página');
    }
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    toast.error('Faça login para acessar esta página');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAniversarianteRoute;
