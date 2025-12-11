import { useState, useEffect, ReactNode, useId } from "react";
import { Eye, EyeOff, Lock, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordProtectionProps {
  children: ReactNode;
}

// ALTERE ESTA SENHA PARA A QUE VOCÊ QUISER
// ⚠️ ATENÇÃO: Esta senha é visível no código-fonte do navegador!
// Use apenas como proteção básica durante desenvolvimento.
// Remova este componente antes de ir para produção.
const SITE_PASSWORD = "aniversariante2025";

// Chave para salvar no localStorage
const STORAGE_KEY = "aniversariantevip_access";

// Tempo de expiração (24 horas em millisegundos)
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

const PasswordProtection = ({ children }: PasswordProtectionProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const passwordId = useId();

  // Verificar se já tem acesso salvo
  useEffect(() => {
    const checkAccess = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { timestamp } = JSON.parse(stored);
          const now = Date.now();

          // Verificar se ainda está válido (24h)
          if (now - timestamp < EXPIRATION_TIME) {
            setIsAuthenticated(true);
          } else {
            // Expirou, remover
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    };

    checkAccess();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === SITE_PASSWORD) {
      // Salvar acesso com timestamp
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
        }),
      );
      setIsAuthenticated(true);
    } else {
      setError("Senha incorreta");
      setPassword("");
    }
  };

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" aria-hidden="true" />
        <span className="sr-only">Verificando acesso...</span>
      </div>
    );
  }

  // Se autenticado, mostrar o site
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Tela de senha
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <Lock className="w-10 h-10 text-white" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent mb-2">
            ANIVERSARIANTE VIP
          </h1>

          <p className="text-gray-400">Site em desenvolvimento</p>
        </div>

        {/* Card de senha */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="text-center mb-6">
            <Sparkles className="w-6 h-6 text-violet-400 mx-auto mb-2" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white mb-1">Acesso Restrito</h2>
            <p className="text-sm text-gray-400">Digite a senha para acessar o site</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de senha */}
            <div>
              <Label htmlFor={passwordId} className="sr-only">
                Senha de acesso
              </Label>
              <div className="relative">
                <Input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="bg-gray-800 border-gray-700 text-white pr-12 min-h-[48px]"
                  autoFocus
                  autoComplete="current-password"
                  aria-describedby={error ? `${passwordId}-error` : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <p id={`${passwordId}-error`} className="text-red-400 text-sm text-center" role="alert">
                {error}
              </p>
            )}

            {/* Botão */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 min-h-[48px]"
            >
              Entrar
            </Button>
          </form>
        </div>

        {/* Rodapé */}
        <p className="text-center text-gray-500 text-xs mt-6">© 2025 Aniversariante VIP • Em breve para todos</p>
      </div>
    </div>
  );
};

export default PasswordProtection;
