import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Loader2, Upload } from "lucide-react";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { resizeImage } from "@/lib/imageUtils";

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
  
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    telefone: "",
    endereco: "",
    descricaoBeneficio: "",
  });

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
          descricao_beneficio: validatedData.descricaoBeneficio,
          logo_url: logoUrl,
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
        descricaoBeneficio: "",
      });
      setLogoFile(null);
      setLogoPreview("");
      
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
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                required
                maxLength={500}
              />
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
