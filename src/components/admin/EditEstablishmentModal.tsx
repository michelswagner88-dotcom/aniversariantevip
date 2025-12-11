import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, MapPin, Camera, RefreshCw, Sparkles, AlertTriangle, X } from "lucide-react";
import { processarImagemQuadrada, dataURLtoBlob } from "@/lib/imageUtils";
import { CATEGORIAS_ESTABELECIMENTO, PERIODOS_VALIDADE } from "@/lib/constants";
import { getSubcategoriesForCategory } from "@/constants/categorySubcategories";
import { HorarioFuncionamentoEditor } from "./HorarioFuncionamentoEditor";
import { Switch } from "@/components/ui/switch";
import { getPlaceholderPorCategoria, validarUrlFoto } from "@/lib/photoUtils";

interface Establishment {
  id: string;
  nome_fantasia: string | null;
  razao_social: string;
  cnpj: string;
  categoria: string[] | null;
  especialidades?: string[] | null;
  bio?: string | null;
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
  telefone: string | null;
  email: string | null;
  horario_funcionamento: string | null;
  regras_utilizacao: string | null;
}

interface EditEstablishmentModalProps {
  establishment: Establishment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEstablishmentModal({ establishment, open, onOpenChange, onSuccess }: EditEstablishmentModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [fetchingPhoto, setFetchingPhoto] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formData, setFormData] = useState<Establishment | null>(establishment);

  // Update formData when establishment changes
  useEffect(() => {
    if (establishment) {
      setFormData(establishment);
    }
  }, [establishment]);

  // Recalcular posição via Edge Function (não expõe API key)
  const handleRecalculatePosition = async () => {
    if (!formData?.endereco) {
      toast.error("Endereço completo é necessário para calcular posição");
      return;
    }

    try {
      setRecalculating(true);

      // Usar Edge Function ao invés de chamar API direto (segurança)
      const { data, error } = await supabase.functions.invoke("geocode-address", {
        body: { endereco: formData.endereco },
      });

      if (error) throw error;

      if (data?.lat && data?.lng) {
        setFormData({
          ...formData,
          latitude: data.lat,
          longitude: data.lng,
        });
        toast.success(`Posição atualizada: ${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`);
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

  // Buscar foto do Google Places
  const handleFetchGooglePhoto = async (forceAnyPhoto = false) => {
    if (!formData?.nome_fantasia && !formData?.razao_social) {
      toast.error("Nome do estabelecimento é necessário para buscar foto");
      return;
    }

    try {
      setFetchingPhoto(true);

      const toastId = toast.loading(
        forceAnyPhoto ? "Buscando qualquer foto disponível..." : "Buscando foto de qualidade no Google...",
      );

      const { data, error } = await supabase.functions.invoke("fetch-place-photo", {
        body: {
          nome: formData.nome_fantasia || formData.razao_social,
          endereco: formData.endereco,
          cidade: formData.cidade,
          estado: formData.estado,
          skipValidation: forceAnyPhoto,
        },
      });

      toast.dismiss(toastId);

      if (error) throw error;

      if (data?.success && data.photo_url) {
        setFormData({
          ...formData,
          logo_url: data.photo_url,
        });

        const dimensions = data.photo_dimensions
          ? ` (${data.photo_dimensions.width}x${data.photo_dimensions.height})`
          : "";

        toast.success(`Foto encontrada! ${data.place_name || ""}${dimensions}`);

        if (data.validation_applied && data.photos_available > 1) {
          toast.info(`Selecionada melhor foto de ${data.photos_available} disponíveis`);
        }
      } else if (data?.validation_applied && data?.photos_available > 0) {
        toast.error("Fotos rejeitadas pela validação de qualidade", {
          description: `${data.photos_available} fotos disponíveis, mas nenhuma passou nos critérios.`,
          action: {
            label: "Tentar qualquer foto",
            onClick: () => handleFetchGooglePhoto(true),
          },
        });
      } else {
        toast.error(data?.error || "Estabelecimento não encontrado no Google Places");
      }
    } catch (error) {
      console.error("Erro ao buscar foto:", error);
      toast.error("Erro ao buscar foto no Google");
    } finally {
      setFetchingPhoto(false);
    }
  };

  // Verificar se a foto atual é válida
  const isFotoValida = formData?.logo_url && validarUrlFoto(formData.logo_url);
  const placeholderUrl = getPlaceholderPorCategoria(formData?.categoria);

  // Upload de arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, envie apenas imagens");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB.");
      return;
    }

    try {
      setIsProcessingImage(true);
      toast.info("Processando imagem...");

      const imagemProcessada = await processarImagemQuadrada(file, 400);
      const fileName = `estabelecimento_${Date.now()}.jpg`;
      const blob = dataURLtoBlob(imagemProcessada);

      const { error } = await supabase.storage
        .from("estabelecimento-logos")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("estabelecimento-logos").getPublicUrl(fileName);

      if (formData) {
        setFormData({
          ...formData,
          logo_url: urlData.publicUrl,
        });
      }

      toast.success("Foto adicionada com sucesso!");
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      toast.error("Erro ao processar imagem. Tente novamente.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Máscara de CNPJ
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 14);
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  // Salvar alterações
  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("estabelecimentos")
        .update({
          nome_fantasia: formData.nome_fantasia,
          razao_social: formData.razao_social,
          cnpj: formData.cnpj,
          categoria: formData.categoria,
          especialidades: formData.especialidades || [],
          bio: formData.bio,
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
          regras_utilizacao: formData.regras_utilizacao,
          plan_status: formData.plan_status,
          ativo: formData.ativo,
          telefone: formData.telefone,
          email: formData.email,
          horario_funcionamento: formData.horario_funcionamento,
        })
        .eq("id", formData.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["estabelecimentos"] });
      await queryClient.invalidateQueries({ queryKey: ["public_estabelecimentos"] });

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

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (!formData) return null;

  const isAnyLoading = saving || recalculating || fetchingPhoto || isProcessingImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Estabelecimento</DialogTitle>
          <DialogDescription>Edite todos os dados do estabelecimento</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basico" className="min-h-[44px]">
              Básico
            </TabsTrigger>
            <TabsTrigger value="localizacao" className="min-h-[44px]">
              Endereço
            </TabsTrigger>
            <TabsTrigger value="contato" className="min-h-[44px]">
              Contato
            </TabsTrigger>
            <TabsTrigger value="beneficio" className="min-h-[44px]">
              Benefício
            </TabsTrigger>
            <TabsTrigger value="config" className="min-h-[44px]">
              Config
            </TabsTrigger>
          </TabsList>

          {/* DADOS BÁSICOS */}
          <TabsContent value="basico" className="space-y-4">
            <div>
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia || ""}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                placeholder="Nome do estabelecimento"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="razao_social">Razão Social</Label>
              <Input
                id="razao_social"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                placeholder="Razão social oficial"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria?.[0] || ""}
                onValueChange={(value) => {
                  setFormData({ ...formData, categoria: [value], especialidades: [] });
                }}
              >
                <SelectTrigger id="categoria" className="min-h-[44px]">
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

            {/* Subcategorias */}
            {formData.categoria?.[0] && getSubcategoriesForCategory(formData.categoria[0]).length > 0 && (
              <div className="space-y-2">
                <Label>Subcategorias (máximo 3)</Label>
                <p className="text-xs text-muted-foreground">
                  Selecione até 3 subcategorias que melhor descrevem o estabelecimento
                </p>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-muted/30 rounded-lg border">
                  {getSubcategoriesForCategory(formData.categoria[0]).map((subcategory) => {
                    const currentSubs = formData.especialidades || [];
                    const isSelected = currentSubs.includes(subcategory.label);
                    const isDisabled = currentSubs.length >= 3 && !isSelected;

                    return (
                      <Badge
                        key={subcategory.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`
                            cursor-pointer transition-all min-h-[32px] px-3
                            ${
                              isSelected
                                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent hover:from-violet-700 hover:to-fuchsia-700"
                                : "hover:bg-violet-600/20 border-muted-foreground/30 hover:border-violet-500"
                            }
                            ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                          `}
                        onClick={() => {
                          if (isDisabled) return;
                          const newSubs = isSelected
                            ? currentSubs.filter((s) => s !== subcategory.label)
                            : [...currentSubs, subcategory.label];
                          setFormData({ ...formData, especialidades: newSubs });
                        }}
                      >
                        <span className="mr-1" aria-hidden="true">
                          {subcategory.icon}
                        </span>
                        {subcategory.label}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(formData.especialidades || []).length}/3 selecionadas
                  {(formData.especialidades || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, especialidades: [] })}
                      className="ml-2 text-violet-500 hover:text-violet-400"
                    >
                      (limpar)
                    </button>
                  )}
                </p>
              </div>
            )}

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio / Descrição do Estabelecimento</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 500) })}
                placeholder="Descreva o estabelecimento em até 500 caracteres."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{(formData.bio || "").length}/500 caracteres</p>
            </div>

            {/* Foto */}
            <div className="space-y-3 pt-4 border-t">
              <Label>Foto do Estabelecimento</Label>

              {formData.logo_url && !isFotoValida && (
                <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-400">Foto possivelmente inadequada</p>
                    <p className="text-xs text-amber-400/70">A URL sugere que pode ser um logo, ícone ou placeholder</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleFetchGooglePhoto(false)}
                    disabled={fetchingPhoto}
                    className="shrink-0 min-h-[36px]"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${fetchingPhoto ? "animate-spin" : ""}`} aria-hidden="true" />
                    Buscar nova
                  </Button>
                </div>
              )}

              <div className="flex items-start gap-6">
                {/* Preview da foto */}
                <div className="relative">
                  <button
                    type="button"
                    className={`w-40 aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed 
                      ${isProcessingImage ? "border-violet-500" : "border-white/20"} 
                      bg-slate-800 flex items-center justify-center cursor-pointer 
                      hover:border-violet-500 transition-colors`}
                    onClick={triggerFileUpload}
                    disabled={isProcessingImage}
                    aria-label="Clique para adicionar foto"
                  >
                    {isProcessingImage ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-violet-500 mx-auto mb-2 animate-spin" aria-hidden="true" />
                        <span className="text-xs text-gray-400">Processando...</span>
                      </div>
                    ) : formData.logo_url ? (
                      <img
                        src={formData.logo_url}
                        alt="Foto do estabelecimento"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = placeholderUrl;
                        }}
                      />
                    ) : (
                      <div className="text-center p-2">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" aria-hidden="true" />
                        <span className="text-xs text-gray-400">Toque para adicionar</span>
                      </div>
                    )}
                  </button>

                  {formData.logo_url && !isProcessingImage && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                      onClick={() => setFormData({ ...formData, logo_url: "" })}
                      aria-label="Remover foto"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>

                {/* Opções */}
                <div className="flex-1 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessingImage}
                    aria-label="Upload de foto"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileUpload}
                    disabled={isProcessingImage}
                    className="w-full min-h-[44px]"
                  >
                    <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
                    Enviar Foto Manual
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleFetchGooglePhoto(false)}
                    disabled={isAnyLoading}
                    className="w-full min-h-[44px] bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                  >
                    {fetchingPhoto ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                    )}
                    Buscar Melhor Foto (Google)
                  </Button>

                  <p className="text-xs text-gray-400">A busca inteligente filtra logos e ícones automaticamente</p>
                </div>
              </div>

              <div>
                <Label htmlFor="logo_url">Ou insira URL da Imagem</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url || ""}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://exemplo.com/foto.jpg"
                  disabled={isProcessingImage}
                  className="min-h-[44px]"
                />
              </div>
            </div>
          </TabsContent>

          {/* LOCALIZAÇÃO */}
          <TabsContent value="localizacao" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep || ""}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                  maxLength={9}
                  className="min-h-[44px]"
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero || ""}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="123"
                  className="min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento || ""}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                placeholder="Sala 45, Shopping Center..."
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Input
                id="endereco"
                value={formData.endereco || ""}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua ABC, 123 - Bairro, Cidade - UF"
                className="min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade || ""}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Florianópolis"
                  className="min-h-[44px]"
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado (UF)</Label>
                <Input
                  id="estado"
                  value={formData.estado || ""}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                  placeholder="SC"
                  maxLength={2}
                  className="min-h-[44px]"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Coordenadas GPS</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="latitude" className="text-xs">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || null })}
                    placeholder="-27.5954"
                    className="min-h-[44px]"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-xs">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || null })}
                    placeholder="-48.5480"
                    className="min-h-[44px]"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-3 min-h-[44px]"
                onClick={handleRecalculatePosition}
                disabled={recalculating || !formData.endereco}
              >
                {recalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                    Recalcular Posição
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* CONTATO */}
          <TabsContent value="contato" className="space-y-4">
            <div>
              <Label htmlFor="telefone">Telefone Fixo</Label>
              <Input
                id="telefone"
                value={formData.telefone || ""}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(48) 3333-3333"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp || ""}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(48) 99999-9999"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@estabelecimento.com.br"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram || ""}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@estabelecimento"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label htmlFor="site">Website</Label>
              <Input
                id="site"
                value={formData.site || ""}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                placeholder="https://www.exemplo.com.br"
                className="min-h-[44px]"
              />
            </div>

            <div>
              <Label>Horário de Funcionamento</Label>
              <HorarioFuncionamentoEditor
                value={formData.horario_funcionamento}
                onChange={(json) => setFormData({ ...formData, horario_funcionamento: json })}
              />
            </div>
          </TabsContent>

          {/* BENEFÍCIO */}
          <TabsContent value="beneficio" className="space-y-4">
            <div>
              <Label htmlFor="descricao_beneficio">Descrição do Benefício</Label>
              <Textarea
                id="descricao_beneficio"
                value={formData.descricao_beneficio || ""}
                onChange={(e) => setFormData({ ...formData, descricao_beneficio: e.target.value })}
                placeholder="Ex: 10% de desconto no rodízio completo"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.descricao_beneficio?.length || 0}/200 caracteres
              </p>
            </div>

            <div>
              <Label htmlFor="regras_utilizacao">Regras de Utilização</Label>
              <Textarea
                id="regras_utilizacao"
                value={formData.regras_utilizacao || ""}
                onChange={(e) => setFormData({ ...formData, regras_utilizacao: e.target.value })}
                placeholder="Ex: Válido apenas para consumo no local. Não cumulativo."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="periodo_validade">Período de Validade</Label>
              <Select
                value={formData.periodo_validade_beneficio || "dia_aniversario"}
                onValueChange={(value) => setFormData({ ...formData, periodo_validade_beneficio: value })}
              >
                <SelectTrigger id="periodo_validade" className="min-h-[44px]">
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
          </TabsContent>

          {/* CONFIGURAÇÕES */}
          <TabsContent value="config" className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg min-h-[72px]">
              <div>
                <Label className="text-base">Status: Ativo/Inativo</Label>
                <p className="text-sm text-slate-400">Estabelecimento visível no app</p>
              </div>
              <Switch
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                aria-label="Ativar ou desativar estabelecimento"
              />
            </div>

            <div>
              <Label htmlFor="plan_status">Plano (Tier)</Label>
              <Select
                value={formData.plan_status || "pending"}
                onValueChange={(value) => setFormData({ ...formData, plan_status: value })}
              >
                <SelectTrigger id="plan_status" className="min-h-[44px]">
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
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 min-h-[44px]"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isAnyLoading} className="flex-1 min-h-[44px]">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
