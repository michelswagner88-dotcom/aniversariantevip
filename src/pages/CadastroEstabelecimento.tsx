import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function CadastroEstabelecimento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
    periodoValidade: "dia",
    logoUrl: "",
    telefoneContato: "",
    emailContato: "",
    instagram: "",
    facebook: "",
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleInstagramChange = (value: string) => {
    // Remove @ se já existir e adiciona de volta
    const cleanValue = value.replace(/^@/, "");
    setFormData({ ...formData, instagram: cleanValue });
  };

  const handleFacebookChange = (value: string) => {
    // Remove @ se já existir e adiciona de volta
    const cleanValue = value.replace(/^@/, "");
    setFormData({ ...formData, facebook: cleanValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não conferem",
      });
      return;
    }

    if (!formData.categoria) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione uma categoria",
      });
      return;
    }

    if (!formData.periodoValidade) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione o período de validade do benefício",
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

    let logoUrl = "";
    
    // Upload da logo se houver arquivo
    if (logoFile) {
      setUploading(true);
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('estabelecimento-logos')
        .upload(fileName, logoFile);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: "Não foi possível fazer upload da logo",
        });
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('estabelecimento-logos')
        .getPublicUrl(fileName);
      
      logoUrl = publicUrl;
      setUploading(false);
    }

    const novoEstabelecimento = {
      ...formData,
      logoUrl,
      id: Date.now().toString(),
      senhaHash: formData.senha,
    };

    estabelecimentos.push(novoEstabelecimento);
    
    localStorage.setItem("estabelecimentos", JSON.stringify(estabelecimentos));
    localStorage.setItem("currentEstabelecimento", JSON.stringify(novoEstabelecimento));
    
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
                  <Label htmlFor="logo">Logo do Estabelecimento</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="flex-1"
                    />
                    {logoFile && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Upload className="h-4 w-4" />
                        {logoFile.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG, WEBP (max 5MB)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    required
                  >
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
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Contatos e Redes Sociais</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefoneContato">Telefone de Contato *</Label>
                  <Input
                    id="telefoneContato"
                    required
                    placeholder="(00) 00000-0000"
                    value={formData.telefoneContato}
                    onChange={(e) => setFormData({ ...formData, telefoneContato: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailContato">Email de Contato *</Label>
                  <Input
                    id="emailContato"
                    type="email"
                    required
                    placeholder="contato@estabelecimento.com"
                    value={formData.emailContato}
                    onChange={(e) => setFormData({ ...formData, emailContato: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input
                      id="instagram"
                      required
                      placeholder="seuusuario"
                      value={formData.instagram}
                      onChange={(e) => handleInstagramChange(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input
                      id="facebook"
                      required
                      placeholder="seuusuario"
                      value={formData.facebook}
                      onChange={(e) => handleFacebookChange(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Benefícios</h3>
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="periodoValidade">Período de Validade do Benefício *</Label>
                  <Select 
                    value={formData.periodoValidade} 
                    onValueChange={(value) => setFormData({ ...formData, periodoValidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dia">Somente no dia do aniversário</SelectItem>
                      <SelectItem value="mes">Durante o mês do aniversário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "Enviando..." : "Cadastrar Estabelecimento"}
            </Button>
            
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
