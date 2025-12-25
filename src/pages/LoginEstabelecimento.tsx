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
