import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, LogOut, Edit2, Save, Ticket, Search, Upload, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { resizeImage } from "@/lib/imageUtils";

export default function AreaEstabelecimento() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [searchCPF, setSearchCPF] = useState("");
  const [foundAniversariante, setFoundAniversariante] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cuponsEmitidos, setCuponsEmitidos] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nomeFantasia: "",
    email: "",
    telefone: "",
    categoria: "",
    endereco: "",
    diasHorarioFuncionamento: "",
    linkCardapioDigital: "",
    beneficiosAniversariante: "",
    regrasAniversariante: "",
    periodoValidade: "dia", // "dia" ou "mes"
    logoUrl: "",
    telefoneContato: "",
    emailContato: "",
    instagram: "",
    facebook: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login/estabelecimento");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles?.some(r => r.role === "estabelecimento")) {
        navigate("/login/estabelecimento");
        return;
      }

      const { data: estabelecimento } = await supabase
        .from("estabelecimentos")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (estabelecimento) {
        setUserId(session.user.id);
        setUserData({
          id: estabelecimento.id,
          email: session.user.email || "",
          razaoSocial: estabelecimento.razao_social,
          nomeFantasia: estabelecimento.nome_fantasia || "",
          cnpj: estabelecimento.cnpj,
          telefone: estabelecimento.telefone || "",
          categoria: "",
          endereco: estabelecimento.endereco || "",
          diasHorarioFuncionamento: "",
          linkCardapioDigital: "",
          beneficiosAniversariante: estabelecimento.descricao_beneficio || "",
          regrasAniversariante: "",
          periodoValidade: "dia",
          logoUrl: estabelecimento.logo_url || "",
          telefoneContato: "",
          emailContato: "",
          instagram: "",
          facebook: "",
        });
        setFormData({
          nomeFantasia: estabelecimento.nome_fantasia || "",
          email: session.user.email || "",
          telefone: estabelecimento.telefone || "",
          categoria: "",
          endereco: estabelecimento.endereco || "",
          diasHorarioFuncionamento: "",
          linkCardapioDigital: "",
          beneficiosAniversariante: estabelecimento.descricao_beneficio || "",
          regrasAniversariante: "",
          periodoValidade: "dia",
          logoUrl: estabelecimento.logo_url || "",
          telefoneContato: "",
          emailContato: "",
          instagram: "",
          facebook: "",
        });
        await loadCuponsEmitidos(session.user.id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      navigate("/login/estabelecimento");
    }
  };

  const loadCuponsEmitidos = async (estabelecimentoId: string) => {
    const { count, error } = await supabase
      .from("cupons")
      .select("*", { count: "exact", head: true })
      .eq("estabelecimento_id", estabelecimentoId);

    if (error) {
      console.error("Erro ao carregar cupons:", error);
      return;
    }

    setCuponsEmitidos(count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
    const cleanValue = value.replace(/^@/, "");
    setFormData({ ...formData, instagram: cleanValue });
  };

  const handleFacebookChange = (value: string) => {
    const cleanValue = value.replace(/^@/, "");
    setFormData({ ...formData, facebook: cleanValue });
  };

  const handleSave = async () => {
    if (!userData) return;

    try {
      let logoUrl = formData.logoUrl;

      // Upload da logo se houver arquivo novo
      if (logoFile) {
        setUploading(true);
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        
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
        setUploading(false);
      }

      const { error } = await supabase
        .from("estabelecimentos")
        .update({
          nome_fantasia: formData.nomeFantasia,
          telefone: formData.telefone,
          endereco: formData.endereco,
          descricao_beneficio: formData.beneficiosAniversariante,
          logo_url: logoUrl,
        })
        .eq("id", userId);

      if (error) throw error;

      const updatedData = { ...formData, logoUrl };
      setUserData({ ...userData, ...updatedData });
      setFormData(updatedData);
      setIsEditing(false);
      setLogoFile(null);
      
      toast({
        title: "Sucesso!",
        description: "Dados atualizados com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as alterações",
      });
    }
  };

  const handleSearchAniversariante = async () => {
    try {
      const { data: aniversariante, error: anivError } = await supabase
        .from("aniversariantes")
        .select("*")
        .eq("cpf", searchCPF)
        .single();

      if (anivError || !aniversariante) {
        toast({
          variant: "destructive",
          title: "Não encontrado",
          description: "Nenhum aniversariante encontrado com este CPF",
        });
        setFoundAniversariante(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", aniversariante.id)
        .single();

      if (profileError || !profile) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao buscar dados do aniversariante",
        });
        setFoundAniversariante(null);
        return;
      }

      setFoundAniversariante({
        id: aniversariante.id,
        nomeCompleto: profile.nome,
        cpf: aniversariante.cpf,
        dataNascimento: aniversariante.data_nascimento,
      });
    } catch (error) {
      console.error("Erro ao buscar aniversariante:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao buscar aniversariante",
      });
      setFoundAniversariante(null);
    }
  };

  const handleEmitirCupom = async () => {
    if (!foundAniversariante || !userId) return;

    try {
      const codigo = `ANIV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const { error } = await supabase
        .from("cupons")
        .insert({
          codigo: codigo,
          estabelecimento_id: userId,
          aniversariante_id: foundAniversariante.id,
          data_emissao: new Date().toISOString(),
          usado: false,
        });

      if (error) throw error;

      toast({
        title: "Cupom Emitido!",
        description: `Cupom emitido para ${foundAniversariante.nomeCompleto}`,
      });

      setSearchCPF("");
      setFoundAniversariante(null);
      await loadCuponsEmitidos(userId);
    } catch (error: any) {
      console.error("Erro ao emitir cupom:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível emitir o cupom. Tente novamente.",
      });
    }
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ANIVERSARIANTE VIP</h1>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Ticket className="mr-2 h-4 w-4" />
                  Emitir Cupom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Emitir Cupom de Aniversário</DialogTitle>
                  <DialogDescription>
                    Busque o aniversariante pelo CPF para emitir o cupom
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o CPF"
                      value={searchCPF}
                      onChange={(e) => setSearchCPF(e.target.value)}
                    />
                    <Button onClick={handleSearchAniversariante}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {foundAniversariante && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Aniversariante Encontrado</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Nome:</strong> {foundAniversariante.nomeCompleto}</p>
                        <p><strong>CPF:</strong> {foundAniversariante.cpf}</p>
                        <p><strong>Data de Nascimento:</strong> {new Date(foundAniversariante.dataNascimento).toLocaleDateString('pt-BR')}</p>
                        <Button onClick={handleEmitirCupom} className="w-full mt-4">
                          <Ticket className="mr-2 h-4 w-4" />
                          Emitir Cupom
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Cupons Emitidos
            </CardTitle>
            <CardDescription>Total de cupons emitidos até o momento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{cuponsEmitidos}</div>
          </CardContent>
        </Card>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Dados do Estabelecimento</CardTitle>
            <CardDescription>Gerencie as informações do seu negócio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo do Estabelecimento</Label>
              {formData.logoUrl && !isEditing && (
                <div className="mb-2">
                  <img src={formData.logoUrl} alt="Logo" className="h-24 w-24 object-cover rounded" />
                </div>
              )}
              {isEditing && (
                <div className="space-y-2">
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
              )}
              {!isEditing && !formData.logoUrl && (
                <p className="text-sm text-muted-foreground">Nenhuma logo cadastrada</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diasHorarioFuncionamento">Dias e Horário de Funcionamento</Label>
              <Textarea
                id="diasHorarioFuncionamento"
                value={formData.diasHorarioFuncionamento}
                onChange={(e) => setFormData({ ...formData, diasHorarioFuncionamento: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkCardapioDigital">Link do Cardápio Digital</Label>
              <Input
                id="linkCardapioDigital"
                value={formData.linkCardapioDigital}
                onChange={(e) => setFormData({ ...formData, linkCardapioDigital: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefoneContato">Telefone de Contato</Label>
                <Input
                  id="telefoneContato"
                  placeholder="(00) 00000-0000"
                  value={formData.telefoneContato}
                  onChange={(e) => setFormData({ ...formData, telefoneContato: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailContato">Email de Contato</Label>
                <Input
                  id="emailContato"
                  type="email"
                  placeholder="contato@estabelecimento.com"
                  value={formData.emailContato}
                  onChange={(e) => setFormData({ ...formData, emailContato: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="instagram"
                    placeholder="seuusuario"
                    value={formData.instagram}
                    onChange={(e) => handleInstagramChange(e.target.value)}
                    className="pl-7"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="facebook"
                    placeholder="seuusuario"
                    value={formData.facebook}
                    onChange={(e) => handleFacebookChange(e.target.value)}
                    className="pl-7"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiosAniversariante">Benefícios para Aniversariantes</Label>
              <Textarea
                id="beneficiosAniversariante"
                value={formData.beneficiosAniversariante}
                onChange={(e) => setFormData({ ...formData, beneficiosAniversariante: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regrasAniversariante">Regras para Aniversariantes</Label>
              <Textarea
                id="regrasAniversariante"
                value={formData.regrasAniversariante}
                onChange={(e) => setFormData({ ...formData, regrasAniversariante: e.target.value })}
                disabled={!isEditing}
                placeholder="Ex: Apresentar documento com foto. Não acumulativo com outras promoções."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodoValidade">Período de Validade do Benefício</Label>
              <Select 
                value={formData.periodoValidade} 
                onValueChange={(value) => setFormData({ ...formData, periodoValidade: value })}
                disabled={!isEditing}
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

            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar dados
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="flex-1" disabled={uploading}>
                    <Save className="mr-2 h-4 w-4" />
                    {uploading ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1" disabled={uploading}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
