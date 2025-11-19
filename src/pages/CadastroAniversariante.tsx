import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CadastroAniversariante() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    email: "",
    telefone: "",
    estado: "",
    cidade: "",
    dataNascimento: "",
    senha: "",
    confirmarSenha: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não conferem",
      });
      return;
    }

    // Simulação de cadastro - será substituído pelo backend
    const aniversariantes = JSON.parse(localStorage.getItem("aniversariantes") || "[]");
    
    if (aniversariantes.some((a: any) => a.email === formData.email)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "E-mail já cadastrado",
      });
      return;
    }

    aniversariantes.push({
      ...formData,
      id: Date.now().toString(),
      senhaHash: formData.senha,
    });
    
    localStorage.setItem("aniversariantes", JSON.stringify(aniversariantes));
    localStorage.setItem("currentAniversariante", JSON.stringify({ ...formData, id: Date.now().toString() }));
    
    toast({
      title: "Sucesso!",
      description: "Cadastro realizado com sucesso",
    });
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Cadastro de Aniversariante</CardTitle>
          <CardDescription>Preencha seus dados para começar a receber benefícios</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
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
