import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Check, X, Lock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PasswordInput } from "@/components/ui/password-input";
import { getFriendlyErrorMessage } from "@/lib/errorTranslator";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    // Verifica se há um token de recuperação na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
      setValidToken(true);
    } else {
      toast.error("Link de recuperação inválido ou expirado");
      navigate("/auth");
    }
  }, [navigate]);

  // Validação de força da senha
  const validatePasswordStrength = (pwd: string) => {
    const requirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    return {
      requirements,
      score,
      strength: score <= 2 ? 'fraca' : score <= 3 ? 'média' : score <= 4 ? 'boa' : 'forte',
      color: score <= 2 ? 'bg-red-500' : score <= 3 ? 'bg-yellow-500' : score <= 4 ? 'bg-blue-500' : 'bg-green-500',
    };
  };

  const passwordStrength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error("Escolha uma senha mais forte");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        if (error.message.includes('same as')) {
          toast.error('A nova senha deve ser diferente da anterior');
        } else {
          toast.error('Erro ao redefinir senha. Tente novamente.');
        }
        return;
      }

      setPasswordChanged(true);
      toast.success("Senha redefinida com sucesso!");

      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
      
      <Header />
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Redefinir Senha</CardTitle>
            <CardDescription className="text-slate-400">
              {passwordChanged ? 'Senha alterada com sucesso!' : 'Digite sua nova senha abaixo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!passwordChanged ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Digite sua nova senha abaixo.
                </p>

                {/* Nova senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Nova Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="pr-10 bg-white/5 border-white/10 text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Indicador de força */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i <= passwordStrength.score ? passwordStrength.color : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        passwordStrength.strength === 'fraca' ? 'text-red-500' :
                        passwordStrength.strength === 'média' ? 'text-yellow-500' :
                        passwordStrength.strength === 'boa' ? 'text-blue-500' : 'text-green-500'
                      }`}>
                        Senha {passwordStrength.strength}
                      </p>
                    </div>
                  )}

                  {/* Requisitos */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <p className={`text-xs flex items-center gap-1 ${passwordStrength.requirements.length ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {passwordStrength.requirements.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Mínimo 8 caracteres
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${passwordStrength.requirements.uppercase ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {passwordStrength.requirements.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Uma letra maiúscula
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${passwordStrength.requirements.lowercase ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {passwordStrength.requirements.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Uma letra minúscula
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${passwordStrength.requirements.number ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {passwordStrength.requirements.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Um número
                      </p>
                      <p className={`text-xs flex items-center gap-1 ${passwordStrength.requirements.special ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {passwordStrength.requirements.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Um caractere especial (!@#$%...)
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirmar Nova Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite novamente"
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <X className="w-3 h-3" /> As senhas não conferem
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Senhas conferem
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                  disabled={loading || password !== confirmPassword || passwordStrength.score < 3}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Redefinir Senha
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  Senha redefinida com sucesso!
                </h3>
                
                <p className="text-slate-400 mb-4">
                  Você será redirecionado para o login em instantes...
                </p>

                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
                >
                  Ir para o login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
