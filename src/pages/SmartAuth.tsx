// =============================================================================
// SMART AUTH - V2.0 PREMIUM
// Design System: Fundo claro (branco/slate-50) + Roxo (#7C3AED) como destaque
// Consistente com o resto do site AniversarianteVIP
// =============================================================================

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  User,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  Cake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MaskedInput from "@/components/MaskedInput";
import BuscaCepPorEndereco from "@/components/BuscaCepPorEndereco";
import { TelaConfirmacaoEmail } from "@/components/TelaConfirmacaoEmail";
import { useInputMask } from "@/hooks/useInputMask";
import { useCheckCpfExists } from "@/hooks/useCheckCpfExists";
import { useCepLookup } from "@/hooks/useCepLookup";
import { getFriendlyErrorMessage } from "@/lib/errorTranslator";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { cn } from "@/lib/utils";

// =============================================================================
// BACK BUTTON COMPONENT
// =============================================================================

const BackButtonAuth = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex items-center gap-2 px-3 py-2 rounded-xl",
      "text-zinc-600 hover:text-zinc-900",
      "bg-white hover:bg-zinc-50",
      "border border-zinc-200 hover:border-zinc-300",
      "shadow-sm hover:shadow",
      "transition-all duration-200",
      "min-h-[44px] min-w-[44px]",
    )}
    aria-label="Voltar para página inicial"
  >
    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
    <span className="text-sm font-medium hidden sm:inline">Voltar</span>
  </button>
);

// =============================================================================
// PASSWORD STRENGTH INDICATOR
// =============================================================================

const PasswordStrength = ({
  checks,
}: {
  checks: { hasMinLength: boolean; hasUppercase: boolean; hasSpecialChar: boolean };
}) => {
  const items = [
    { key: "hasMinLength", label: "Mínimo 8 caracteres", checked: checks.hasMinLength },
    { key: "hasUppercase", label: "Uma letra maiúscula", checked: checks.hasUppercase },
    { key: "hasSpecialChar", label: "Um caractere especial (!@#$%...)", checked: checks.hasSpecialChar },
  ];

  return (
    <div className="mt-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
      <p className="text-xs font-medium text-zinc-500 mb-3">A senha deve conter:</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item.key}
            className={cn(
              "flex items-center gap-2.5 text-sm transition-colors duration-200",
              item.checked ? "text-emerald-600" : "text-zinc-400",
            )}
          >
            <span
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                item.checked ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100",
              )}
            >
              {item.checked && <Check className="w-3 h-3" />}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const SmartAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Determinar modo inicial baseado na rota OU query param
  const getInitialMode = () => {
    const modoParam = searchParams.get("modo");
    if (modoParam === "cadastro") return false;
    if (modoParam === "login") return true;

    const path = location.pathname.toLowerCase();
    if (path === "/cadastro" || path === "/cadastro/aniversariante") return false;
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
      if (isProcessingRef.current) return;
      if (hasProcessedRef.current && step === 2) return;

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

          if (step === 2 || userId) return;

          if (!anivData?.cpf || !anivData?.data_nascimento) {
            setUserId(session.user.id);
            setEmail(session.user.email || "");
            setName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || "");
            setIsGoogleUser(true);
            setStep(2);
          } else {
            const redirectTo = sessionStorage.getItem("redirectAfterLogin");
            sessionStorage.removeItem("redirectAfterLogin");
            navigate(redirectTo || "/", { replace: true });
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
      if (forceStep2 === "true" || needsCompletion === "true") return;
      if (step === 2) return;
      if (hasProcessedRef.current) return;
      if (event === "SIGNED_IN" && session) checkSession();
    });

    return () => subscription.unsubscribe();
  }, [navigate, step, userId]);

  // Limpar sessionStorage se usuário sair da página sem fazer login
  useEffect(() => {
    const handleBeforeUnload = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) sessionStorage.removeItem("redirectAfterLogin");
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

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

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

      toast.success("Login realizado!", { description: "Bem-vindo de volta!" });

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
      toast.error("Erro ao fazer login", { description: friendlyMessage });
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
      if (!email || !password) throw new Error("Preencha email e senha");
      if (!isPasswordValid()) throw new Error("A senha não atende aos requisitos mínimos");

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
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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
      toast.error("Erro na validação", { description: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });

      if (error) {
        setError("Não foi possível conectar com Google. Tente novamente.");
        toast.error("Erro ao conectar com Google", { description: "Verifique sua conexão e tente novamente." });
        setIsLoading(false);
      }
    } catch (err: any) {
      setError("Erro ao conectar com Google. Tente novamente.");
      toast.error("Erro inesperado", { description: "Ocorreu um erro ao tentar conectar com o Google." });
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
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { nome: name },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Erro ao criar usuário");

        currentUserId = authData.user.id;

        await supabase.from("profiles").insert({ id: authData.user.id, email: email, nome: name });
        await supabase.from("user_roles").insert({ user_id: authData.user.id, role: "aniversariante" });
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

      if (insertError) throw insertError;

      if (!isNewSignup) {
        await supabase.from("profiles").update({ nome: name }).eq("id", currentUserId);
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
        if (roleError) throw new Error("Erro ao finalizar cadastro. Tente novamente.");
      }

      toast.success("Cadastro completo!", { description: "Bem-vindo ao Aniversariante VIP!" });

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
      toast.error("Erro ao completar cadastro", { description: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle de modo com atualização da URL
  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    window.history.replaceState(null, "", newIsLogin ? "/login" : "/cadastro");
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

  // ==========================================================================
  // SHARED STYLES - TEMA CLARO
  // ==========================================================================

  const inputBaseClass = cn(
    "h-12 text-base text-zinc-900 rounded-xl",
    "bg-white",
    "border border-zinc-200",
    "placeholder:text-zinc-400",
    "hover:border-zinc-300",
    "focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none",
    "transition-all duration-200",
  );

  const inputWithIconClass = cn(inputBaseClass, "pl-11");

  const inputErrorClass = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

  const labelClass = "text-sm font-medium text-zinc-700 flex items-center gap-1.5";

  const buttonPrimaryClass = cn(
    "w-full h-[52px] text-base font-semibold rounded-xl",
    "bg-violet-600 hover:bg-violet-700 active:bg-violet-800",
    "text-white",
    "shadow-lg shadow-violet-600/25",
    "hover:shadow-xl hover:shadow-violet-600/30",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
    "transition-all duration-200",
  );

  const buttonGoogleClass = cn(
    "w-full h-[52px] text-base font-semibold rounded-xl",
    "bg-white hover:bg-zinc-50 active:bg-zinc-100",
    "text-zinc-800",
    "border border-zinc-200 hover:border-zinc-300",
    "shadow-sm hover:shadow",
    "transition-all duration-200",
  );

  const readOnlyInputClass = cn(inputBaseClass, "cursor-not-allowed bg-zinc-50 text-zinc-500");

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Background Pattern - Grid sutil roxo */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(124,58,237,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(124,58,237,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow Effects - Roxo sutil */}
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <BackButtonAuth onClick={() => navigate("/")} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-20 sm:py-12">
        <div
          className={cn(
            "w-full max-w-[440px]",
            "rounded-2xl overflow-hidden",
            "bg-white",
            "border border-zinc-200/80",
            "shadow-xl shadow-zinc-200/50",
          )}
        >
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-zinc-100">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-500 transition-all duration-500 ease-out"
              style={{ width: step === 1 ? "30%" : "100%" }}
              role="progressbar"
              aria-valuenow={step === 1 ? 30 : 100}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-3 text-center">
              {/* Logo Icon */}
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-600/25">
                <Cake className="w-7 h-7 text-white" />
              </div>

              <h1 className="text-[26px] sm:text-[30px] font-bold text-zinc-900 leading-tight tracking-tight">
                {step === 1 ? (isLogin ? "Bem-vindo de volta" : "Criar conta VIP") : "Complete seu cadastro"}
              </h1>
              <p className="text-zinc-500 text-[15px] leading-relaxed">
                {step === 1
                  ? isLogin
                    ? "Acesse sua conta e veja seus benefícios"
                    : "Cadastre-se grátis em segundos"
                  : "Só mais alguns dados para finalizar"}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* ================================================================ */}
            {/* STEP 1: Login ou Cadastro Básico */}
            {/* ================================================================ */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Google Button */}
                <Button type="button" onClick={handleGoogleLogin} disabled={isLoading} className={buttonGoogleClass}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-sm text-zinc-400 whitespace-nowrap px-2">ou continue com email</span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>

                <form onSubmit={isLogin ? handleLogin : handleBasicSignup} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className={labelClass}>
                      Email <span className="text-violet-600">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        className={cn(
                          inputWithIconClass,
                          email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && inputErrorClass,
                        )}
                        required
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                    </div>
                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                      <p className="text-sm text-red-600 flex items-center gap-1.5 mt-1.5">
                        <AlertCircle className="h-4 w-4" />
                        Digite um email válido
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className={labelClass}>
                      Senha <span className="text-violet-600">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        className={cn(
                          inputWithIconClass,
                          "pr-14",
                          !isLogin && password && !isPasswordValid() && inputErrorClass,
                        )}
                        required
                        minLength={8}
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute right-1.5 top-1/2 -translate-y-1/2",
                          "w-10 h-10 flex items-center justify-center rounded-lg",
                          "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100",
                          "transition-all duration-200",
                        )}
                        tabIndex={-1}
                        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Strength (only for signup) */}
                    {!isLogin && <PasswordStrength checks={passwordChecks} />}
                  </div>

                  {/* Forgot Password (only for login) */}
                  {isLogin && (
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-violet-600 hover:text-violet-700 transition-colors font-medium py-1"
                      >
                        Esqueci minha senha
                      </Link>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || (!isLogin && (!email || !isPasswordValid()))}
                    className={buttonPrimaryClass}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {isLogin ? "Entrando..." : "Criando conta..."}
                      </>
                    ) : isLogin ? (
                      "Entrar"
                    ) : (
                      "Criar conta"
                    )}
                  </Button>
                </form>

                {/* Toggle Mode */}
                <div className="text-center pt-2">
                  <button
                    onClick={toggleMode}
                    className="text-sm text-violet-600 hover:text-violet-700 transition-colors font-medium min-h-[44px] px-4 inline-flex items-center"
                  >
                    {isLogin ? "Primeira vez aqui? Crie sua conta grátis" : "Já tem conta? Faça login"}
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* STEP 2: Complete Registration */}
            {/* ================================================================ */}
            {step === 2 && (
              <form onSubmit={handleCompletion} className="space-y-5">
                {/* Google User Info */}
                {isGoogleUser && email && (
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
                    <p className="text-violet-700 text-sm font-medium flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Conta Google conectada
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-500 font-medium">Email</label>
                      <div className="bg-white border border-violet-100 rounded-lg px-4 py-2.5 text-sm text-zinc-700">
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
                  theme="light"
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
                  theme="light"
                />

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
                  theme="light"
                />

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
                  theme="light"
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
                    theme="light"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCepSearch(!showCepSearch)}
                    className="text-sm text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1.5 font-medium min-h-[44px] px-1"
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

                  {showCepSearch && <BuscaCepPorEndereco onCepFound={handleCepFoundBySearch} />}
                </div>

                {/* Address Fields (Read-only) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="estado" className={labelClass}>
                      Estado
                    </label>
                    <Input
                      id="estado"
                      type="text"
                      value={estado}
                      readOnly
                      className={readOnlyInputClass}
                      placeholder="—"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="cidade" className={labelClass}>
                      Cidade
                    </label>
                    <Input
                      id="cidade"
                      type="text"
                      value={cidade}
                      readOnly
                      className={readOnlyInputClass}
                      placeholder="—"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bairro" className={labelClass}>
                    Bairro
                  </label>
                  <Input
                    id="bairro"
                    type="text"
                    value={bairro}
                    readOnly
                    className={readOnlyInputClass}
                    placeholder="Preenchido pelo CEP"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="logradouro" className={labelClass}>
                    Rua/Logradouro
                  </label>
                  <Input
                    id="logradouro"
                    type="text"
                    value={logradouro}
                    readOnly
                    className={readOnlyInputClass}
                    placeholder="Preenchido pelo CEP"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="numero" className={labelClass}>
                    Número <span className="text-zinc-400 text-xs font-normal">(opcional)</span>
                  </label>
                  <Input
                    id="numero"
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
                    placeholder="123"
                    autoComplete="address-line2"
                    className={inputBaseClass}
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={isLoading || !isStep2Valid} className={buttonPrimaryClass}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
