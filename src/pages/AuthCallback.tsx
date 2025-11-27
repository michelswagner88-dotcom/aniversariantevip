import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processando callback do Google OAuth...');
        
        // Verificar se o usuário foi autenticado
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Erro ao obter sessão:', sessionError);
          setError('Erro no login. Tente novamente.');
          toast.error('Erro no login', {
            description: 'Não foi possível completar a autenticação. Tente novamente.',
          });
          setTimeout(() => navigate('/auth'), 2000);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Login OK, usuário:', session.user.email);
          
          // Verificar se tem role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          
          // Se não tem role, criar (primeira vez com Google)
          if (!roleData) {
            console.log('📝 Criando perfil e role para novo usuário Google...');
            
            try {
              await supabase.from('profiles').insert({
                id: session.user.id,
                email: session.user.email!,
                nome: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
              });

              await supabase.from('user_roles').insert({
                user_id: session.user.id,
                role: 'aniversariante',
              });
            } catch (err) {
              console.error('Erro ao criar profile/role:', err);
            }
          }
          
          // Verificar se precisa completar cadastro (CPF, data nascimento)
          const { data: anivData } = await supabase
            .from('aniversariantes')
            .select('cpf, data_nascimento')
            .eq('id', session.user.id)
            .single();
          
          // Pegar redirecionamento salvo
          const redirectTo = sessionStorage.getItem('redirectAfterLogin');
          
          if (!anivData?.cpf || !anivData?.data_nascimento) {
            console.log('📋 Precisa completar cadastro, redirecionando para Step 2...');
            // Precisa completar cadastro - redirecionar para /auth que detectará Step 2
            sessionStorage.removeItem('redirectAfterLogin');
            navigate('/auth', { replace: true });
          } else if (redirectTo) {
            console.log('🎯 Redirecionando para:', redirectTo);
            sessionStorage.removeItem('redirectAfterLogin');
            toast.success('Login realizado!', {
              description: 'Bem-vindo de volta!',
            });
            navigate(redirectTo, { replace: true });
          } else {
            console.log('🏠 Redirecionando para dashboard...');
            toast.success('Login realizado!', {
              description: 'Bem-vindo de volta!',
            });
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('⚠️ Sem sessão, voltando para login...');
          setError('Não foi possível fazer login. Tente novamente.');
          setTimeout(() => navigate('/auth'), 2000);
        }
      } catch (err) {
        console.error('❌ Erro no callback:', err);
        setError('Erro inesperado. Redirecionando...');
        toast.error('Erro inesperado', {
          description: 'Ocorreu um erro ao processar o login. Tente novamente.',
        });
        setTimeout(() => navigate('/auth'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center space-y-6">
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 text-lg font-medium">{error}</p>
            <p className="text-slate-400 text-sm">Redirecionando...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-violet-400" />
            <div className="space-y-2">
              <p className="text-white text-xl font-semibold">Finalizando login...</p>
              <p className="text-slate-400 text-sm">Aguarde enquanto processamos sua autenticação</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
