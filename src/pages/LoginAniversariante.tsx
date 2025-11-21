import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function LoginAniversariante() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageReady, setPageReady] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  useEffect(() => {
    setPageReady(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const aniversariantes = JSON.parse(localStorage.getItem("aniversariantes") || "[]");
    const usuario = aniversariantes.find(
      (a: any) => a.email === formData.email && a.senhaHash === formData.senha
    );

    if (usuario) {
      localStorage.setItem("currentAniversariante", JSON.stringify(usuario));
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso",
      });
      navigate("/");
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "E-mail ou senha incorretos",
      });
    }
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoEmail(true);

    try {
      const aniversariantes = JSON.parse(localStorage.getItem("aniversariantes") || "[]");
      const usuario = aniversariantes.find((a: any) => a.email === emailRecuperacao);

      if (!usuario) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "E-mail não encontrado",
        });
        setEnviandoEmail(false);
        return;
      }

      const { error } = await supabase.functions.invoke("enviar-senha", {
        body: {
          email: emailRecuperacao,
          tipo: "aniversariante",
          senha: usuario.senhaHash,
        },
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada com sua senha",
      });
      setShowRecuperarSenha(false);
      setEmailRecuperacao("");
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o email. Tente novamente.",
      });
    } finally {
      setEnviandoEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Login Aniversariante</CardTitle>
          <CardDescription>Acesse sua área exclusiva</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full">Entrar</Button>

            <button
              type="button"
              onClick={() => setShowRecuperarSenha(!showRecuperarSenha)}
              className="w-full text-center text-sm text-primary hover:underline mt-2"
            >
              Esqueci minha senha
            </button>

            {showRecuperarSenha && (
              <form onSubmit={handleRecuperarSenha} className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="emailRecuperacao">Digite seu e-mail</Label>
                  <Input
                    id="emailRecuperacao"
                    type="email"
                    required
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={enviandoEmail}>
                  {enviandoEmail ? "Enviando..." : "Enviar senha por email"}
                </Button>
              </form>
            )}
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Não tem uma conta?{" "}
              <Link to="/cadastro/aniversariante" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
