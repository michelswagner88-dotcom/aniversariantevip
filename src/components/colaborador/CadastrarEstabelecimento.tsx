import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Loader2, Upload, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { resizeImage } from "@/lib/imageUtils";

type HorarioFuncionamento = {
  id: string;
  dias: string[];
  abertura: string;
  fechamento: string;
};

const estabelecimentoSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100),
  nomeFantasia: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  razaoSocial: z.string().trim().min(3).max(200),
  cnpj: z.string().trim().min(14, "CNPJ inválido").max(18),
  telefone: z.string().trim().max(20),
  endereco: z.string().trim().max(500),
  descricaoBeneficio: z.string().trim().max(1000),
});

export const CadastrarEstabelecimento = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<HorarioFuncionamento[]>([
    { id: '1', dias: [], abertura: '', fechamento: '' }
  ]);
  
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    telefone: "",
    endereco: "",
    categorias: [] as string[],
    cidade: "",
    estado: "",
    descricaoBeneficio: "",
    linkCardapio: "",
    regrasUtilizacao: "",
    periodoValidade: "dia_aniversario",
  });

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
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    try {
      const resizedBlob = await resizeImage(file, 500, 500);
      const resizedFile = new File([resizedBlob], file.name, { type: file.type });
      setLogoFile(resizedFile);
      setLogoPreview(URL.createObjectURL(resizedFile));
      toast.success("Logo carregada com sucesso!");
    } catch (error) {
      toast.error("Erro ao processar imagem");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = estabelecimentoSchema.parse(formData);
      setLoading(true);

      // Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.senha,
        options: {
          emailRedirectTo: `${window.location.origin}/area-estabelecimento`,
          data: {
            nome: validatedData.nomeFantasia,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      const userId = authData.user.id;

      // Upload da logo se houver
      let logoUrl = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('estabelecimento-logos')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('estabelecimento-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Criar registro do estabelecimento
      const { error: estabError } = await supabase
        .from('estabelecimentos')
        .insert({
          id: userId,
          razao_social: validatedData.razaoSocial,
          nome_fantasia: validatedData.nomeFantasia,
          cnpj: validatedData.cnpj.replace(/\D/g, ''),
          telefone: validatedData.telefone,
          endereco: validatedData.endereco,
          cidade: formData.cidade,
          estado: formData.estado,
          categoria: formData.categorias.length > 0 ? formData.categorias : null,
          descricao_beneficio: validatedData.descricaoBeneficio,
          logo_url: logoUrl,
          tem_conta_acesso: true,
          link_cardapio: formData.linkCardapio || null,
          regras_utilizacao: formData.regrasUtilizacao || null,
          periodo_validade_beneficio: formData.periodoValidade,
        });

      if (estabError) throw estabError;

      // Adicionar role de estabelecimento
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'estabelecimento'
        });

      if (roleError) throw roleError;

      toast.success("Estabelecimento cadastrado com sucesso!");
      setDialogOpen(false);
      setFormData({
        email: "",
        senha: "",
        nomeFantasia: "",
        razaoSocial: "",
        cnpj: "",
        telefone: "",
        endereco: "",
        categorias: [],
        cidade: "",
        estado: "",
        descricaoBeneficio: "",
        linkCardapio: "",
        regrasUtilizacao: "",
        periodoValidade: "dia_aniversario",
      });
      setLogoFile(null);
      setLogoPreview("");
      setHorariosFuncionamento([{ id: '1', dias: [], abertura: '', fechamento: '' }]);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.message || "Erro ao cadastrar estabelecimento");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Building2 className="mr-2 h-4 w-4" />
          Cadastrar Estabelecimento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Estabelecimento</DialogTitle>
          <CardDescription>
            Cadastro manual sem cobrança de assinatura
          </CardDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Dados de Acesso</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required
                minLength={6}
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Dados do Estabelecimento</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="razaoSocial">Razão Social</Label>
              <Input
                id="razaoSocial"
                value={formData.razaoSocial}
                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                required
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                required
                placeholder="(00) 00000-0000"
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label>Categorias (selecione uma ou mais)</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-md">
                {[
                  { value: "bares", label: "Bares" },
                  { value: "cafeterias", label: "Cafeterias" },
                  { value: "casas_noturnas", label: "Casas noturnas" },
                  { value: "confeitarias", label: "Confeitarias" },
                  { value: "entretenimento", label: "Entretenimento" },
                  { value: "farmacias", label: "Farmácias" },
                  { value: "hoteis_pousadas", label: "Hotéis / pousadas" },
                  { value: "lojas", label: "Lojas" },
                  { value: "restaurantes", label: "Restaurantes" },
                  { value: "servicos", label: "Serviços" },
                  { value: "sorveterias", label: "Sorveterias" },
                ].map((cat) => (
                  <div key={cat.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={cat.value}
                      checked={formData.categorias.includes(cat.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, categorias: [...formData.categorias, cat.value] });
                        } else {
                          setFormData({ ...formData, categorias: formData.categorias.filter(c => c !== cat.value) });
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    />
                    <Label htmlFor={cat.value} className="text-sm font-normal cursor-pointer">
                      {cat.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.categorias.length === 0 && (
                <p className="text-sm text-muted-foreground">Selecione pelo menos uma categoria</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(value) => setFormData({ ...formData, estado: value, cidade: "" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="GO">Goiás</SelectItem>
                    <SelectItem value="DF">Distrito Federal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  required
                  placeholder="Digite a cidade"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                required
                maxLength={500}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Horários de Funcionamento</Label>
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
                                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
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
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Logo
                </Button>
                {logoPreview && (
                  <img 
                    src={logoPreview} 
                    alt="Preview" 
                    className="h-16 w-16 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricaoBeneficio">Descrição do Benefício</Label>
              <Textarea
                id="descricaoBeneficio"
                value={formData.descricaoBeneficio}
                onChange={(e) => setFormData({ ...formData, descricaoBeneficio: e.target.value })}
                required
                maxLength={1000}
                placeholder="Ex: 10% de desconto para aniversariantes"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              "Cadastrar Estabelecimento"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
