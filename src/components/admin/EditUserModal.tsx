import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

    try {
      setSaving(true);

      // Atualizar profile (nome e email)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          nome: formData.nome,
          email: formData.email 
        })
        .eq('id', formData.id);

      if (profileError) throw profileError;

      // Atualizar aniversariante (todos os outros dados)
      const { error: anivError } = await supabase
        .from('aniversariantes')
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
        .eq('id', formData.id);

      if (anivError) throw anivError;

      toast.success("Usuário atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      
      // Tratamento específico de erros de duplicata
      if (error.code === '23505') {
        if (error.message.includes('cpf')) {
          toast.error('Este CPF já está cadastrado em outra conta.');
        } else if (error.message.includes('telefone')) {
          toast.error('Este telefone já está cadastrado em outra conta.');
        } else if (error.message.includes('email')) {
          toast.error('Este email já está cadastrado em outra conta.');
        } else {
          toast.error('Dados duplicados detectados. Verifique CPF, telefone e email.');
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
          <DialogDescription>
            Edite todas as informações do aniversariante
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pessoal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
          </TabsList>

          {/* DADOS PESSOAIS */}
          <TabsContent value="pessoal" className="space-y-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input
                value={formData.nome || ''}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ Alterar email pode impedir o usuário de fazer login
              </p>
            </div>

            <div>
              <Label>CPF *</Label>
              <MaskedInput
                value={formData.cpf}
                onChange={(value) => setFormData({...formData, cpf: value})}
                mask={cpfMask}
                placeholder="000.000.000-00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ Alterar CPF pode causar problemas na emissão de cupons
              </p>
            </div>

            <div>
              <Label>Data de Nascimento *</Label>
              <Input
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
              />
            </div>
          </TabsContent>

          {/* CONTATO */}
          <TabsContent value="contato" className="space-y-4">
            <div>
              <Label>Telefone/Celular *</Label>
              <MaskedInput
                value={formData.telefone || ''}
                onChange={(value) => setFormData({...formData, telefone: value})}
                mask={phoneMask}
                placeholder="(00) 00000-0000"
              />
            </div>
          </TabsContent>

          {/* ENDEREÇO */}
          <TabsContent value="endereco" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CEP *</Label>
                <MaskedInput
                  value={formData.cep}
                  onChange={(value) => setFormData({...formData, cep: value})}
                  mask={cepMask}
                  placeholder="00000-000"
                />
              </div>
              <div>
                <Label>Número</Label>
                <Input
                  value={formData.numero || ''}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  placeholder="123"
                />
              </div>
            </div>

            <div>
              <Label>Complemento</Label>
              <Input
                value={formData.complemento || ''}
                onChange={(e) => setFormData({...formData, complemento: e.target.value})}
                placeholder="Apto 45, Bloco B..."
              />
            </div>

            <div>
              <Label>Rua/Logradouro *</Label>
              <Input
                value={formData.logradouro}
                onChange={(e) => setFormData({...formData, logradouro: e.target.value})}
                placeholder="Rua exemplo"
              />
            </div>

            <div>
              <Label>Bairro *</Label>
              <Input
                value={formData.bairro}
                onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                placeholder="Centro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cidade *</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  placeholder="Florianópolis"
                />
              </div>
              <div>
                <Label>Estado (UF) *</Label>
                <Input
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                  placeholder="SC"
                  maxLength={2}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
