import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { CATEGORIAS_ESTABELECIMENTO, PERIODOS_VALIDADE } from "@/lib/constants";

interface Establishment {
  id: string;
  nome_fantasia: string | null;
  razao_social: string;
  cnpj: string;
  categoria: string[] | null;
  cep: string | null;
  numero: string | null;
  complemento: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  logo_url: string | null;
  descricao_beneficio: string | null;
  periodo_validade_beneficio: string | null;
  plan_status: string | null;
  ativo: boolean;
}

interface EditEstablishmentModalProps {
  establishment: Establishment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEstablishmentModal({ establishment, open, onOpenChange, onSuccess }: EditEstablishmentModalProps) {
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [formData, setFormData] = useState<Establishment | null>(establishment);

  // Update formData when establishment changes
  useState(() => {
    setFormData(establishment);
  });

  const handleRecalculatePosition = async () => {
    if (!formData?.endereco) {
      toast.error("Endereço completo é necessário para calcular posição");
      return;
    }

    try {
      setRecalculating(true);
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.endereco)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setFormData({
          ...formData,
          latitude: lat,
          longitude: lng,
        });
        toast.success(`Posição atualizada: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } else {
        toast.error("Não foi possível calcular a posição. Verifique o endereço.");
      }
    } catch (error) {
      console.error("Erro ao calcular posição:", error);
      toast.error("Erro ao calcular posição");
    } finally {
      setRecalculating(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('estabelecimentos')
        .update({
          nome_fantasia: formData.nome_fantasia,
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          categoria: formData.categoria,
          cep: formData.cep,
          numero: formData.numero,
          complemento: formData.complemento,
          endereco: formData.endereco,
          cidade: formData.cidade,
          estado: formData.estado,
          latitude: formData.latitude,
          longitude: formData.longitude,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
          site: formData.site,
          logo_url: formData.logo_url,
          descricao_beneficio: formData.descricao_beneficio,
          periodo_validade_beneficio: formData.periodo_validade_beneficio,
          plan_status: formData.plan_status,
          ativo: formData.ativo,
        })
        .eq('id', formData.id);

      if (error) throw error;

      toast.success("Estabelecimento atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Estabelecimento Completo</DialogTitle>
          <DialogDescription>
            Controle total para corrigir e enriquecer dados
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basico">Dados Básicos</TabsTrigger>
            <TabsTrigger value="localizacao">Localização</TabsTrigger>
            <TabsTrigger value="contato">Contato & Mídia</TabsTrigger>
            <TabsTrigger value="negocio">Negócio</TabsTrigger>
          </TabsList>

          {/* DADOS BÁSICOS */}
          <TabsContent value="basico" className="space-y-4">
            <div>
              <Label>Nome Fantasia</Label>
              <Input
                value={formData.nome_fantasia || ''}
                onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
                placeholder="Nome do estabelecimento"
              />
            </div>

            <div>
              <Label>Razão Social</Label>
              <Input
                value={formData.razao_social}
                onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                placeholder="Razão social oficial"
              />
            </div>

            <div>
              <Label>CNPJ</Label>
              <Input
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>

            <div>
              <Label>Categoria *</Label>
              <Select
                value={formData.categoria?.[0] || ''}
                onValueChange={(value) => setFormData({...formData, categoria: [value]})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_ESTABELECIMENTO.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!formData.categoria || formData.categoria.length === 0) && (
                <p className="text-xs text-destructive mt-1">⚠️ Categoria vazia - corrija!</p>
              )}
            </div>
          </TabsContent>

          {/* LOCALIZAÇÃO */}
          <TabsContent value="localizacao" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CEP</Label>
                <Input
                  value={formData.cep || ''}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  placeholder="00000-000"
                  maxLength={9}
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
                placeholder="Sala 45, Shopping Center..."
              />
            </div>

            <div>
              <Label>Endereço Completo</Label>
              <Input
                value={formData.endereco || ''}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                placeholder="Rua ABC, 123 - Bairro, Cidade - UF"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cidade</Label>
                <Input
                  value={formData.cidade || ''}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  placeholder="Florianópolis"
                />
              </div>
              <div>
                <Label>Estado (UF)</Label>
                <Input
                  value={formData.estado || ''}
                  onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                  placeholder="SC"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Coordenadas GPS</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || null})}
                    placeholder="-27.5954"
                  />
                </div>
                <div>
                  <Label className="text-xs">Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || null})}
                    placeholder="-48.5480"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-3"
                onClick={handleRecalculatePosition}
                disabled={recalculating || !formData.endereco}
              >
                {recalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    📍 Recalcular Posição no Google
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* CONTATO & MÍDIA */}
          <TabsContent value="contato" className="space-y-4">
            <div>
              <Label>WhatsApp</Label>
              <Input
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                placeholder="(48) 99999-9999"
              />
            </div>

            <div>
              <Label>Instagram</Label>
              <Input
                value={formData.instagram || ''}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                placeholder="@estabelecimento"
              />
            </div>

            <div>
              <Label>Website</Label>
              <Input
                value={formData.site || ''}
                onChange={(e) => setFormData({...formData, site: e.target.value})}
                placeholder="https://www.exemplo.com.br"
              />
            </div>

            <div>
              <Label>URL da Foto (Cover Image)</Label>
              <Input
                value={formData.logo_url || ''}
                onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                placeholder="https://storage.url/imagem.jpg"
              />
              {formData.logo_url && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={formData.logo_url}
                    alt="Preview"
                    className="h-32 w-auto rounded-lg object-cover border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Imagem+Inválida';
                    }}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          {/* REGRAS DE NEGÓCIO */}
          <TabsContent value="negocio" className="space-y-4">
            <div>
              <Label>Descrição do Benefício</Label>
              <Textarea
                value={formData.descricao_beneficio || ''}
                onChange={(e) => setFormData({...formData, descricao_beneficio: e.target.value})}
                placeholder="Ex: 10% de desconto no rodízio completo"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.descricao_beneficio?.length || 0}/200 caracteres
              </p>
            </div>

            <div>
              <Label>Período de Validade</Label>
              <Select
                value={formData.periodo_validade_beneficio || 'dia_aniversario'}
                onValueChange={(value) => setFormData({...formData, periodo_validade_beneficio: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODOS_VALIDADE.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Plano (Tier)</Label>
              <Select
                value={formData.plan_status || 'pending'}
                onValueChange={(value) => setFormData({...formData, plan_status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">🔵 Pending (Aguardando)</SelectItem>
                  <SelectItem value="active">✅ Active (Gold/Pago)</SelectItem>
                  <SelectItem value="trialing">🎁 Trialing (Teste)</SelectItem>
                  <SelectItem value="canceled">❌ Canceled (Cancelado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status de Ativação</Label>
              <Select
                value={formData.ativo ? 'active' : 'inactive'}
                onValueChange={(value) => setFormData({...formData, ativo: value === 'active'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">🟢 Ativo (Visível no app)</SelectItem>
                  <SelectItem value="inactive">🔴 Inativo (Oculto)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Todas Alterações'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
