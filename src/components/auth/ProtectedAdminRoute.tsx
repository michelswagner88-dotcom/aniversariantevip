import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

// Lista de emails autorizados como admin (ALTERAR PARA SEUS EMAILS)
const ADMIN_EMAILS = [
  'wagnermichels@hotmail.com',
  // Adicione os emails dos administradores aqui
];

// Verificar se usuário é admin usando múltiplas camadas de segurança
const checkIsAdmin = async (userId: string, email: string): Promise<boolean> => {
  try {
    // Opção 1: Verificar por email na lista branca
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
      return true;
    }

    // Opção 2: Verificar na tabela user_roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!roleError && roleData && (roleData.role === 'admin' || roleData.role === 'colaborador')) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
};

export const ProtectedAdminRoute = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Verificar se tem sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.warn('Admin: Tentativa de acesso sem sessão');
          setError('Acesso não autorizado');
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const user = session.user;

        // 2. Verificar se é admin
        const isAdmin = await checkIsAdmin(user.id, user.email || '');

        if (!isAdmin) {
          console.warn(`Admin: Acesso negado para ${user.email}`);
          
          // Log de tentativa de acesso não autorizado
          try {
            await supabase.from('analytics').insert({
              event_type: 'admin_access_denied',
              user_id: user.id,
              metadata: {
                email: user.email,
                path: location.pathname,
                timestamp: new Date().toISOString(),
              }
            });
          } catch (logError) {
            // Silencioso se falhar
          }

          setError('Você não tem permissão para acessar esta área');
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // 3. Log de acesso autorizado
        try {
          await supabase.from('analytics').insert({
            event_type: 'admin_access_authorized',
            user_id: user.id,
            metadata: {
              email: user.email,
              path: location.pathname,
              timestamp: new Date().toISOString(),
            }
          });
        } catch (logError) {
          // Silencioso se falhar
        }

        console.log(`Admin: Acesso autorizado para ${user.email}`);
        setIsAuthorized(true);

      } catch (err) {
        console.error('Admin: Erro na verificação', err);
        setError('Erro ao verificar permissões');
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthorized(false);
        setError('Sessão encerrada');
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Não autorizado - Tela de acesso negado
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Acesso Restrito
          </h1>
          
          <p className="text-gray-400 mb-6">
            {error || 'Você não tem permissão para acessar esta área.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar ao Início
            </button>
            
            <p className="text-xs text-gray-500">
              Se você deveria ter acesso, entre em contato com o administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Autorizado
  return <>{children}</>;
};

export default ProtectedAdminRoute;
