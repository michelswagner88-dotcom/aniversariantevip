// =============================================================================
// ESTABLISHMENT PHOTOS - Galeria de fotos LIGHT
// Tema Light Premium estilo Stripe/Linear
// =============================================================================

import { useState } from "react";
import { Image, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelSection } from "@/components/panel/PanelSection";
import { PanelEmptyState } from "@/components/panel/PanelEmptyState";

interface EstablishmentPhotosProps {
  estabelecimento: any;
  loading: boolean;
  onUpdate: (updates: any) => Promise<boolean>;
}

export function EstablishmentPhotos({ estabelecimento, loading, onUpdate }: EstablishmentPhotosProps) {
  const [uploading, setUploading] = useState(false);
  const fotos = Array.isArray(estabelecimento?.fotos)
    ? estabelecimento.fotos
    : Array.isArray(estabelecimento?.galeria_fotos)
      ? estabelecimento.galeria_fotos
      : [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fotos.length + files.length > 10) {
      toast.error("Máximo de 10 fotos permitido");
      return;
    }

    setUploading(true);

    try {
      const newFotos = [...fotos];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${estabelecimento?.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("estabelecimento-fotos")
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("estabelecimento-fotos").getPublicUrl(fileName);

        newFotos.push(publicUrl);
      }

      const success = await onUpdate({ galeria_fotos: newFotos });

      if (success) {
        toast.success("Fotos adicionadas com sucesso!");
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Erro ao enviar fotos. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (index: number) => {
    const newFotos = fotos.filter((_: any, i: number) => i !== index);

    try {
      const success = await onUpdate({ galeria_fotos: newFotos });

      if (success) {
        toast.success("Foto removida com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao remover foto. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Fotos</h1>
        <p className="text-[#6B7280] mt-1">Gerencie as fotos do seu estabelecimento</p>
      </div>

      <PanelSection
        title="Galeria de Fotos"
        description={`Adicione até 10 fotos para atrair mais clientes (${fotos.length}/10)`}
        icon={<Image className="w-5 h-5 text-blue-500" />}
      >
        {fotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#E7E7EA] rounded-xl bg-[#FAFAFA]">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E7E7EA] flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-[#9CA3AF]" />
            </div>
            <p className="text-[#6B7280] mb-4">Nenhuma foto adicionada</p>
            <label className="cursor-pointer">
              <Button className="bg-[#240046] hover:bg-[#3C096C]" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Adicionar Fotos
              </Button>
              <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto: any, index: number) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-[#F7F7F8] border border-[#E7E7EA]">
                <img
                  src={typeof foto === "string" ? foto : foto.url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-red-50 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {fotos.length < 10 && (
              <label className="cursor-pointer">
                <div className="aspect-square border-2 border-dashed border-[#E7E7EA] rounded-xl flex flex-col items-center justify-center hover:border-[#240046] hover:bg-[#240046]/5 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[#9CA3AF] animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-[#9CA3AF]" />
                      <span className="text-sm text-[#6B7280] mt-2">Adicionar</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
        )}
      </PanelSection>
    </div>
  );
}

export default EstablishmentPhotos;
