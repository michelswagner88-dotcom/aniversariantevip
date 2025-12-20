import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, Mail, Lock, User, ChevronDown, ChevronUp, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MaskedInput from "@/components/MaskedInput";
import BuscaCepPorEndereco from "@/components/BuscaCepPorEndereco";
import { BackButton } from "@/components/BackButton";
import { TelaConfirmacaoEmail } from "@/components/TelaConfirmacaoEmail";
import { useInputMask } from "@/hooks/useInputMask";
import { useCheckCpfExists } from "@/hooks/useCheckCpfExists";
import { useCepLookup } from "@/hooks/useCepLookup";
import { getFriendlyErrorMessage } from "@/lib/errorTranslator";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";

const SmartAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determinar modo inicial baseado na rota OU query param
  const getInitialMode = () => {
    // 1. Primeiro verificar query param ?modo=
    const modoParam = searchParams.get("modo");
    if (modoParam === "cadastro") {
      return false; // isLogin = false = modo cadastro
    }
    if (modoParam === "login") {
      return true; // isLogin = true = modo login
    }

    // 2. Se não tem query param, usar a rota
    const path = location.pathname.toLowerCase();
    if (path === "/cadastro" || path === "/cadastro/aniversariante") {
      return false;
    }
    return true;
  };

  // SEO dinâmico baseado no modo
  const isInitiallyLogin = getInitialMode();
  useSEO({
    title: isInitiallyLogin ? SEO_CONTENT.auth.title : "Cadastro Gratuito | Aniversariante VIP",
    description: isInitiallyLogin
      ? SEO_CONTENT.auth.description
      : "Crie sua conta gratuita e descubra benefícios exclusivos para seu aniversário.",
  });

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(getInitialMode());
  const [showCepSearch, setShowCepSearch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [mostrarTelaConfirmacao, setMostrarTelaConfirmacao] = useState(false);
  const [emailParaConfirmar, setEmailParaConfirmar] = useState("");

  // Refs para controle de race condition
  const isProcessingRef = useRef(false);
  const hasProcessedRef = useRef(false);

  const { phoneMask, cpfMask, cepMask, dateMask, validateCPF, validatePhone, validateBirthDate, validateFullName } =
    useInputMask();

  const { fetchCep, loading: cepLoading } = useCepLookup();

  // Step 1: Basic info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Complete registration
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Validation states
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [cepError, setCepError] = useState("");

  const isNameValid = name.trim() && validateFullName(name) && !nameError;
  const isPhoneValid = phone.replace(/\D/g, "").length === 11 && validatePhone(phone) && !phoneError;
  const isCpfValid = cpf.replace(/\D/g, "").length === 11 && validateCPF(cpf) && !cpfError;
  const isBirthDateValid =
    birthDate.replace(/\D/g, "").length === 8 && validateBirthDate(birthDate).valid && !birthDateError;
  const isCepValid = cep.replace(/\D/g, "").length === 8 && estado && cidade && bairro && logradouro && !cepError;

  // Verificação de CPF duplicado em tempo real
  const { exists: cpfExists, loading: cpfChecking } = useCheckCpfExists(cpf, isCpfValid && !cpfError);

  const isStep2Valid =
    isNameValid && isPhoneValid && isCpfValid && !cpfExists && !cpfChecking && isBirthDateValid && isCepValid;

  // Atualizar modo quando a rota OU query param mudar
  useEffect(() => {
    const modoParam = searchParams.get("modo");

    if (modoParam === "cadastro") {
      setIsLogin(false);
      return;
    }
    if (modoParam === "login") {
      setIsLogin(true);
      return;
    }

    const path = location.pathname.toLowerCase();
    if (path === "/cadastro" || path === "/cadastro/aniversariante") {
      setIsLogin(false);
    } else if (path === "/login" || path === "/login/aniversariante") {
      setIsLogin(true);
    }
  }, [location.pathname, searchParams]);

  // Função auxiliar para verificar rate limit
  const checkRateLimit = async (identifier: string, action: "login" | "signup"): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("check-auth-rate-limit", {
        body: { identifier, action },
      });

      if (error) {
        console.error("Erro ao verificar rate limit:", error);
        return true;
      }

      if (!data.allowed) {
        toast.error("Muitas tentativas", {
          description: data.message || `Aguarde ${data.retryAfter} minutos e tente novamente.`,
          duration: 6000,
        });
        return false;
      }

      if (data.remaining <= 1) {
        toast.warning("Atenção", {
          description: `Você tem apenas ${data.remaining} tentativa(s) restante(s).`,
        });
      }

      return true;
    } catch (err) {
      console.error("Erro ao verificar rate limit:", err);
      return true;
    }
  };

  // Validação de senha com regras específicas
  const passwordChecks = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = () => {
    return passwordChecks.hasMinLength && passwordChecks.hasUppercase && passwordChecks.hasSpecialChar;
  };

  // Verificar sessão inicial
  useEffect(() => {
    const checkSession = async () => {
      if (isProcessingRef.current) {
        return;
      }

      if (hasProcessedRef.current && step === 2) {
        return;
      }

      isProcessingRef.current = true;

      try {
        const forceStep2 = sessionStorage.getItem("forceStep2");
        const needsCompletion = sessionStorage.getItem("needsCompletion");

        if (forceStep2 === "true" || needsCompletion === "true") {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            sessionStorage.removeItem("forceStep2");
            sessionStorage.removeItem("needsCompletion");

            setUserId(session.user.id);
            setEmail(session.user.email || "");
            setName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
            setIsGoogleUser(true);
            setStep(2);
            hasProcessedRef.current = true;
          }
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (!roleData) {
            try {
              await supabase.from("profiles").insert({
                id: session.user.id,
                email: session.user.email!,
                nome: session.user.user_metadata?.full_name || session.user.user_metadata?.name || "",
              });
            } catch (err) {
              console.error("Erro ao criar profile:", err);
            }
          }

          const { data: anivData } = await supabase
            .from("aniversariantes")
            .select("cpf, data_nascimento")
            .eq("id", session.user.id)
            .maybeSingle();

          if (step === 2 || userId) {
            return;
          }

          if (!anivData?.cpf || !anivData?.data_nascimento) {
            setUserId(session.user.id);
            setEmail(session.user.email || "");
            setName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
            setIsGoogleUser(true);
            setStep(2);
          } else {
            const redirectTo = sessionStorage.getItem("redirectAfterLogin");
            sessionStorage.removeItem("redirectAfterLogin");

            if (redirectTo) {
              navigate(redirectTo, { replace: true });
            } else {
              navigate("/", { replace: true });
            }
          }
        }
      } finally {
        isProcessingRef.current = false;
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const forceStep2 = sessionStorage.getItem("forceStep2");
      const needsCompletion = sessionStorage.getItem("needsCompletion");

      if (forceStep2 === "true" || needsCompletion === "true") {
        return;
      }

      if (step === 2) {
        return;
      }

      if (hasProcessedRef.current) {
        return;
      }

      if (event === "SIGNED_IN" && session) {
        checkSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, step, userId]);

  // Limpar sessionStorage se usuário sair da página sem fazer login
  useEffect(() => {
    const handleBeforeUnload = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          sessionStorage.removeItem("redirectAfterLogin");
        }
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Validações em tempo real
  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim() && !validateFullName(value)) {
      setNameError("Digite seu nome completo (nome e sobrenome)");
    } else {
      setNameError("");
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 11) {
      if (!validatePhone(value)) {
        setPhoneError("Digite um celular válido com DDD");
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
  };

  const handleCpfChange = (value: string) => {
    setCpf(value);
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 11) {
      if (!validateCPF(value)) {
        setCpfError("CPF inválido");
      } else if (cpfExists) {
        setCpfError("Este CPF já está cadastrado. Se for você, tente fazer login.");
      } else {
        setCpfError("");
      }
    } else {
      setCpfError("");
    }
  };

  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 8) {
      const validation = validateBirthDate(value);
      if (!validation.valid) {
        setBirthDateError(validation.message || "Data de nascimento inválida");
      } else {
        setBirthDateError("");
      }
    } else {
      setBirthDateError("");
    }
  };

  const handleCepChange = async (value: string) => {
    setCep(value);
    const numbers = value.replace(/\D/g, "");

    if (numbers.length === 8) {
      setCepError("");
      const cepData = await fetchCep(value);

      if (cepData) {
        setEstado(cepData.uf);
        setCidade(cepData.localidade);
        setBairro(cepData.bairro);
        setLogradouro(cepData.logradouro);

        try {
          const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (googleMapsKey) {
            const address = `${cepData.logradouro}, ${cepData.localidade}, ${cepData.uf}`;
            const geoResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsKey}`,
            );
            const geoData = await geoResponse.json();

            if (geoData.results && geoData.results[0]) {
              setLatitude(geoData.results[0].geometry.location.lat);
              setLongitude(geoData.results[0].geometry.location.lng);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar coordenadas:", error);
        }
      } else {
        setCepError("CEP não encontrado");
        setEstado("");
        setCidade("");
        setBairro("");
        setLogradouro("");
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
    setError("");

    try {
      const rateLimitOk = await checkRateLimit(email, "login");
      if (!rateLimitOk) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Confirme seu email antes de fazer login. Verifique sua caixa de entrada.");
          setIsLoading(false);
          return;
        }
        throw error;
      }

      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).single();

      if (roleData?.role !== "aniversariante") {
        await supabase.auth.signOut();
        throw new Error("Esta conta não é de aniversariante.");
      }

      const { data: anivData } = await supabase
        .from("aniversariantes")
        .select("cpf, data_nascimento")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!anivData?.cpf || !anivData?.data_nascimento) {
        setUserId(data.user.id);
        setStep(2);
        toast.warning("Complete seu cadastro para continuar", {
          description: "Preencha os dados restantes para acessar sua conta.",
        });
        return;
      }

      toast.success("Login realizado!", {
        description: "Bem-vindo de volta!",
      });

      const redirectTo = sessionStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectTo, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
      toast.error("Erro ao fazer login", {
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
    setError("");

    try {
      if (!email || !password) {
        throw new Error("Preencha email e senha");
      }

      if (!isPasswordValid()) {
        throw new Error("A senha não atende aos requisitos mínimos");
      }

      const rateLimitOk = await checkRateLimit(email, "signup");
      if (!rateLimitOk) {
        setIsLoading(false);
        return;
      }

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        throw new Error("Este email já está cadastrado. Faça login ou use outro email.");
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user && !signUpData.session) {
        toast.success("Cadastro iniciado!");
        setEmailParaConfirmar(email);
        setMostrarTelaConfirmacao(true);
        setIsLoading(false);
        return;
      }

      if (signUpData.session) {
        setUserId(signUpData.user.id);
        setStep(2);
        toast.success("Dados validados! Complete seu cadastro.");
      }
    } catch (err: any) {
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
      toast.error("Erro na validação", {
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");

      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setError("Não foi possível conectar com Google. Tente novamente.");
        toast.error("Erro ao conectar com Google", {
          description: "Verifique sua conexão e tente novamente.",
        });
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      setError("Erro ao conectar com Google. Tente novamente.");
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao tentar conectar com o Google.",
      });
      setIsLoading(false);
    }
  };

  // Completar cadastro (Step 2)
  const handleCompletion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStep2Valid) {
      toast.error("Por favor, preencha todos os campos corretamente");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let currentUserId = userId;
      let isNewSignup = false;

      if (!currentUserId) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          currentUserId = session.user.id;
        } else {
          isNewSignup = true;
        }
      }

      const cpfLimpo = cpf.replace(/\D/g, "");
      const { data: cpfDuplicado } = await supabase
        .from("aniversariantes")
        .select("id")
        .eq("cpf", cpfLimpo)
        .maybeSingle();

      if (cpfDuplicado && cpfDuplicado.id !== currentUserId) {
        throw new Error("Este CPF já está cadastrado em outra conta. Se você já tem uma conta, faça login com ela.");
      }

      const telefoneLimpo = phone.replace(/\D/g, "");
      const { data: telefoneDuplicado } = await supabase
        .from("aniversariantes")
        .select("id")
        .eq("telefone", telefoneLimpo)
        .maybeSingle();

      if (telefoneDuplicado && telefoneDuplicado.id !== currentUserId) {
        throw new Error(
          "Este telefone já está cadastrado em outra conta. Se você já tem uma conta, faça login com ela.",
        );
      }

      if (isNewSignup) {
        const redirectUrl = `${window.location.origin}/`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              nome: name,
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Erro ao criar usuário");

        currentUserId = authData.user.id;

        await supabase.from("profiles").insert({
          id: authData.user.id,
          email: email,
          nome: name,
        });

        await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "aniversariante",
        });
      }

      const [day, month, year] = birthDate.split("/");
      const formattedDate = `${year}-${month}-${day}`;

      const { error: insertError } = await supabase.from("aniversariantes").upsert({
        id: currentUserId,
        cpf: cpfLimpo,
        telefone: telefoneLimpo,
        data_nascimento: formattedDate,
        cep: cep.replace(/\D/g, ""),
        estado,
        cidade,
        bairro,
        logradouro,
        numero: numero || "S/N",
        latitude,
        longitude,
        cadastro_completo: true,
      });

      if (insertError) {
        console.error("Erro ao salvar dados:", insertError);
        throw insertError;
      }

      if (!isNewSignup) {
        const { error: profileError } = await supabase.from("profiles").update({ nome: name }).eq("id", currentUserId);

        if (profileError) {
          console.error("Erro ao atualizar perfil:", profileError);
        }
      }

      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("role", "aniversariante")
        .maybeSingle();

      if (!existingRole) {
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: currentUserId,
          role: "aniversariante",
        });

        if (roleError) {
          console.error("Erro ao criar role:", roleError);
          throw new Error("Erro ao finalizar cadastro. Tente novamente.");
        }
      }

      toast.success("Cadastro completo!", {
        description: "Bem-vindo ao Aniversariante VIP!",
      });

      const redirectTo = sessionStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectTo, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      console.error("Erro ao completar cadastro:", err);
      const friendlyMessage = getFriendlyErrorMessage(err);
      setError(friendlyMessage);
      toast.error("Erro ao completar cadastro", {
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle de modo com atualização da URL
  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    const newPath = newIsLogin ? "/login" : "/cadastro";
    window.history.replaceState(null, "", newPath);
  };

  // Tela de confirmação de email
  if (mostrarTelaConfirmacao) {
    return (
      <TelaConfirmacaoEmail
        email={emailParaConfirmar}
        onVoltar={() => {
          setMostrarTelaConfirmacao(false);
          setEmailParaConfirmar("");
          setIsLogin(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* BackButton posicionado corretamente */}
      <div className="absolute top-4 left-4 z-20">
        <BackButton to="/" />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 pb-24 sm:pb-12">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500 ease-out"
              style={{ width: step === 1 ? "30%" : "100%" }}
              role="progressbar"
              aria-valuenow={step === 1 ? 30 : 100}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {step === 1 ? (isLogin ? "Entre para ver o benefício" : "Criar conta VIP") : "Complete seu cadastro"}
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                {step === 1
                  ? isLogin
                    ? "Acesse sua conta Aniversariante VIP"
                    : "Cadastre-se grátis em segundos"
                  : "Só mais alguns dados para finalizar"}
              </p>
            </div>

            {error && (
              <div
                className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Login ou Cadastro Básico */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Google Button */}
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full min-h-[52px] h-[52px] text-base font-semibold bg-white hover:bg-slate-100 text-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {isLoading ? "Conectando..." : "Continuar com Google"}
                </Button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-sm text-slate-400 whitespace-nowrap">ou continue com email</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={isLogin ? handleLogin : handleBasicSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                      Email <span className="text-violet-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        className={`h-[52px] text-base bg-white/5 text-white pl-11 focus:ring-2 transition-all ${
                          email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20"
                        }`}
                        required
                        aria-invalid={email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "true" : "false"}
                        aria-describedby={
                          email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "email-error" : undefined
                        }
                      />
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                        aria-hidden="true"
                      />
                    </div>
                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                      <p id="email-error" className="text-sm text-red-400 flex items-center gap-1.5 mt-1">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        Digite um email válido
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                      Senha <span className="text-violet-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        className={`h-[52px] text-base bg-white/5 text-white pl-11 pr-14 focus:ring-2 transition-all ${
                          !isLogin && password && !isPasswordValid()
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20"
                        }`}
                        required
                        minLength={8}
                        aria-describedby={!isLogin ? "password-requirements" : undefined}
                      />
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        tabIndex={-1}
                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <Eye className="w-5 h-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {!isLogin && (
                      <div
                        id="password-requirements"
                        className="space-y-2 mt-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                      >
                        <p className="text-xs text-slate-400 font-medium">A senha deve conter:</p>
                        <ul className="text-xs space-y-1.5" aria-label="Requisitos de senha">
                          <li
                            className={`flex items-center gap-2 ${passwordChecks.hasMinLength ? "text-green-400" : "text-slate-500"}`}
                            aria-label={`Mínimo 8 caracteres: ${passwordChecks.hasMinLength ? "atendido" : "não atendido"}`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordChecks.hasMinLength ? "bg-green-500/20" : "bg-slate-700"}`}
                              aria-hidden="true"
                            >
                              {passwordChecks.hasMinLength && <Check className="w-3 h-3" />}
                            </span>
                            Mínimo 8 caracteres
                          </li>
                          <li
                            className={`flex items-center gap-2 ${passwordChecks.hasUppercase ? "text-green-400" : "text-slate-500"}`}
                            aria-label={`Uma letra maiúscula: ${passwordChecks.hasUppercase ? "atendido" : "não atendido"}`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordChecks.hasUppercase ? "bg-green-500/20" : "bg-slate-700"}`}
                              aria-hidden="true"
                            >
                              {passwordChecks.hasUppercase && <Check className="w-3 h-3" />}
                            </span>
                            Uma letra maiúscula
                          </li>
                          <li
                            className={`flex items-center gap-2 ${passwordChecks.hasSpecialChar ? "text-green-400" : "text-slate-500"}`}
                            aria-label={`Um caractere especial: ${passwordChecks.hasSpecialChar ? "atendido" : "não atendido"}`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${passwordChecks.hasSpecialChar ? "bg-green-500/20" : "bg-slate-700"}`}
                              aria-hidden="true"
                            >
                              {passwordChecks.hasSpecialChar && <Check className="w-3 h-3" />}
                            </span>
                            Um caractere especial (!@#$%...)
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {isLogin && (
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium"
                      >
                        Esqueci minha senha
                      </Link>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || (!isLogin && (!email || !isPasswordValid()))}
                    className="w-full min-h-[52px] h-[52px] text-base font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                        {isLogin ? "Entrando..." : "Criando conta..."}
                      </>
                    ) : isLogin ? (
                      "Entrar"
                    ) : (
                      "Criar conta"
                    )}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <button
                    onClick={toggleMode}
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium min-h-[44px] px-4 inline-flex items-center"
                  >
                    {isLogin ? "Primeira vez aqui? Crie sua conta grátis" : "Já tem conta? Faça login"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Complete registration */}
            {step === 2 && (
              <form onSubmit={handleCompletion} className="space-y-5">
                {/* Mensagem para usuário Google */}
                {isGoogleUser && email && (
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 space-y-2">
                    <p className="text-violet-300 text-sm font-medium flex items-center gap-2">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Você está cadastrando com sua conta Google
                    </p>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Email (Google)</label>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300">
                        {email}
                      </div>
                    </div>
                  </div>
                )}

                <MaskedInput
                  label="Nome Completo"
                  value={name}
                  onChange={handleNameChange}
                  mask={(v) => v}
                  placeholder="João Silva Santos"
                  error={nameError}
                  isValid={isNameValid}
                  required
                  icon={<User className="h-5 w-5" />}
                  autoComplete="name"
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
                  autoComplete="tel"
                />

                <div className="space-y-2">
                  <MaskedInput
                    label="CPF"
                    value={cpf}
                    onChange={handleCpfChange}
                    mask={cpfMask}
                    placeholder="000.000.000-00"
                    error={cpfError || (cpfExists ? "Este CPF já está cadastrado em outra conta." : "")}
                    isValid={isCpfValid && !cpfExists && !cpfChecking}
                    loading={cpfChecking && cpf.replace(/\D/g, "").length === 11}
                    required
                  />
                </div>

                <MaskedInput
                  label="Data de Nascimento"
                  value={birthDate}
                  onChange={handleBirthDateChange}
                  mask={dateMask}
                  placeholder="DD/MM/AAAA"
                  error={birthDateError}
                  isValid={isBirthDateValid}
                  required
                  autoComplete="bday"
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
                    loading={cepLoading}
                    required
                    autoComplete="postal-code"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCepSearch(!showCepSearch)}
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 font-medium min-h-[44px] px-2"
                  >
                    {showCepSearch ? (
                      <>
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        Fechar busca de CEP
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        Não sei meu CEP
                      </>
                    )}
                  </button>

                  {showCepSearch && <BuscaCepPorEndereco onCepFound={handleCepFoundBySearch} />}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="estado" className="text-sm font-semibold text-slate-200">
                      Estado
                    </label>
                    <Input
                      id="estado"
                      type="text"
                      value={estado}
                      readOnly
                      className="h-[52px] text-base bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                      placeholder="Preenchido pelo CEP"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cidade" className="text-sm font-semibold text-slate-200">
                      Cidade
                    </label>
                    <Input
                      id="cidade"
                      type="text"
                      value={cidade}
                      readOnly
                      className="h-[52px] text-base bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                      placeholder="Preenchido pelo CEP"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bairro" className="text-sm font-semibold text-slate-200">
                    Bairro
                  </label>
                  <Input
                    id="bairro"
                    type="text"
                    value={bairro}
                    readOnly
                    className="h-[52px] text-base bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                    placeholder="Preenchido pelo CEP"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="logradouro" className="text-sm font-semibold text-slate-200">
                    Rua/Logradouro
                  </label>
                  <Input
                    id="logradouro"
                    type="text"
                    value={logradouro}
                    readOnly
                    className="h-[52px] text-base bg-white/5 border-white/10 text-slate-400 cursor-not-allowed"
                    placeholder="Preenchido pelo CEP"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="numero" className="text-sm font-semibold text-slate-200">
                    Número <span className="text-slate-400 text-xs font-normal">(opcional)</span>
                  </label>
                  <Input
                    id="numero"
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
                    placeholder="123"
                    autoComplete="address-line2"
                    className="h-[52px] text-base bg-white/5 border-white/10 text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isStep2Valid}
                  className="w-full min-h-[52px] h-[52px] text-base font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      Finalizando...
                    </>
                  ) : (
                    "Completar Cadastro"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAuth;
