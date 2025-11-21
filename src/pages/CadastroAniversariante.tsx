import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { aniversarianteSchema } from "@/lib/validation";

export default function CadastroAniversariante() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageReady, setPageReady] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    telefone: "",
    estado: "",
    cidade: "",
    dataNascimento: "",
    senha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    setPageReady(true);
  }, []);

  const estadosCidades: Record<string, string[]> = {
    "SC": ["Florianópolis", "São José", "Palhoça", "Biguaçu"],
    "PR": ["Curitiba"],
    "RS": ["Porto Alegre"],
    "MG": ["Belo Horizonte"],
    "RJ": ["Rio de Janeiro"],
    "SP": ["São Paulo"],
    "GO": ["Goiânia"],
    "DF": ["Brasília"],
  };

  const handleEstadoChange = (value: string) => {
    setFormData({ ...formData, estado: value, cidade: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "As senhas não coincidem",
      });
      return;
    }

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: formData.nomeCompleto,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Falha ao criar usuário");

      // Adicionar role de aniversariante
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "aniversariante",
        });

      if (roleError) throw roleError;

      // Inserir dados específicos do aniversariante
      const { error: profileError } = await supabase
        .from("aniversariantes")
        .insert({
          id: authData.user.id,
          cpf: "",
          data_nascimento: formData.dataNascimento,
          telefone: formData.telefone,
        });

      if (profileError) throw profileError;

      toast({
        title: "Sucesso!",
        description: "Cadastro realizado com sucesso. Você já pode fazer login.",
      });
      
      navigate("/login/aniversariante");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Não foi possível completar o cadastro",
      });
    }
  };

  if (!pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Cadastro de Aniversariante</CardTitle>
          <CardDescription>Preencha seus dados para ter acesso aos benefícios</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">Nome Completo *</Label>
              <Input
                id="nomeCompleto"
                required
                value={formData.nomeCompleto}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select value={formData.estado} onValueChange={handleEstadoChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(estadosCidades).map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Select 
                  value={formData.cidade} 
                  onValueChange={(value) => setFormData({ ...formData, cidade: value })}
                  disabled={!formData.estado}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.estado ? "Selecione a cidade" : "Selecione o estado primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.estado && estadosCidades[formData.estado]?.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>
                        {cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
              <Input
                id="dataNascimento"
                type="date"
                required
                value={formData.dataNascimento}
                onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  required
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">Cadastrar</Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login/aniversariante" className="text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
