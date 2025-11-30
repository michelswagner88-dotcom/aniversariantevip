import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Loader2, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cnpjSchema } from "@/lib/validation";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { normalizarCidade } from "@/lib/utils";
import GaleriaFotosUpload from "@/components/GaleriaFotosUpload";
import EspecialidadesSelector from "@/components/EspecialidadesSelector";

type HorarioFuncionamento = {
  id: string;
  dias: string[];
  abertura: string;
  fechamento: string;
};

const estabelecimentoSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100),
  cnpj: cnpjSchema,
  nomeFantasia: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  razaoSocial: z.string().trim().min(3).max(200),
  telefone: z.string().trim().max(20),
  endereco: z.string().trim().max(500),
  descricaoBeneficio: z.string().trim().max(1000),
});

export const CadastrarEstabelecimento = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [galeriaFotos, setGaleriaFotos] = useState<string[]>([]);
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<HorarioFuncionamento[]>([
    { id: '1', dias: [], abertura: '', fechamento: '' }
  ]);
  
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    cnpj: "",
    nomeFantasia: "",
    razaoSocial: "",
    telefone: "",
    endereco: "",
    categorias: [] as string[],
    especialidades: [] as string[],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = estabelecimentoSchema.parse(formData);
      setLoading(true);

      // Verificar se CNPJ já existe
      const { data: existingCNPJ } = await supabase
        .from("estabelecimentos")
        .select("cnpj")
        .eq("cnpj", validatedData.cnpj)
        .maybeSingle();

      if (existingCNPJ) {
        toast.error("CNPJ já cadastrado no sistema");
        setLoading(false);
        return;
      }

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

      // Criar registro do estabelecimento
      const { error: estabError } = await supabase
        .from('estabelecimentos')
        .insert({
          id: userId,
          razao_social: validatedData.razaoSocial,
          nome_fantasia: validatedData.nomeFantasia,
          cnpj: validatedData.cnpj,
          telefone: validatedData.telefone,
          endereco: validatedData.endereco,
          cidade: normalizarCidade(formData.cidade),
          estado: formData.estado,
          categoria: formData.categorias.length > 0 ? formData.categorias : null,
          especialidades: formData.especialidades.length > 0 ? formData.especialidades : null,
          descricao_beneficio: validatedData.descricaoBeneficio,
          logo_url: logoPreview || null,
          galeria_fotos: galeriaFotos,
          tem_conta_acesso: true,
          link_cardapio: formData.linkCardapio || null,
          regras_utilizacao: formData.regrasUtilizacao || null,
          periodo_validade_beneficio: formData.periodoValidade,
          horario_funcionamento: formatarHorarios() || null,
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
        cnpj: "",
        nomeFantasia: "",
        razaoSocial: "",
        telefone: "",
        endereco: "",
        categorias: [],
        especialidades: [],
        cidade: "",
        estado: "",
        descricaoBeneficio: "",
        linkCardapio: "",
        regrasUtilizacao: "",
        periodoValidade: "dia_aniversario",
      });
      setLogoPreview("");
      setGaleriaFotos([]);
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
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const formatted = value
                    .replace(/(\d{2})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1/$2")
                    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
                  setFormData({ ...formData, cnpj: formatted });
                }}
                required
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>

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
                {CATEGORIAS_ESTABELECIMENTO.map((cat) => (
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
                      {cat.icon} {cat.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.categorias.length === 0 && (
                <p className="text-sm text-muted-foreground">Selecione pelo menos uma categoria</p>
              )}
            </div>

            <div className="space-y-2">
              <EspecialidadesSelector
                categoria={formData.categorias[0] || ''}
                selected={formData.especialidades}
                onChange={(especialidades) => setFormData({ ...formData, especialidades })}
                maxSelection={3}
              />
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

            <GaleriaFotosUpload
              fotoPrincipal={logoPreview}
              setFotoPrincipal={setLogoPreview}
              galeriaFotos={galeriaFotos}
              setGaleriaFotos={setGaleriaFotos}
              maxFotos={5}
            />

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
