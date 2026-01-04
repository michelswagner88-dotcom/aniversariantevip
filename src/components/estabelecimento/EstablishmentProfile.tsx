// =============================================================================
// ESTABLISHMENT PROFILE - Edição do perfil LIGHT
// Tema Light Premium estilo Stripe/Linear
// =============================================================================

import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Phone,
  MapPin,
  Clock,
  Save,
  X,
  Upload,
  Loader2,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HorarioFuncionamentoModal } from "./HorarioFuncionamentoModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCategoriasOptions, mapLegacyCategoriaToId } from "@/constants/categories";
import { InlineSaveTextarea } from "@/components/ui/InlineSaveTextarea";
import { useFieldUpdate } from "@/hooks/useFieldUpdate";
import { PanelSection } from "@/components/panel/PanelSection";

// =============================================================================
// TYPES
// =============================================================================

interface EstabelecimentoData {
  id: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  bio: string | null;
  logo_url: string | null;
  categoria: string[] | null;
  especialidades: string[] | null;
  cep: string | null;
  estado: string | null;
  cidade: string | null;
  bairro: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  horario_funcionamento: string | null;
}

interface EstablishmentProfileProps {
  estabelecimento: EstabelecimentoData | null;
  loading: boolean;
  onUpdate: (updates: Partial<EstabelecimentoData>) => Promise<boolean>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORIAS = getCategoriasOptions();

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

// =============================================================================
// HELPERS
// =============================================================================

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCEP = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatInstagram = (value: string): string => {
  return value.replace(/[@\s]/g, "").toLowerCase();
};

const formatSite = (value: string): string => {
  return value.trim().toLowerCase().replace(/\s/g, "");
};

// =============================================================================
// COMPONENT
// =============================================================================

export function EstablishmentProfile({ estabelecimento, loading, onUpdate }: EstablishmentProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showHorarioModal, setShowHorarioModal] = useState(false);
  const [form, setForm] = useState({
    nome_fantasia: "",
    telefone: "",
    whatsapp: "",
    instagram: "",
    site: "",
    categoria: "",
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    logradouro: "",
    numero: "",
    complemento: "",
    horario_funcionamento: "",
  });

  const { createFieldSaver } = useFieldUpdate({
    estabelecimentoId: estabelecimento?.id || "",
  });

  useEffect(() => {
    if (estabelecimento) {
      const rawCategoria = estabelecimento.categoria?.[0] || "";
      const mappedCategoria = mapLegacyCategoriaToId(rawCategoria);
      const validCategoria = CATEGORIAS.find((c) => c.value === mappedCategoria) ? mappedCategoria : "";

      setForm({
        nome_fantasia: estabelecimento.nome_fantasia || "",
        telefone: estabelecimento.telefone || "",
        whatsapp: estabelecimento.whatsapp || "",
        instagram: estabelecimento.instagram?.replace("@", "") || "",
        site: estabelecimento.site || "",
        categoria: validCategoria,
        cep: estabelecimento.cep || "",
        estado: estabelecimento.estado || "",
        cidade: estabelecimento.cidade || "",
        bairro: estabelecimento.bairro || "",
        logradouro: estabelecimento.logradouro || "",
        numero: estabelecimento.numero || "",
        complemento: estabelecimento.complemento || "",
        horario_funcionamento: estabelecimento.horario_funcionamento || "",
      });
    }
  }, [estabelecimento]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let logo_url = estabelecimento?.logo_url;

      if (logoFile && estabelecimento?.id) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${estabelecimento.id}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("estabelecimento-logos")
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("estabelecimento-logos").getPublicUrl(fileName);

        logo_url = publicUrl;
      }

      const updates = {
        nome_fantasia: form.nome_fantasia || null,
        telefone: form.telefone || null,
        whatsapp: form.whatsapp || null,
        instagram: form.instagram || null,
        site: form.site || null,
        categoria: form.categoria ? [form.categoria] : null,
        cep: form.cep || null,
        estado: form.estado || null,
        cidade: form.cidade || null,
        bairro: form.bairro || null,
        logradouro: form.logradouro || null,
        numero: form.numero || null,
        complemento: form.complemento || null,
        horario_funcionamento: form.horario_funcionamento || null,
        logo_url,
      };

      const success = await onUpdate(updates);

      if (success) {
        setIsEditing(false);
        setLogoFile(null);
        setLogoPreview(null);
        toast.success("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLogoFile(null);
    setLogoPreview(null);
    if (estabelecimento) {
      const rawCategoria = estabelecimento.categoria?.[0] || "";
      const mappedCategoria = mapLegacyCategoriaToId(rawCategoria);
      const validCategoria = CATEGORIAS.find((c) => c.value === mappedCategoria) ? mappedCategoria : "";

      setForm({
        nome_fantasia: estabelecimento.nome_fantasia || "",
        telefone: estabelecimento.telefone || "",
        whatsapp: estabelecimento.whatsapp || "",
        instagram: estabelecimento.instagram?.replace("@", "") || "",
        site: estabelecimento.site || "",
        categoria: validCategoria,
        cep: estabelecimento.cep || "",
        estado: estabelecimento.estado || "",
        cidade: estabelecimento.cidade || "",
        bairro: estabelecimento.bairro || "",
        logradouro: estabelecimento.logradouro || "",
        numero: estabelecimento.numero || "",
        complemento: estabelecimento.complemento || "",
        horario_funcionamento: estabelecimento.horario_funcionamento || "",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-[#E7E7EA]" />
        <div className="bg-white border border-[#E7E7EA] rounded-2xl p-6 space-y-4">
          <Skeleton className="h-20 w-20 rounded-xl bg-[#E7E7EA]" />
          <Skeleton className="h-10 w-full bg-[#E7E7EA]" />
          <Skeleton className="h-10 w-full bg-[#E7E7EA]" />
          <Skeleton className="h-24 w-full bg-[#E7E7EA]" />
        </div>
      </div>
    );
  }

  const selectedCategory = CATEGORIAS.find((c) => c.value === form.categoria);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Meu Perfil</h1>
          <p className="text-[#6B7280] mt-1">Gerencie as informações do seu estabelecimento</p>
        </div>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-[#240046] hover:bg-[#3C096C]">
            Editar Perfil
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving} className="border-[#E7E7EA] text-[#111827] hover:bg-[#F7F7F8]">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>
        )}
      </div>

      {/* Logo & Basic Info */}
      <PanelSection
        title="Informações Básicas"
        icon={<Building2 className="w-5 h-5 text-blue-500" />}
      >
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-[#F7F7F8] flex items-center justify-center overflow-hidden border-2 border-[#E7E7EA]">
                {logoPreview || estabelecimento?.logo_url ? (
                  <img
                    src={logoPreview || estabelecimento?.logo_url || ""}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-[#9CA3AF]" />
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 p-2 bg-[#240046] rounded-full cursor-pointer hover:bg-[#3C096C] transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm text-[#6B7280]">Logo do estabelecimento</p>
              <p className="text-xs text-[#9CA3AF]">Recomendado: 400x400px, formato JPG ou PNG</p>
              {estabelecimento?.cnpj && (
                <p className="text-xs text-[#9CA3AF] mt-2">CNPJ: {estabelecimento.cnpj}</p>
              )}
            </div>
          </div>

          <Separator className="bg-[#E7E7EA]" />

          {/* Nome */}
          <div className="space-y-2">
            <Label className="text-[#111827]">Nome Fantasia</Label>
            <Input
              value={form.nome_fantasia}
              onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
              disabled={!isEditing}
              className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
              placeholder="Nome do seu estabelecimento"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label className="text-[#111827]">Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(value) => setForm({ ...form, categoria: value })}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-white border-[#E7E7EA] text-[#111827]">
                <SelectValue placeholder="Selecione uma categoria">
                  {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.label}` : "Selecione uma categoria"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E7E7EA] z-50">
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label className="text-[#111827] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário de Funcionamento
            </Label>
            <div
              onClick={() => {
                if (!isEditing) setIsEditing(true);
                setShowHorarioModal(true);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 bg-white border border-[#E7E7EA] rounded-xl text-[#111827] cursor-pointer transition-colors",
                "hover:bg-[#F7F7F8]"
              )}
            >
              <Clock className="w-4 h-4 text-[#9CA3AF]" />
              <span className="flex-1 text-sm">{form.horario_funcionamento || "Clique para definir horário"}</span>
              <Edit3 className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <p className="text-xs text-[#9CA3AF]">Clique para editar os horários de funcionamento</p>
          </div>

          {showHorarioModal && (
            <HorarioFuncionamentoModal
              value={form.horario_funcionamento}
              onChange={(formatted) => setForm({ ...form, horario_funcionamento: formatted })}
              onClose={() => setShowHorarioModal(false)}
            />
          )}
        </div>
      </PanelSection>

      {/* Sobre o Estabelecimento */}
      <PanelSection
        title="Sobre o Estabelecimento"
        description="Descreva seu estabelecimento de forma atraente para os aniversariantes"
        icon={<User className="w-5 h-5 text-cyan-500" />}
      >
        <InlineSaveTextarea
          id="bio"
          label=""
          value={estabelecimento?.bio || ""}
          placeholder="Descreva seu estabelecimento: o que oferece, ambiente, diferenciais..."
          rows={4}
          maxLength={500}
          normalize
          helperText="Uma boa descrição aumenta suas chances de ser escolhido pelos aniversariantes."
          onSave={createFieldSaver("bio")}
        />
      </PanelSection>

      {/* Contatos */}
      <PanelSection
        title="Contatos"
        description="Informações de contato para os aniversariantes entrarem em contato"
        icon={<Phone className="w-5 h-5 text-emerald-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#111827]">Telefone</Label>
            <Input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: formatPhone(e.target.value) })}
              disabled={!isEditing}
              className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
              placeholder="(00) 0000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827]">WhatsApp</Label>
            <Input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: formatPhone(e.target.value) })}
              disabled={!isEditing}
              className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827]">Instagram</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">@</span>
              <Input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: formatInstagram(e.target.value) })}
                disabled={!isEditing}
                className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70 pl-7"
                placeholder="seuusuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827]">Site</Label>
            <Input
              value={form.site}
              onChange={(e) => setForm({ ...form, site: formatSite(e.target.value) })}
              disabled={!isEditing}
              className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
              placeholder="www.seusite.com.br"
            />
          </div>
        </div>
      </PanelSection>

      {/* Endereço */}
      <PanelSection
        title="Endereço"
        description="Localização do seu estabelecimento para os aniversariantes encontrarem"
        icon={<MapPin className="w-5 h-5 text-red-400" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#111827]">CEP</Label>
              <Input
                value={form.cep}
                onChange={(e) => setForm({ ...form, cep: formatCEP(e.target.value) })}
                disabled={!isEditing}
                className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
                placeholder="00000-000"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827]">Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(value) => setForm({ ...form, estado: value })}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-white border-[#E7E7EA] text-[#111827]">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E7E7EA] z-50">
                  {ESTADOS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827]">Cidade</Label>
              <Input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                disabled={!isEditing}
                className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
                placeholder="Cidade"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#111827]">Bairro</Label>
              <Input
                value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                disabled={!isEditing}
                className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
                placeholder="Bairro"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827]">Rua/Avenida</Label>
              <Input
                value={form.logradouro}
                onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
                disabled={!isEditing}
                className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
                placeholder="Rua/Avenida"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#111827]">Número</Label>
              <Input
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                disabled={!isEditing}
                className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
                placeholder="Nº"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827]">Complemento</Label>
              <Input
                value={form.complemento}
                onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                disabled={!isEditing}
                className="bg-white border-[#E7E7EA] text-[#111827] disabled:bg-[#F7F7F8] disabled:opacity-70"
                placeholder="Sala, Loja, etc."
              />
            </div>
          </div>
        </div>
      </PanelSection>
    </div>
  );
}

export default EstablishmentProfile;
