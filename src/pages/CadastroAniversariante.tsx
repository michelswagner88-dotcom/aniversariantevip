import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { aniversarianteSchema } from "@/lib/validation";
import { ESTADOS_CIDADES, ESTADOS } from "@/lib/constants";

export default function CadastroAniversariante() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageReady, setPageReady] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    cpf: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    dataNascimento: "",
    senha: "",
    confirmarSenha: "",
  });
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    setPageReady(true);
  }, []);

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    
    if (cepLimpo.length !== 8) return;
    
    setBuscandoCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "Verifique o CEP digitado e tente novamente",
        });
        return;
      }
      
      setFormData({
        ...formData,
        cep,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      });
      
      toast({
        title: "Endereço encontrado!",
        description: "Os campos foram preenchidos automaticamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar o endereço. Tente novamente.",
      });
    } finally {
      setBuscandoCep(false);
    }
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
          cep: formData.cep.replace(/\D/g, ""),
          logradouro: formData.logradouro,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
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

            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                required
                placeholder="00000-000"
                maxLength={9}
                value={formData.cep}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const formatted = value.replace(/(\d{5})(\d)/, "$1-$2");
                  setFormData({ ...formData, cep: formatted });
                  
                  if (value.length === 8) {
                    buscarCep(formatted);
                  }
                }}
                disabled={buscandoCep}
              />
              {buscandoCep && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Buscando endereço...
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="logradouro">Rua/Logradouro *</Label>
                <Input
                  id="logradouro"
                  required
                  value={formData.logradouro}
                  onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                  placeholder="Ex: Rua das Flores"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ex: 123"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  required
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  placeholder="Ex: Centro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  placeholder="Ex: Apto 101"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  required
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select value={formData.estado} onValueChange={handleEstadoChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label} ({estado.value})
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
                <PasswordInput
                  id="senha"
                  required
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <PasswordInput
                  id="confirmarSenha"
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
                Faça Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
