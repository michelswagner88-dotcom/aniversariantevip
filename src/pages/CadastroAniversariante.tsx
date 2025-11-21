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
    cpf: "",
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
    "AC": ["Rio Branco"],
    "AL": ["Maceió"],
    "AP": ["Macapá"],
    "AM": ["Manaus"],
    "BA": ["Salvador"],
    "CE": ["Fortaleza"],
    "DF": ["Brasília"],
    "ES": ["Vitória"],
    "GO": ["Goiânia"],
    "MA": ["São Luís"],
    "MT": ["Cuiabá"],
    "MS": ["Campo Grande"],
    "MG": ["Belo Horizonte"],
    "PA": ["Belém"],
    "PB": ["João Pessoa"],
    "PR": ["Curitiba"],
    "PE": ["Recife"],
    "PI": ["Teresina"],
    "RJ": ["Rio de Janeiro"],
    "RN": ["Natal"],
    "RS": ["Porto Alegre"],
    "RO": ["Porto Velho"],
    "RR": ["Boa Vista"],
    "SC": ["Florianópolis", "São José", "Palhoça", "Biguaçu"],
    "SP": ["São Paulo"],
    "SE": ["Aracaju"],
    "TO": ["Palmas"],
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
      // Verificar se existe cadastro completo
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", formData.email)
        .maybeSingle();

      if (existingProfile) {
        // Verificar se o cadastro está completo
        const { data: aniversarianteData } = await supabase
          .from("aniversariantes")
          .select("id")
          .eq("id", existingProfile.id)
          .maybeSingle();

        if (aniversarianteData) {
          toast({
            variant: "destructive",
            title: "Email já cadastrado",
            description: "Este email já está sendo usado por outra conta",
          });
          return;
        } else {
          toast({
            variant: "destructive",
            title: "Cadastro incompleto detectado",
            description: "Por favor, entre em contato com o suporte para liberar seu cadastro",
          });
          return;
        }
      }

      // Verificar se CPF já existe
      const { data: existingCPF } = await supabase
        .from("aniversariantes")
        .select("cpf")
        .eq("cpf", formData.cpf.replace(/\D/g, ""))
        .maybeSingle();

      if (existingCPF) {
        toast({
          variant: "destructive",
          title: "CPF já cadastrado",
          description: "Este CPF já está cadastrado no sistema",
        });
        return;
      }

      // Verificar se telefone já existe
      const { data: existingPhone } = await supabase
        .from("aniversariantes")
        .select("telefone")
        .eq("telefone", formData.telefone.replace(/\D/g, ""))
        .maybeSingle();

      if (existingPhone) {
        toast({
          variant: "destructive",
          title: "Telefone já cadastrado",
          description: "Este telefone já está cadastrado no sistema",
        });
        return;
      }

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

      if (signUpError) {
        // Traduzir erros comuns do Supabase
        if (signUpError.message.includes("already registered")) {
          throw new Error("Usuário já cadastrado");
        }
        throw new Error(signUpError.message);
      }
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
          cpf: formData.cpf.replace(/\D/g, ""),
          data_nascimento: formData.dataNascimento,
          telefone: formData.telefone.replace(/\D/g, ""),
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
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                required
                placeholder="000.000.000-00"
                maxLength={14}
                value={formData.cpf}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const formatted = value
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                  setFormData({ ...formData, cpf: formatted });
                }}
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
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  value={formData.telefone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const formatted = value
                      .replace(/(\d{2})(\d)/, "($1) $2")
                      .replace(/(\d{5})(\d)/, "$1-$2");
                    setFormData({ ...formData, telefone: formatted });
                  }}
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
