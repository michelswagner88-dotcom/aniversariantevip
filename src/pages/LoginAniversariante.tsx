import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginAniversariante() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

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
            
            <p className="text-center text-sm text-muted-foreground">
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
