import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Mail, Lock, User, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MaskedInput from '@/components/MaskedInput';
import BuscaCepPorEndereco from '@/components/BuscaCepPorEndereco';
import { BackButton } from '@/components/BackButton';
import ChatAssistant from '@/components/ChatAssistant';
import { useInputMask } from '@/hooks/useInputMask';
import { useCheckCpfExists } from '@/hooks/useCheckCpfExists';
import { useCepLookup } from '@/hooks/useCepLookup';
import { getFriendlyErrorMessage } from '@/lib/errorTranslator';

const SmartAuth = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [showCepSearch, setShowCepSearch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    phoneMask, 
    cpfMask, 
    cepMask, 
    dateMask,
    validateCPF,
    validatePhone,
    validateBirthDate,
    validateFullName,
  } = useInputMask();
  
  const { fetchCep, loading: cepLoading } = useCepLookup();

  // Step 1: Basic info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2: Complete registration
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cep, setCep] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  // Validation states
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const [cepError, setCepError] = useState('');
  
  const isNameValid = name.trim() && validateFullName(name) && !nameError;
  const isPhoneValid = phone.replace(/\D/g, '').length === 11 && validatePhone(phone) && !phoneError;
  const isCpfValid = cpf.replace(/\D/g, '').length === 11 && validateCPF(cpf) && !cpfError;
  const isBirthDateValid = birthDate.replace(/\D/g, '').length === 8 && validateBirthDate(birthDate).valid && !birthDateError;
  const isCepValid = cep.replace(/\D/g, '').length === 8 && estado && cidade && bairro && logradouro && !cepError;
  
  // Verificação de CPF duplicado em tempo real (após declarações)
  const { exists: cpfExists, loading: cpfChecking } = useCheckCpfExists(cpf, isCpfValid && !cpfError);
  
  const isStep2Valid = isNameValid && isPhoneValid && isCpfValid && !cpfExists && !cpfChecking && isBirthDateValid && isCepValid;

  // Verificar sessão inicial
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (!roleData) {
          // Primeira vez logando (Google), criar profile e role
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

            setUserId(session.user.id);
            setStep(2);
            return;
          } catch (error) {
            console.error('Erro ao criar profile/role:', error);
          }
        }
        
        if (roleData?.role === 'aniversariante') {
          const { data: anivData } = await supabase
            .from('aniversariantes')
            .select('cpf')
            .eq('id', session.user.id)
            .single();
          
          if (!anivData?.cpf) {
            setUserId(session.user.id);
            setStep(2);
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Validações em tempo real
  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim() && !validateFullName(value)) {
      setNameError('Digite seu nome completo (nome e sobrenome)');
    } else {
      setNameError('');
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      if (!validatePhone(value)) {
        setPhoneError('Digite um celular válido com DDD');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleCpfChange = (value: string) => {
    setCpf(value);
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      if (!validateCPF(value)) {
        setCpfError('CPF inválido');
      } else if (cpfExists) {
        setCpfError('Este CPF já está cadastrado. Se for você, tente fazer login.');
      } else {
        setCpfError('');
      }
    } else {
      setCpfError('');
    }
  };

  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 8) {
      const validation = validateBirthDate(value);
      if (!validation.valid) {
        setBirthDateError(validation.message || 'Data de nascimento inválida');
      } else {
        setBirthDateError('');
      }
    } else {
      setBirthDateError('');
    }
  };

  const handleCepChange = async (value: string) => {
    setCep(value);
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 8) {
      setCepError('');
      const cepData = await fetchCep(value);
      
      if (cepData) {
        setEstado(cepData.uf);
        setCidade(cepData.localidade);
        setBairro(cepData.bairro);
        setLogradouro(cepData.logradouro);
        
        // Geocode para latitude/longitude
        try {
          const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (googleMapsKey) {
            const address = `${cepData.logradouro}, ${cepData.localidade}, ${cepData.uf}`;
            const geoResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsKey}`
            );
            const geoData = await geoResponse.json();
            
            if (geoData.results && geoData.results[0]) {
              setLatitude(geoData.results[0].geometry.location.lat);
              setLongitude(geoData.results[0].geometry.location.lng);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar coordenadas:', error);
        }
      } else {
        setCepError('CEP não encontrado');
        setEstado('');
        setCidade('');
        setBairro('');
        setLogradouro('');
      }
    }
  };

  const handleCepFoundBySearch = (foundCep: string) => {
    handleCepChange(foundCep);
    setShowCepSearch(false);
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleData?.role !== 'aniversariante') {
        await supabase.auth.signOut();
        throw new Error('Esta conta não é de aniversariante.');
      }

      const { data: anivData } = await supabase
        .from('aniversariantes')
        .select('cpf')
        .eq('id', data.user.id)
        .single();

      if (!anivData?.cpf) {
        setUserId(data.user.id);
        setStep(2);
        return;
      }

      toast.success('Login realizado!', {
        description: 'Bem-vindo de volta!',
      });

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
      toast.error('Erro ao fazer login', {
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cadastro básico (Step 1)
  const handleBasicSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Preencha email e senha');
      }

      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Erro ao criar usuário');

      setUserId(data.user.id);

      await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        nome: '',
      });

      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'aniversariante',
      });

      setStep(2);
    } catch (err: any) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
      toast.error('Erro no cadastro', {
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) throw error;
    } catch (err: any) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
      toast.error('Erro ao autenticar', {
        description: friendlyMessage,
      });
      setIsLoading(false);
    }
  };

  // Completar cadastro (Step 2)
  const handleCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError('Usuário não autenticado');
      return;
    }
    
    if (!isStep2Valid) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Atualizar profile com nome
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: name,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Inserir na tabela aniversariantes
      const birthDateFormatted = birthDate.split('/').reverse().join('-'); // DD/MM/YYYY -> YYYY-MM-DD
      
      const { error: insertError } = await supabase
        .from('aniversariantes')
        .insert({
          id: userId,
          cpf: cpf.replace(/\D/g, ''),
          telefone: phone.replace(/\D/g, ''),
          data_nascimento: birthDateFormatted,
          cep: cep.replace(/\D/g, ''),
          cidade: cidade,
          estado: estado,
          bairro: bairro,
          logradouro: logradouro,
          numero: numero || '',
          latitude: latitude,
          longitude: longitude,
        });

      if (insertError) {
        console.error('Erro ao inserir aniversariante:', insertError);
        const friendlyMessage = getFriendlyErrorMessage(insertError);
        throw new Error(friendlyMessage);
      }

      toast.success('Cadastro concluído! 🎉', {
        description: 'Bem-vindo ao Aniversariante VIP!',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao completar cadastro:', error);
      const friendlyMessage = getFriendlyErrorMessage(error);
      setError(friendlyMessage);
      toast.error('Erro ao completar cadastro', {
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <BackButton />
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          
          {/* Progress bar */}
          <div className="h-1 w-full bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: step === 1 ? '30%' : '100%' }}
            />
          </div>

          <div className="p-8 space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-extrabold text-white">
                {step === 1 ? (isLogin ? 'Bem-vindo de volta' : 'Criar conta VIP') : 'Complete seu cadastro'}
              </h1>
              <p className="text-slate-400">
                {step === 1 
                  ? (isLogin ? 'Entre para acessar seus benefícios' : 'Cadastre-se grátis em segundos') 
                  : 'Só mais alguns dados para finalizar'}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Login ou Cadastro Básico */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Google Button */}
                {!isLogin && (
                  <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-100 text-slate-900"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continuar com Google
                  </Button>
                )}

                {!isLogin && (
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-sm text-slate-400">ou com email</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                )}

                <form onSubmit={isLogin ? handleLogin : handleBasicSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Email</label>
                    <div className="relative">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="bg-white/5 border-white/10 text-white pl-10"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Senha</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 text-white pl-10 pr-12"
                        required
                        minLength={8}
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {!isLogin && (
                      <p className={`text-xs mt-1.5 ${
                        password.length === 0 
                          ? 'text-slate-400' 
                          : password.length >= 8 
                            ? 'text-green-400' 
                            : 'text-red-400'
                      }`}>
                        {password.length === 0 
                          ? 'Mínimo 8 caracteres' 
                          : password.length >= 8 
                            ? '✓ Senha válida' 
                            : `Faltam ${8 - password.length} caracteres`}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || (!isLogin && (!email || password.length < 8))}
                    className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isLogin ? 'Entrando...' : 'Criando conta...'}
                      </>
                    ) : (
                      isLogin ? 'Entrar' : 'Criar conta'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {isLogin ? 'Ainda não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Complete registration */}
            {step === 2 && (
              <form onSubmit={handleCompletion} className="space-y-5">
                <MaskedInput
                  label="Nome Completo"
                  value={name}
                  onChange={handleNameChange}
                  mask={(v) => v}
                  placeholder="João Silva Santos"
                  error={nameError}
                  isValid={isNameValid}
                  required
                />

                <MaskedInput
                  label="Celular (WhatsApp)"
                  value={phone}
                  onChange={handlePhoneChange}
                  mask={phoneMask}
                  placeholder="(11) 99999-9999"
                  error={phoneError}
                  isValid={isPhoneValid}
                  required
                />

                <MaskedInput
                  label="CPF"
                  value={cpf}
                  onChange={handleCpfChange}
                  mask={cpfMask}
                  placeholder="000.000.000-00"
                  error={cpfError}
                  isValid={isCpfValid && !cpfExists}
                  required
                />
                
                {cpfChecking && cpf.replace(/\D/g, '').length === 11 && (
                  <div className="flex items-center gap-2 text-violet-400 -mt-3">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Verificando CPF...</span>
                  </div>
                )}

                <MaskedInput
                  label="Data de Nascimento"
                  value={birthDate}
                  onChange={handleBirthDateChange}
                  mask={dateMask}
                  placeholder="DD/MM/AAAA"
                  error={birthDateError}
                  isValid={isBirthDateValid}
                  required
                />

                <div className="space-y-3">
                  <MaskedInput
                    label="CEP"
                    value={cep}
                    onChange={handleCepChange}
                    mask={cepMask}
                    placeholder="00000-000"
                    error={cepError}
                    isValid={isCepValid}
                    required
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowCepSearch(!showCepSearch)}
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                  >
                    {showCepSearch ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Fechar busca de CEP
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Não sei meu CEP
                      </>
                    )}
                  </button>

                  {showCepSearch && (
                    <BuscaCepPorEndereco onCepFound={handleCepFoundBySearch} />
                  )}
                </div>

                {cepLoading && (
                  <div className="flex items-center justify-center gap-2 text-violet-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Buscando endereço...</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Estado</label>
                    <Input
                      type="text"
                      value={estado}
                      readOnly
                      className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                      placeholder="Preenchido pelo CEP"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Cidade</label>
                    <Input
                      type="text"
                      value={cidade}
                      readOnly
                      className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                      placeholder="Preenchido pelo CEP"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Bairro</label>
                  <Input
                    type="text"
                    value={bairro}
                    readOnly
                    className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                    placeholder="Preenchido pelo CEP"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Rua/Logradouro</label>
                  <Input
                    type="text"
                    value={logradouro}
                    readOnly
                    className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                    placeholder="Preenchido pelo CEP"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Número <span className="text-slate-400 text-xs">(opcional)</span>
                  </label>
                  <Input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isStep2Valid}
                  className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    'Completar Cadastro'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <ChatAssistant />
    </div>
  );
};

export default SmartAuth;
