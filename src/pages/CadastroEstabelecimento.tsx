import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CadastroEstabelecimento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nomeFantasia: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    categoria: "",
    endereco: "",
    diasHorarioFuncionamento: "",
    linkCardapioDigital: "",
    beneficiosAniversariante: "",
    regrasAniversariante: "",
  });

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

    const estabelecimentos = JSON.parse(localStorage.getItem("estabelecimentos") || "[]");
    
    if (estabelecimentos.some((e: any) => e.email === formData.email)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "E-mail já cadastrado",
      });
      return;
    }

    estabelecimentos.push({
      ...formData,
      id: Date.now().toString(),
      senhaHash: formData.senha,
    });
    
    localStorage.setItem("estabelecimentos", JSON.stringify(estabelecimentos));
    localStorage.setItem("currentEstabelecimento", JSON.stringify({ ...formData, id: Date.now().toString() }));
    
    toast({
      title: "Sucesso!",
      description: "Cadastro realizado com sucesso",
    });
    
    navigate("/area-estabelecimento");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Cadastro de Estabelecimento</CardTitle>
          <CardDescription>Cadastre seu negócio e ofereça benefícios para aniversariantes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Dados de Acesso</h3>
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
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Dados do Estabelecimento</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
                  <Input
                    id="nomeFantasia"
                    required
                    value={formData.nomeFantasia}
                    onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="restaurante">Restaurante</SelectItem>
                      <SelectItem value="balada">Balada</SelectItem>
                      <SelectItem value="loja">Loja</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input
                    id="endereco"
                    required
                    placeholder="Rua, número, bairro, cidade, estado, CEP"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diasHorarioFuncionamento">Dias e Horário de Funcionamento *</Label>
                  <Textarea
                    id="diasHorarioFuncionamento"
                    required
                    placeholder="Ex: Seg a Sex: 18h às 23h | Sáb e Dom: 19h às 02h"
                    value={formData.diasHorarioFuncionamento}
                    onChange={(e) => setFormData({ ...formData, diasHorarioFuncionamento: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkCardapioDigital">Link do Cardápio Digital</Label>
                  <Input
                    id="linkCardapioDigital"
                    type="url"
                    placeholder="https://"
                    value={formData.linkCardapioDigital}
                    onChange={(e) => setFormData({ ...formData, linkCardapioDigital: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficiosAniversariante">Benefícios para Aniversariantes *</Label>
                  <Textarea
                    id="beneficiosAniversariante"
                    required
                    placeholder="Descreva os benefícios que o aniversariante irá ganhar"
                    value={formData.beneficiosAniversariante}
                    onChange={(e) => setFormData({ ...formData, beneficiosAniversariante: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regrasAniversariante">Regras para Aniversariantes *</Label>
                  <Textarea
                    id="regrasAniversariante"
                    required
                    placeholder="Explique as regras, documentos necessários, número de pessoas, etc."
                    value={formData.regrasAniversariante}
                    onChange={(e) => setFormData({ ...formData, regrasAniversariante: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">Cadastrar Estabelecimento</Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login/estabelecimento" className="text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
