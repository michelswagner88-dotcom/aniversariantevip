import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import MaskedInput from "@/components/MaskedInput";
import { useInputMask } from "@/hooks/useInputMask";

interface User {
  id: string;
  nome: string | null;
  email: string;
  cpf: string;
  telefone: string | null;
  data_nascimento: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
}

interface EditUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditUserModal({ user, open, onOpenChange, onSuccess }: EditUserModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<User | null>(user);

  const { cpfMask, phoneMask, cepMask } = useInputMask();

  // Update formData when user changes
  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleSave = async () => {
    if (!formData) return;

    // Validação básica
    if (!formData.nome?.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (!formData.email?.trim()) {
      toast.error("Email é obrigatório");
      return;
    }

    if (!formData.cpf || formData.cpf.replace(/\D/g, "").length !== 11) {
      toast.error("CPF inválido");
      return;
    }

    try {
      setSaving(true);

      // Atualizar profile (nome e email)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nome: formData.nome,
          email: formData.email,
        })
        .eq("id", formData.id);

      if (profileError) throw profileError;

      // Atualizar aniversariante (todos os outros dados)
      const { error: anivError } = await supabase
        .from("aniversariantes")
        .update({
          cpf: formData.cpf,
          telefone: formData.telefone,
          data_nascimento: formData.data_nascimento,
          cep: formData.cep,
          estado: formData.estado,
          cidade: formData.cidade,
          bairro: formData.bairro,
          logradouro: formData.logradouro,
          numero: formData.numero,
          complemento: formData.complemento,
        })
        .eq("id", formData.id);

      if (anivError) throw anivError;

      toast.success("Usuário atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      // Tratamento específico de erros de duplicata
      if (error.code === "23505") {
        if (error.message?.includes("cpf")) {
          toast.error("Este CPF já está cadastrado em outra conta.");
        } else if (error.message?.includes("telefone")) {
          toast.error("Este telefone já está cadastrado em outra conta.");
        } else if (error.message?.includes("email")) {
          toast.error("Este email já está cadastrado em outra conta.");
        } else {
          toast.error("Dados duplicados detectados. Verifique CPF, telefone e email.");
        }
      } else {
        toast.error("Erro ao salvar alterações");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>Edite todas as informações do aniversariante</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pessoal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pessoal" className="min-h-[44px]">
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="contato" className="min-h-[44px]">
              Contato
            </TabsTrigger>
            <TabsTrigger value="endereco" className="min-h-[44px]">
              Endereço
            </TabsTrigger>
          </TabsList>

          {/* DADOS PESSOAIS */}
          <TabsContent value="pessoal" className="space-y-4">
            <div>
              <Label htmlFor="user-nome">Nome Completo *</Label>
              <Input
                id="user-nome"
                value={formData.nome || ""}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ Alterar email pode impedir o usuário de fazer login
              </p>
            </div>

            <div>
              <Label htmlFor="user-cpf">CPF *</Label>
              <MaskedInput
                id="user-cpf"
                value={formData.cpf}
                onChange={(value) => setFormData({ ...formData, cpf: value })}
                mask={cpfMask}
                placeholder="000.000.000-00"
                className="min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground mt-1">⚠️ CPF é usado para verificação de identidade</p>
            </div>

            <div>
              <Label htmlFor="user-nascimento">Data de Nascimento *</Label>
              <Input
                id="user-nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
          </TabsContent>

          {/* CONTATO */}
          <TabsContent value="contato" className="space-y-4">
            <div>
              <Label htmlFor="user-telefone">Telefone/Celular *</Label>
              <MaskedInput
                id="user-telefone"
                value={formData.telefone || ""}
                onChange={(value) => setFormData({ ...formData, telefone: value })}
                mask={phoneMask}
                placeholder="(00) 00000-0000"
                className="min-h-[44px]"
              />
            </div>
          </TabsContent>

          {/* ENDEREÇO */}
          <TabsContent value="endereco" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-cep">CEP *</Label>
                <MaskedInput
                  id="user-cep"
                  value={formData.cep}
                  onChange={(value) => setFormData({ ...formData, cep: value })}
                  mask={cepMask}
                  placeholder="00000-000"
                  className="min-h-[44px]"
                />
              </div>
              <div>
                <Label htmlFor="user-numero">Número</Label>
                <Input
                  id="user-numero"
                  value={formData.numero || ""}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="123"
                  className="min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="user-complemento">Complemento</Label>
              <Input
                id="user-complemento"
                value={formData.complemento || ""}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                placeholder="Apto 45, Bloco B..."
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="user-logradouro">Rua/Logradouro *</Label>
              <Input
                id="user-logradouro"
                value={formData.logradouro}
                onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                placeholder="Rua exemplo"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="user-bairro">Bairro *</Label>
              <Input
                id="user-bairro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                placeholder="Centro"
                className="min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-cidade">Cidade *</Label>
                <Input
                  id="user-cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Florianópolis"
                  className="min-h-[44px]"
                />
              </div>
              <div>
                <Label htmlFor="user-estado">Estado (UF) *</Label>
                <Input
                  id="user-estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  placeholder="SC"
                  maxLength={2}
                  className="min-h-[44px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="min-h-[44px]">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="min-h-[44px]">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
