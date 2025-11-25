import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isValidCPF } from '@/lib/validation';
import ChatAssistant from '@/components/ChatAssistant';
import { useFormBehaviorMonitor } from '@/hooks/useFormBehaviorMonitor';
import { BackButton } from '@/components/BackButton';

// --- Componentes UI (Inputs com estilo Glass) ---
const InputGroup = ({ icon: Icon, label, onFocus, onBlur, ...props }: any) => (
  <div className="mb-4 space-y-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">{label}</label>
    <div className="group relative flex items-center">
      <div className="absolute left-4 text-slate-500 transition-colors group-focus-within:text-violet-400">
        <Icon size={18} />
      </div>
      <input
        {...props}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/50 focus:bg-white/10 focus:ring-4 focus:ring-violet-500/10"
      />
    </div>
  </div>
);

const SmartAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1 = Básico/Google, 2 = Completion (CPF + Data)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(false); // Toggle entre Login e Cadastro
  const chatAssistantRef = useRef<((msg: string) => void) | null>(null);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    cpf: '', 
    dataNascimento: '',
  });

  const [rememberMe, setRememberMe] = useState(true); // Manter conectado por padrão

  // Hook de monitoramento comportamental
  const { trackFieldFocus, trackFieldBlur, trackValidationError, trackServerError } = useFormBehaviorMonitor(
    (trigger) => {
      if (chatAssistantRef.current) {
        chatAssistantRef.current(trigger.message);
      }
    },
    true // Sempre habilitado
  );

  // Verifica se já está logado e se precisa completar cadastro
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verifica se tem role de aniversariante
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (!roleData) {
          // Primeira vez logando (provavelmente via Google), cria profile e role
          try {
            await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email!,
              nome: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            });

            await supabase.from('user_roles').insert({
              user_id: session.user.id,
              role: 'aniversariante',
            });

            // Precisa completar cadastro
            setUserId(session.user.id);
            setStep(2);
            return;
          } catch (error) {
            console.error('Erro ao criar profile/role:', error);
          }
        }
        
        if (roleData?.role === 'aniversariante') {
          // Verifica se já completou o cadastro (tem CPF)
          const { data: anivData } = await supabase
            .from('aniversariantes')
            .select('cpf')
            .eq('id', session.user.id)
            .single();
          
          if (!anivData?.cpf) {
            // Precisa completar cadastro, vai para Step 2
            setUserId(session.user.id);
            setStep(2);
          } else {
            // Cadastro completo, redireciona para home
            navigate('/');
          }
        }
      }
    };
    checkSession();

    // Listener para mudanças de auth (retorno do Google OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Máscara de Telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    setFormData({ ...formData, phone: value });

    // Validar telefone quando completo
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length > 0 && cleanPhone.length !== 11) {
      trackValidationError('telefone', 'WhatsApp deve ter 11 dígitos (DDD + 9)');
    }
  };

  // Máscara de CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setFormData({ ...formData, cpf: value });

    // Validar CPF quando completo
    const cleanCPF = value.replace(/\D/g, '');
    if (cleanCPF.length === 11 && !isValidCPF(cleanCPF)) {
      trackValidationError('cpf', 'CPF inválido');
    }
  };

  // Lógica: LOGIN via E-mail
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Se "Manter conectado" estiver desmarcado, configura sessão temporária
      if (!rememberMe && data.session) {
        // Move a sessão para sessionStorage (expira ao fechar navegador)
        sessionStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
        localStorage.removeItem('supabase.auth.token');
      }

      if (error) throw error;

      // Verifica role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleData?.role !== 'aniversariante') {
        await supabase.auth.signOut();
        throw new Error('Esta conta não é de aniversariante.');
      }

      // Verifica se já completou o cadastro (tem CPF)
      const { data: anivData } = await supabase
        .from('aniversariantes')
        .select('cpf')
        .eq('id', data.user.id)
        .single();

      if (!anivData?.cpf) {
        // Precisa completar cadastro
        setUserId(data.user.id);
        setStep(2);
        return;
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta ao Aniversariante VIP.",
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
      trackServerError(500, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica: Cadastro via E-mail (Fase 1)
  const handleBasicSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validações básicas
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      // Validação de telefone (11 dígitos: DDD + 9 dígitos)
      const phoneClean = formData.phone.replace(/\D/g, '');
      if (phoneClean.length !== 11) {
        throw new Error("WhatsApp deve ter 11 dígitos (DDD + número com 9). Ex: (11) 99999-9999");
      }

      if (formData.password.length < 6) {
        throw new Error("Senha deve ter pelo menos 6 caracteres.");
      }

      // Verifica se email já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        setError("Este e-mail já possui cadastro. Tente fazer login.");
        setIsLoading(false);
        return;
      }

      // Cria usuário no Supabase Auth
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: formData.name,
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error("Erro ao criar usuário.");

      setUserId(data.user.id);

      // Salva no profiles
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: formData.email,
        nome: formData.name,
      });

      // Atribui role
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'aniversariante',
      });

      // Sucesso: Vai para Fase 2
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
      trackServerError(500, err.message);
      if (err.message.includes('11 dígitos')) {
        trackValidationError('telefone', 'Formato de telefone inválido');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica: Login/Cadastro com Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) throw error;

      // Após redirect, o useEffect verificará se precisa completar cadastro
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login com Google.");
      trackServerError(500, err.message);
      setIsLoading(false);
    }
  };

  // Lógica: Finalização (Fase 2) - CPF + Data de Nascimento
  const handleCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validação de telefone OBRIGATÓRIO (11 dígitos: DDD + 9 dígitos)
      const telefone = formData.phone ? formData.phone.replace(/\D/g, '') : '';
      if (!telefone || telefone.length !== 11) {
        throw new Error("WhatsApp deve ter 11 dígitos (DDD + número com 9). Ex: (11) 99999-9999");
      }

      // Validação de CPF
      const cpfClean = formData.cpf.replace(/\D/g, '');
      if (!isValidCPF(formData.cpf)) {
        throw new Error("CPF inválido. Verifique os dígitos verificadores.");
      }

      // Validação de data de nascimento
      if (!formData.dataNascimento) {
        throw new Error("Data de nascimento é obrigatória.");
      }

      // Verifica se CPF já existe
      const { data: existingCPF } = await supabase
        .from('aniversariantes')
        .select('id')
        .eq('cpf', cpfClean)
        .single();

      if (existingCPF) {
        throw new Error("Este CPF já está cadastrado.");
      }

      // Insere na tabela aniversariantes
      const { error: insertError } = await supabase
        .from('aniversariantes')
        .insert({
          id: userId!,
          cpf: cpfClean,
          telefone: telefone,
          data_nascimento: formData.dataNascimento,
        });

      if (insertError) throw insertError;

      toast({
        title: "Cadastro finalizado!",
        description: "Sua conta VIP está pronta. Bem-vindo! 🎉",
      });

      // Redireciona para home
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erro ao finalizar cadastro.");
      trackServerError(500, err.message);
      if (err.message.includes('CPF inválido')) {
        trackValidationError('cpf', 'CPF com dígitos verificadores inválidos');
      }
      if (err.message.includes('11 dígitos')) {
        trackValidationError('telefone', 'Formato de telefone inválido');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 font-inter">
      {/* Background Tech */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
        
        {/* Botão Voltar */}
        <div className="absolute top-4 left-4 z-20">
          <BackButton to="/" />
        </div>
        
        {/* Barra de Progresso */}
        <div className="h-1 w-full bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '30%' : '100%' }}
          ></div>
        </div>

        <div className="p-8">
          {/* Cabeçalho */}
          <div className="mb-6 text-center">
            <h2 className="font-plus-jakarta text-2xl font-extrabold text-white">
              {step === 1 ? (isLogin ? 'Bem-vindo de Volta' : 'Comece a Celebrar') : 'Última etapa!'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {step === 1 
                ? (isLogin ? 'Entre na sua conta VIP.' : 'Crie sua conta gratuita para acessar benefícios.') 
                : 'Informe seu CPF e data de nascimento para validar sua identidade VIP.'}
            </p>
          </div>

          {/* --- STEP 1: ESCOLHA (Google ou Email ou Login) --- */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Botão Google */}
              {!isLogin && (
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 font-bold text-slate-900 transition-transform hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.06z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Entrar com Google
                    </>
                  )}
                </button>
              )}

              {!isLogin && (
                <div className="relative mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <span className="relative bg-slate-900 px-3 text-xs font-medium uppercase text-slate-500">ou use seu e-mail</span>
                </div>
              )}

              {/* Formulário de Email - Login ou Cadastro */}
              <form onSubmit={isLogin ? handleLogin : handleBasicSignup}>
                {!isLogin && (
                  <InputGroup 
                    icon={User} label="Nome" placeholder="Como quer ser chamado?" required
                    value={formData.name} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                    onFocus={() => trackFieldFocus('nome')}
                    onBlur={() => trackFieldBlur('nome', false)}
                  />
                )}
                <InputGroup 
                  icon={Mail} label="E-mail" type="email" placeholder="seu@email.com" required
                  value={formData.email} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                  onFocus={() => trackFieldFocus('email')}
                  onBlur={() => trackFieldBlur('email', false)}
                />
                {!isLogin && (
                  <div>
                    <InputGroup 
                      icon={Phone} label="WhatsApp" placeholder="(11) 99999-9999" required maxLength={15}
                      value={formData.phone} 
                      onChange={handlePhoneChange}
                      onFocus={() => trackFieldFocus('telefone')}
                      onBlur={() => trackFieldBlur('telefone', false)}
                    />
                    <div className="mt-1 flex items-center justify-end gap-1.5 text-xs">
                      <span className={`font-medium ${
                        formData.phone.replace(/\D/g, '').length === 11 
                          ? 'text-emerald-400' 
                          : formData.phone.replace(/\D/g, '').length > 0 
                            ? 'text-amber-400' 
                            : 'text-slate-500'
                      }`}>
                        {formData.phone.replace(/\D/g, '').length}/11 dígitos
                      </span>
                      {formData.phone.replace(/\D/g, '').length === 11 && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                )}
                <InputGroup 
                  icon={Lock} label="Senha" type="password" placeholder={isLogin ? "Digite sua senha" : "Crie uma senha forte"} required minLength={6}
                  value={formData.password} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
                  onFocus={() => trackFieldFocus('senha')}
                  onBlur={() => trackFieldBlur('senha', true)}
                />

                {/* Checkbox Manter Conectado (apenas no login) */}
                {isLogin && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-2 focus:ring-violet-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer select-none">
                        Manter-me conectado
                      </label>
                    </div>
                    {!rememberMe && (
                      <p className="mt-1.5 ml-6 text-xs text-slate-500">
                        Sua sessão expirará ao fechar o navegador
                      </p>
                    )}
                  </div>
                )}

                {isLogin && (
                  <div className="mb-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-violet-400 hover:text-violet-300 transition-colors underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button 
                  type="submit" disabled={isLoading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 py-3.5 font-bold text-white transition-all hover:brightness-110 hover:shadow-lg hover:shadow-violet-500/25 active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'Entrar' : 'Continuar'} <ArrowRight size={18} /></>}
                </button>
              </form>
            </div>
          )}

          {/* --- STEP 2: COMPLETION (CPF + Data de Nascimento + Telefone) --- */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400 shrink-0" />
                <div className="text-sm text-emerald-100">
                  <strong className="block text-emerald-400">Conta criada!</strong>
                  Falta pouco para liberar seus cupons.
                </div>
              </div>

              <form onSubmit={handleCompletion}>
                {/* Campo WhatsApp - sempre obrigatório para todos */}
                <div>
                  <InputGroup 
                    icon={Phone} label="WhatsApp (Obrigatório)" placeholder="(11) 99999-9999" required maxLength={15}
                    value={formData.phone} 
                    onChange={handlePhoneChange}
                    onFocus={() => trackFieldFocus('telefone')}
                    onBlur={() => trackFieldBlur('telefone', false)}
                  />
                  <div className="mt-1 flex items-center justify-end gap-1.5 text-xs">
                    <span className={`font-medium ${
                      formData.phone.replace(/\D/g, '').length === 11 
                        ? 'text-emerald-400' 
                        : formData.phone.replace(/\D/g, '').length > 0 
                          ? 'text-amber-400' 
                          : 'text-slate-500'
                    }`}>
                      {formData.phone.replace(/\D/g, '').length}/11 dígitos
                    </span>
                    {formData.phone.replace(/\D/g, '').length === 11 && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
                <InputGroup 
                  icon={User} label="CPF" placeholder="000.000.000-00" required maxLength={14}
                  value={formData.cpf} 
                  onChange={handleCPFChange}
                  onFocus={() => trackFieldFocus('cpf')}
                  onBlur={() => trackFieldBlur('cpf', true)}
                />
                <InputGroup 
                  icon={Calendar} label="Data de Nascimento" type="date" required
                  value={formData.dataNascimento} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, dataNascimento: e.target.value})}
                  onFocus={() => trackFieldFocus('dataNascimento')}
                  onBlur={() => trackFieldBlur('dataNascimento', false)}
                />
                
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div className="mb-6 text-center text-xs text-slate-500">
                  🔒 Seus dados são protegidos e usados apenas para validar o benefício junto ao estabelecimento.
                </div>

                <button 
                  type="submit" disabled={isLoading}
                  className="w-full rounded-xl bg-white py-3.5 font-bold text-slate-900 transition-all hover:bg-slate-200 hover:shadow-lg active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Finalizar e Acessar Cupons 🚀'}
                </button>
              </form>
            </div>
          )}

          {/* Login/Cadastro Toggle */}
          {step === 1 && (
            <p className="mt-6 text-center text-sm text-slate-500">
              {isLogin ? 'Novo por aqui?' : 'Já é VIP?'} {' '}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="font-bold text-violet-400 hover:text-violet-300 hover:underline"
              >
                {isLogin ? 'Criar Conta' : 'Fazer Login'}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Chat Assistente com monitoramento ativo */}
      <ChatAssistant onMount={(sendMessage) => { chatAssistantRef.current = sendMessage; }} />
    </div>
  );
};

export default SmartAuth;
