import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { resizeImage } from "@/lib/imageUtils";
import { estabelecimentoSchema } from "@/lib/validation";

type HorarioFuncionamento = {
  id: string;
  dias: string[];
  abertura: string;
  fechamento: string;
};

export default function CadastroEstabelecimento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageReady, setPageReady] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<HorarioFuncionamento[]>([
    { id: '1', dias: [], abertura: '', fechamento: '' }
  ]);
  const [formData, setFormData] = useState({
    nomeFantasia: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    categoria: "",
    estado: "",
    cidade: "",
    endereco: "",
    linkCardapioDigital: "",
    beneficiosAniversariante: "",
    regrasAniversariante: "",
    validoDia: false,
    validoSemana: false,
    validoMes: false,
    logoUrl: "",
    telefoneContato: "",
    emailContato: "",
    instagram: "",
    facebook: "",
  });

  useEffect(() => {
    setPageReady(true);
  }, []);

  const diasSemana = [
    { value: 'segunda', label: 'Segunda' },
    { value: 'terca', label: 'Terça' },
    { value: 'quarta', label: 'Quarta' },
    { value: 'quinta', label: 'Quinta' },
    { value: 'sexta', label: 'Sexta' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
  ];

  const adicionarHorario = () => {
    setHorariosFuncionamento([
      ...horariosFuncionamento,
      { id: Date.now().toString(), dias: [], abertura: '', fechamento: '' }
    ]);
  };

  const removerHorario = (id: string) => {
    setHorariosFuncionamento(horariosFuncionamento.filter(h => h.id !== id));
  };

  const atualizarHorario = (id: string, campo: keyof HorarioFuncionamento, valor: any) => {
    setHorariosFuncionamento(horariosFuncionamento.map(h => 
      h.id === id ? { ...h, [campo]: valor } : h
    ));
  };

  const toggleDia = (horarioId: string, dia: string) => {
    const horario = horariosFuncionamento.find(h => h.id === horarioId);
    if (!horario) return;

    const novosDias = horario.dias.includes(dia)
      ? horario.dias.filter(d => d !== dia)
      : [...horario.dias, dia];

    atualizarHorario(horarioId, 'dias', novosDias);
  };

  const formatarHorarios = () => {
    return horariosFuncionamento
      .filter(h => h.dias.length > 0 && h.abertura && h.fechamento)
      .map(h => {
        const diasFormatados = h.dias
          .map(d => diasSemana.find(ds => ds.value === d)?.label)
          .join(', ');
        return `${diasFormatados}: ${h.abertura} às ${h.fechamento}`;
      })
      .join(' | ');
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Por favor, selecione um arquivo de imagem válido",
        });
        return;
      }
      
      try {
        toast({
          title: "Processando imagem...",
          description: "Ajustando dimensões da imagem",
        });
        
        // Redimensionar imagem antes de salvar
        const resizedFile = await resizeImage(file, 800, 800, 0.85);
        setLogoFile(resizedFile);
        
        toast({
          title: "Imagem processada",
          description: "A imagem foi ajustada com sucesso",
        });
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível processar a imagem",
        });
      }
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
    
    // Validate core fields with Zod
    const validationResult = estabelecimentoSchema.safeParse({
      nomeFantasia: formData.nomeFantasia,
      email: formData.email,
      telefone: formData.telefone,
      endereco: formData.endereco,
      senha: formData.senha,
      confirmarSenha: formData.confirmarSenha,
    });
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors;
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: errors[0]?.message || "Verifique os campos do formulário",
      });
      return;
    }

    const validatedData = validationResult.data;

    if (!formData.categoria) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione uma categoria",
      });
      return;
    }

    if (!formData.validoDia && !formData.validoSemana && !formData.validoMes) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione pelo menos um período de validade",
      });
      return;
    }

    const horarioFormatado = formatarHorarios();
    
    if (!horarioFormatado) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Configure pelo menos um horário de funcionamento",
      });
      return;
    }

    setUploading(true);

    try {
      // Create user account with validated data
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/area-estabelecimento`,
          data: {
            nome: validatedData.nomeFantasia,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      // Add estabelecimento role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "estabelecimento",
        });

      if (roleError) throw roleError;

      let logoUrl = "";
      
      // Upload da logo se houver arquivo
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${authData.user.id}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('estabelecimento-logos')
          .upload(fileName, logoFile, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('estabelecimento-logos')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      // Insert establishment data with validated fields
      const { error: estabError } = await supabase
        .from("estabelecimentos")
        .insert({
          id: authData.user.id,
          razao_social: validatedData.nomeFantasia,
          nome_fantasia: validatedData.nomeFantasia,
          cnpj: "", // Empty CNPJ is allowed by constraint
          telefone: validatedData.telefone, // Already cleaned by zod transform
          endereco: validatedData.endereco,
          descricao_beneficio: formData.beneficiosAniversariante,
          logo_url: logoUrl,
          tem_conta_acesso: true, // Marca que este estabelecimento tem conta de acesso
        });

      if (estabError) throw estabError;

      toast({
        title: "Sucesso!",
        description: "Cadastro realizado com sucesso! Verifique seu email para confirmar.",
      });

      navigate("/login/estabelecimento");
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível cadastrar o estabelecimento. Tente novamente.",
      });
    } finally {
      setUploading(false);
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
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select 
                      value={formData.estado} 
                      onValueChange={handleEstadoChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SC">Santa Catarina (SC)</SelectItem>
                        <SelectItem value="PR">Paraná (PR)</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul (RS)</SelectItem>
                        <SelectItem value="MG">Minas Gerais (MG)</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro (RJ)</SelectItem>
                        <SelectItem value="SP">São Paulo (SP)</SelectItem>
                        <SelectItem value="GO">Goiás (GO)</SelectItem>
                        <SelectItem value="DF">Distrito Federal (DF)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Select 
                      value={formData.cidade} 
                      onValueChange={(value) => setFormData({ ...formData, cidade: value })}
                      required
                      disabled={!formData.estado}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.estado && estadosCidades[formData.estado]?.map((cidade) => (
                          <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input
                    id="endereco"
                    required
                    placeholder="Rua, número, bairro, CEP"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Horários de Funcionamento *</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={adicionarHorario}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Horário
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {horariosFuncionamento.map((horario, index) => (
                      <Card key={horario.id} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Período {index + 1}</h4>
                            {horariosFuncionamento.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removerHorario(horario.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm">Dias da Semana</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {diasSemana.map((dia) => (
                                <div key={dia.value} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`${horario.id}-${dia.value}`}
                                    checked={horario.dias.includes(dia.value)}
                                    onChange={() => toggleDia(horario.id, dia.value)}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                  <Label 
                                    htmlFor={`${horario.id}-${dia.value}`}
                                    className="text-sm font-normal cursor-pointer"
                                  >
                                    {dia.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`abertura-${horario.id}`} className="text-sm">
                                Horário de Abertura
                              </Label>
                              <Input
                                id={`abertura-${horario.id}`}
                                type="time"
                                value={horario.abertura}
                                onChange={(e) => atualizarHorario(horario.id, 'abertura', e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`fechamento-${horario.id}`} className="text-sm">
                                Horário de Fechamento
                              </Label>
                              <Input
                                id={`fechamento-${horario.id}`}
                                type="time"
                                value={horario.fechamento}
                                onChange={(e) => atualizarHorario(horario.id, 'fechamento', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {formatarHorarios() && (
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      <strong>Prévia:</strong> {formatarHorarios()}
                    </div>
                  )}
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

                <div className="space-y-3">
                  <Label>Período de Validade do Benefício *</Label>
                  <p className="text-sm text-muted-foreground mb-2">Selecione quando o benefício pode ser utilizado (pode escolher mais de uma opção)</p>
                  <div className="space-y-3 border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="validoDia"
                        checked={formData.validoDia}
                        onChange={(e) => setFormData({ ...formData, validoDia: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="validoDia" className="font-normal cursor-pointer">
                        Válido no dia do aniversário
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="validoSemana"
                        checked={formData.validoSemana}
                        onChange={(e) => setFormData({ ...formData, validoSemana: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="validoSemana" className="font-normal cursor-pointer">
                        Válido na semana do aniversário
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="validoMes"
                        checked={formData.validoMes}
                        onChange={(e) => setFormData({ ...formData, validoMes: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="validoMes" className="font-normal cursor-pointer">
                        Válido no mês do aniversário
                      </Label>
                    </div>
                  </div>
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
