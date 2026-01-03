// =============================================================================
// LOGIN ESTABELECIMENTO - TEMA CLARO
// Design System: Fundo claro (branco/slate-50) + Roxo (#7C3AED) como destaque
// =============================================================================

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Crown, Loader2, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getFriendlyErrorMessage } from "@/lib/errorTranslator";
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

// Google Icon Component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function LoginEstabelecimento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageReady, setPageReady] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);

        if (roles?.some((r) => r.role === "estabelecimento")) {
          navigate("/area-estabelecimento");
          return;
        }
      }
      setPageReady(true);
    };
    checkUser();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/area-estabelecimento`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar com Google",
        description: getFriendlyErrorMessage(error),
      });
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email não confirmado",
            description: "Confirme seu email antes de fazer login. Verifique sua caixa de entrada.",
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);

      if (!roles?.some((r) => r.role === "estabelecimento")) {
        await supabase.auth.signOut();
        throw new Error("Usuário não é um estabelecimento");
      }

      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso",
      });
      navigate("/area-estabelecimento");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: getFriendlyErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (!pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

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
            <div className="h-full w-full bg-gradient-to-r from-violet-600 to-violet-500" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-3 text-center">
              {/* Logo Icon */}
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-600/25">
                <Crown className="w-7 h-7 text-white" />
              </div>

              <h1 className="text-[26px] sm:text-[30px] font-bold text-zinc-900 leading-tight tracking-tight">
                Login Estabelecimento
              </h1>
              <p className="text-zinc-500 text-[15px] leading-relaxed">Acesse sua área de gerenciamento</p>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className={cn(
                "w-full h-[52px] text-base font-semibold rounded-xl",
                "bg-white hover:bg-zinc-50 active:bg-zinc-100",
                "text-zinc-700",
                "border border-zinc-200 hover:border-zinc-300",
                "shadow-sm hover:shadow",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200",
                "flex items-center justify-center gap-3",
              )}
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <GoogleIcon />
                  Entrar com Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-zinc-400 font-medium">ou continue com email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>
                  E-mail <span className="text-violet-600">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    required
                    disabled={loading || googleLoading}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className={inputWithIconClass}
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha" className={labelClass}>
                  Senha <span className="text-violet-600">*</span>
                </Label>
                <PasswordInput
                  id="senha"
                  required
                  disabled={loading || googleLoading}
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••••"
                  className={cn(inputBaseClass, "pr-12")}
                />
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-violet-600 hover:text-violet-700 transition-colors font-medium py-1"
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* Submit Button */}
              <Button type="submit" className={buttonPrimaryClass} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center pt-2">
              <p className="text-sm text-zinc-500">
                Não tem uma conta?{" "}
                <Link
                  to="/cadastro/estabelecimento"
                  className="text-violet-600 hover:text-violet-700 transition-colors font-medium"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
