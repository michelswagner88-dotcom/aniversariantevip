// =============================================================================
// ESTABLISHMENT PROFILE - Edição do perfil do estabelecimento
// =============================================================================

import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Phone,
  Mail,
  Instagram,
  Globe,
  MapPin,
  Clock,
  Save,
  X,
  Upload,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const CATEGORIAS = [
  { value: "restaurante", label: "🍽️ Restaurante" },
  { value: "bar", label: "🍺 Bar" },
  { value: "cafeteria", label: "☕ Cafeteria" },
  { value: "balada", label: "🎉 Balada" },
  { value: "salao", label: "💇 Salão de Beleza" },
  { value: "barbearia", label: "✂️ Barbearia" },
  { value: "academia", label: "🏋️ Academia" },
  { value: "spa", label: "🧖 Spa" },
  { value: "loja", label: "🛍️ Loja" },
  { value: "hotel", label: "🏨 Hotel" },
  { value: "clinica", label: "🏥 Clínica" },
  { value: "servico", label: "🔧 Serviço" },
];

const ESTADOS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// =============================================================================
// COMPONENT
// =============================================================================

export function EstablishmentProfile({ estabelecimento, loading, onUpdate }: EstablishmentProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome_fantasia: "",
    telefone: "",
    whatsapp: "",
    instagram: "",
    site: "",
    bio: "",
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

  // Sync form with estabelecimento data
  useEffect(() => {
    if (estabelecimento) {
      setForm({
        nome_fantasia: estabelecimento.nome_fantasia || "",
        telefone: estabelecimento.telefone || "",
        whatsapp: estabelecimento.whatsapp || "",
        instagram: estabelecimento.instagram?.replace("@", "") || "",
        site: estabelecimento.site || "",
        bio: estabelecimento.bio || "",
        categoria: estabelecimento.categoria?.[0] || "",
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

  // Handle logo change
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

  // Handle save
  const handleSave = async () => {
    setSaving(true);

    try {
      let logo_url = estabelecimento?.logo_url;

      // Upload logo if changed
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
        bio: form.bio || null,
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
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false);
    setLogoFile(null);
    setLogoPreview(null);
    // Reset form to original values
    if (estabelecimento) {
      setForm({
        nome_fantasia: estabelecimento.nome_fantasia || "",
        telefone: estabelecimento.telefone || "",
        whatsapp: estabelecimento.whatsapp || "",
        instagram: estabelecimento.instagram?.replace("@", "") || "",
        site: estabelecimento.site || "",
        bio: estabelecimento.bio || "",
        categoria: estabelecimento.categoria?.[0] || "",
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-20 w-20 rounded-xl" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
          <p className="text-slate-400 mt-1">Gerencie as informações do seu estabelecimento</p>
        </div>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-violet-600 hover:bg-violet-500">
            Editar Perfil
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving} className="border-slate-700">
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
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700">
                {logoPreview || estabelecimento?.logo_url ? (
                  <img
                    src={logoPreview || estabelecimento?.logo_url || ""}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-500" />
                )}
              </div>
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 p-2 bg-violet-600 rounded-full cursor-pointer hover:bg-violet-500 transition-colors">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm text-slate-400">Logo do estabelecimento</p>
              <p className="text-xs text-slate-500">Recomendado: 400x400px, formato JPG ou PNG</p>
              {estabelecimento?.cnpj && <p className="text-xs text-slate-600 mt-2">CNPJ: {estabelecimento.cnpj}</p>}
            </div>
          </div>

          <Separator className="bg-slate-800" />

          {/* Nome */}
          <div className="space-y-2">
            <Label className="text-slate-300">Nome Fantasia</Label>
            <Input
              value={form.nome_fantasia}
              onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
              disabled={!isEditing}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
              placeholder="Nome do seu estabelecimento"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label className="text-slate-300">Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(value) => setForm({ ...form, categoria: value })}
              disabled={!isEditing}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Sobre o estabelecimento</Label>
              <span className="text-xs text-slate-500">{form.bio.length}/500</span>
            </div>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 500) })}
              disabled={!isEditing}
              rows={4}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-70 resize-none"
              placeholder="Descreva seu estabelecimento de forma atraente..."
            />
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label className="text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário de Funcionamento
            </Label>
            <Textarea
              value={form.horario_funcionamento}
              onChange={(e) => setForm({ ...form, horario_funcionamento: e.target.value })}
              disabled={!isEditing}
              rows={2}
              className="bg-slate-800 border-slate-700 text-white disabled:opacity-70 resize-none"
              placeholder="Ex: Seg a Sex: 10h às 22h | Sáb e Dom: 12h às 00h"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contatos */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            Contatos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telefone */}
            <div className="space-y-2">
              <Label className="text-slate-300">Telefone</Label>
              <Input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="(00) 0000-0000"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label className="text-slate-300">WhatsApp</Label>
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="(00) 00000-0000"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label className="text-slate-300">Instagram</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                <Input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value.replace("@", "") })}
                  disabled={!isEditing}
                  className="bg-slate-800 border-slate-700 text-white disabled:opacity-70 pl-7"
                  placeholder="seuusuario"
                />
              </div>
            </div>

            {/* Site */}
            <div className="space-y-2">
              <Label className="text-slate-300">Site</Label>
              <Input
                value={form.site}
                onChange={(e) => setForm({ ...form, site: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="www.seusite.com.br"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CEP */}
            <div className="space-y-2">
              <Label className="text-slate-300">CEP</Label>
              <Input
                value={form.cep}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="00000-000"
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label className="text-slate-300">Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(value) => setForm({ ...form, estado: value })}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {ESTADOS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <Label className="text-slate-300">Cidade</Label>
              <Input
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="Cidade"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bairro */}
            <div className="space-y-2">
              <Label className="text-slate-300">Bairro</Label>
              <Input
                value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="Bairro"
              />
            </div>

            {/* Logradouro */}
            <div className="space-y-2">
              <Label className="text-slate-300">Rua/Avenida</Label>
              <Input
                value={form.logradouro}
                onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="Rua/Avenida"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número */}
            <div className="space-y-2">
              <Label className="text-slate-300">Número</Label>
              <Input
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="Nº"
              />
            </div>

            {/* Complemento */}
            <div className="space-y-2">
              <Label className="text-slate-300">Complemento</Label>
              <Input
                value={form.complemento}
                onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                disabled={!isEditing}
                className="bg-slate-800 border-slate-700 text-white disabled:opacity-70"
                placeholder="Sala, Loja, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EstablishmentProfile;
