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
        
        // Aguardar processamento da URL
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar se o usuário foi autenticado
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.error('❌ Erro ao obter sessão:', sessionError);
          setError('Erro no login. Tente novamente.');
          toast.error('Erro no login');
          setTimeout(() => navigate('/auth', { replace: true }), 2000);
          return;
        }
        
        const user = session.user;
        console.log('✅ Login OK, usuário:', user.email);
        
        // Verificar se tem role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // Se não tem role, criar (primeira vez com Google)
        if (!roleData) {
          console.log('📝 Criando perfil e role para novo usuário Google...');
          
          try {
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email!,
              nome: user.user_metadata?.full_name || user.user_metadata?.name || '',
            });

            await supabase.from('user_roles').insert({
              user_id: user.id,
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
          .eq('id', user.id)
          .maybeSingle();
        
        console.log('🔍 Dados aniversariante:', anivData);
        console.log('🔍 CPF:', anivData?.cpf);
        console.log('🔍 Data nascimento:', anivData?.data_nascimento);
        
        // VERIFICAÇÃO RIGOROSA: só considera completo se TEM cpf E data_nascimento preenchidos
        const cadastroCompleto = anivData && 
                                 anivData.cpf && 
                                 anivData.cpf.trim() !== '' && 
                                 anivData.data_nascimento;
        
        console.log('🔍 Cadastro completo?', cadastroCompleto);
        
        // Pegar redirecionamento salvo
        const redirectTo = sessionStorage.getItem('redirectAfterLogin');
        
        if (!cadastroCompleto) {
          console.log('📋 CADASTRO INCOMPLETO - Forçando Step 2...');
          // MARCA FORTE: impede que onAuthStateChange redirecione
          sessionStorage.setItem('needsCompletion', 'true');
          sessionStorage.setItem('forceStep2', 'true');
          sessionStorage.removeItem('redirectAfterLogin');
          toast.success('Conta criada! Complete seu cadastro.');
          
          // Aguardar mais tempo para garantir que sessionStorage foi salvo
          await new Promise(resolve => setTimeout(resolve, 200));
          
          navigate('/auth', { replace: true });
        } else if (redirectTo) {
          console.log('🎯 Redirecionando para:', redirectTo);
          sessionStorage.removeItem('redirectAfterLogin');
          sessionStorage.removeItem('needsCompletion');
          sessionStorage.removeItem('forceStep2');
          toast.success('Login realizado!');
          navigate(redirectTo, { replace: true });
        } else {
          console.log('🏠 Redirecionando para home...');
          sessionStorage.removeItem('needsCompletion');
          sessionStorage.removeItem('forceStep2');
          toast.success('Login realizado!');
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('❌ Erro no callback:', err);
        setError('Erro inesperado. Redirecionando...');
        toast.error('Erro inesperado');
        setTimeout(() => navigate('/auth', { replace: true }), 2000);
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
