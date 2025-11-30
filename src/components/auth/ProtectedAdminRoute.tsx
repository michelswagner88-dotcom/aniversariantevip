import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldAlert } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

// Verificar se usuário é admin usando banco de dados (role + tabela admins)
const checkIsAdmin = async (userId: string): Promise<{ 
  isAdmin: boolean; 
  nivel?: string;
  adminId?: string;
}> => {
  try {
    // 1. Verificar na tabela user_roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'colaborador'])
      .maybeSingle();

    if (roleError) {
      console.error('Erro ao verificar role:', roleError);
      return { isAdmin: false };
    }

    if (!roleData) {
      return { isAdmin: false };
    }

    // 2. Verificar na tabela admins
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, nivel, ativo')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminError) {
      console.error('Erro ao verificar admins:', adminError);
      return { isAdmin: false };
    }

    // Admin deve estar na tabela admins E estar ativo
    if (!adminData || !adminData.ativo) {
      return { isAdmin: false };
    }

    return { 
      isAdmin: true, 
      nivel: adminData.nivel,
      adminId: adminData.id
    };
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return { isAdmin: false };
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.warn('Admin: Tentativa de acesso sem sessão');
          setError('Acesso não autorizado');
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const user = session.user;

        // Verificar se é admin (role + tabela admins)
        const adminCheck = await checkIsAdmin(user.id);
        
        if (!adminCheck.isAdmin) {
          console.warn(`Admin: Acesso negado para ${user.email}`);
          
          // Log de tentativa de acesso não autorizado - usar tabela dedicada
          try {
            await supabase.from('admin_access_logs').insert({
              user_id: user.id,
              email: user.email || '',
              action: 'access_denied',
              endpoint: location.pathname,
              authorized: false,
              metadata: {
                reason: 'missing_admin_role',
                timestamp: new Date().toISOString(),
              }
            });
          } catch (logError) {
            console.error('Erro ao logar acesso negado:', logError);
          }

          setError('Você não tem permissão para acessar esta área');
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        // 3. Atualizar último acesso
        try {
          await supabase.rpc('update_admin_last_access', { 
            admin_user_id: user.id 
          });
        } catch (accessError) {
          console.error('Erro ao atualizar último acesso:', accessError);
        }

        // 4. Log de acesso autorizado
        try {
          await supabase.from('admin_access_logs').insert({
            user_id: user.id,
            email: user.email || '',
            action: 'access_authorized',
            endpoint: location.pathname,
            authorized: true,
            metadata: {
              nivel: adminCheck.nivel,
              adminId: adminCheck.adminId,
              timestamp: new Date().toISOString(),
            }
          });
        } catch (logError) {
          console.error('Erro ao logar acesso autorizado:', logError);
        }

        console.log(`Admin: Acesso autorizado para ${user.email} (${adminCheck.nivel})`);
        setIsAuthorized(true);

        // 5. Verificação periódica de role a cada 5 minutos
        const roleCheckInterval = setInterval(async () => {
          const stillAdmin = await checkIsAdmin(user.id);
          
          if (!stillAdmin.isAdmin) {
            console.warn('Admin: Permissões removidas, forçando logout');
            
            // Log role removida
            try {
              await supabase.from('admin_access_logs').insert({
                user_id: user.id,
                email: user.email || '',
                action: 'role_revoked',
                endpoint: location.pathname,
                authorized: false,
                metadata: { reason: 'permissions_removed_during_session' }
              });
            } catch (logError) {
              console.error('Erro ao logar revogação de permissões:', logError);
            }
            
            // Forçar logout
            await supabase.auth.signOut();
            setIsAuthorized(false);
            setError('Suas permissões foram removidas. Faça login novamente.');
          }
        }, 5 * 60 * 1000); // 5 minutos

        // Cleanup do interval quando componente desmontar
        return () => clearInterval(roleCheckInterval);

      } catch (err) {
        console.error('Admin: Erro na verificação', err);
        setError('Erro ao verificar permissões');
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

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

  // Não autorizado
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
          <p className="text-gray-400 mb-6">{error || 'Você não tem permissão para acessar esta área.'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Voltar ao Início
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Se você deveria ter acesso, entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
