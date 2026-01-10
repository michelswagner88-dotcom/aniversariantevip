// =============================================================================
// ESTABLISHMENT PHOTOS - Galeria de fotos com processamento automático
// Aceita qualquer formato/tamanho e otimiza automaticamente
// =============================================================================

import { useState } from "react";
import { Image, Upload, Plus, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelSection } from "@/components/panel/PanelSection";
import { processImage, isValidImage, formatFileSize } from "@/lib/imageProcessor";
import { cn } from "@/lib/utils";

interface EstablishmentPhotosProps {
  estabelecimento: any;
  loading: boolean;
  onUpdate: (updates: any) => Promise<boolean>;
}

interface UploadProgress {
  fileName: string;
  status: "processing" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export function EstablishmentPhotos({ estabelecimento, loading, onUpdate }: EstablishmentPhotosProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  // Suportar ambos os campos (fotos e galeria_fotos)
  const fotos = Array.isArray(estabelecimento?.fotos)
    ? estabelecimento.fotos
    : Array.isArray(estabelecimento?.galeria_fotos)
      ? estabelecimento.galeria_fotos
      : [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Verificar limite
    if (fotos.length + files.length > 10) {
      toast.error(`Você pode adicionar mais ${10 - fotos.length} foto(s). Máximo de 10.`);
      return;
    }

    setUploading(true);
    setUploadProgress([]);

    const newFotos = [...fotos];
    const fileArray = Array.from(files);

    // Inicializar progresso
    setUploadProgress(
      fileArray.map((f) => ({
        fileName: f.name,
        status: "processing" as const,
        progress: 0,
      })),
    );

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      try {
        // Verificar se é imagem válida
        if (!isValidImage(file)) {
          setUploadProgress((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, status: "error", error: "Formato não suportado" } : p)),
          );
          toast.error(`${file.name}: Formato não suportado`);
          continue;
        }

        // Atualizar status: processando
        setUploadProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "processing", progress: 20 } : p)),
        );

        // Processar imagem (redimensionar e comprimir)
        console.log(`[Upload] Processando ${file.name} (${formatFileSize(file.size)})`);

        const processed = await processImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          format: "image/jpeg",
        });

        console.log(
          `[Upload] ${file.name}: ${formatFileSize(processed.originalSize)} → ${formatFileSize(processed.processedSize)} (${Math.round((1 - processed.processedSize / processed.originalSize) * 100)}% menor)`,
        );

        // Atualizar status: enviando
        setUploadProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: "uploading", progress: 50 } : p)),
        );

        // Gerar nome único para o arquivo
        const fileName = `${estabelecimento?.id || "temp"}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        // Fazer upload
        const { error: uploadError } = await supabase.storage
          .from("estabelecimento-fotos")
          .upload(fileName, processed.blob, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error("[Upload] Erro:", uploadError);

          // Tentar bucket alternativo
          const { error: altError } = await supabase.storage
            .from("establishment-photos")
            .upload(fileName, processed.blob, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (altError) {
            throw new Error(uploadError.message || "Erro no upload");
          }

          // Sucesso no bucket alternativo
          const {
            data: { publicUrl },
          } = supabase.storage.from("establishment-photos").getPublicUrl(fileName);

          newFotos.push(publicUrl);
        } else {
          // Sucesso no bucket principal
          const {
            data: { publicUrl },
          } = supabase.storage.from("estabelecimento-fotos").getPublicUrl(fileName);

          newFotos.push(publicUrl);
        }

        // Atualizar status: concluído
        setUploadProgress((prev) => prev.map((p, idx) => (idx === i ? { ...p, status: "done", progress: 100 } : p)));
      } catch (error: any) {
        console.error(`[Upload] Erro em ${file.name}:`, error);

        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: "error", error: error.message || "Erro desconhecido" } : p,
          ),
        );

        toast.error(`Erro ao enviar ${file.name}: ${error.message || "Tente novamente"}`);
      }
    }

    // Salvar no banco se tiver novas fotos
    if (newFotos.length > fotos.length) {
      try {
        // Tentar salvar em galeria_fotos primeiro, depois fotos
        let success = await onUpdate({ galeria_fotos: newFotos });

        if (!success) {
          success = await onUpdate({ fotos: newFotos });
        }

        if (success) {
          const qtdNovas = newFotos.length - fotos.length;
          toast.success(`${qtdNovas} foto(s) adicionada(s) com sucesso!`);
        }
      } catch (error) {
        console.error("[Upload] Erro ao salvar:", error);
        toast.error("Erro ao salvar fotos. Tente novamente.");
      }
    }

    // Limpar progresso após 2 segundos
    setTimeout(() => {
      setUploadProgress([]);
      setUploading(false);
    }, 2000);

    // Limpar input
    e.target.value = "";
  };

  const handleRemove = async (index: number) => {
    const newFotos = fotos.filter((_: any, i: number) => i !== index);

    try {
      // Tentar salvar em galeria_fotos primeiro, depois fotos
      let success = await onUpdate({ galeria_fotos: newFotos });

      if (!success) {
        success = await onUpdate({ fotos: newFotos });
      }

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
        {/* Dica sobre formatos */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Dica:</strong> Envie fotos em qualquer formato e tamanho. O sistema otimiza automaticamente para
            melhor qualidade e velocidade.
          </p>
        </div>

        {/* Progress de upload */}
        {uploadProgress.length > 0 && (
          <div className="mb-4 space-y-2">
            {uploadProgress.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  item.status === "done" && "bg-emerald-50 border-emerald-200",
                  item.status === "error" && "bg-red-50 border-red-200",
                  (item.status === "processing" || item.status === "uploading") && "bg-blue-50 border-blue-200",
                )}
              >
                {item.status === "processing" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                {item.status === "uploading" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                {item.status === "done" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                {item.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.status === "processing" && "Otimizando imagem..."}
                    {item.status === "uploading" && "Enviando..."}
                    {item.status === "done" && "Concluído!"}
                    {item.status === "error" && item.error}
                  </p>
                </div>

                {(item.status === "processing" || item.status === "uploading") && (
                  <div className="w-20 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Grid de fotos */}
        {fotos.length === 0 && uploadProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#E7E7EA] rounded-xl bg-[#FAFAFA]">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#E7E7EA] flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-[#9CA3AF]" />
            </div>
            <p className="text-[#374151] font-medium mb-1">Nenhuma foto adicionada</p>
            <p className="text-sm text-[#6B7280] mb-4 text-center max-w-sm">
              Fotos de qualidade aumentam suas chances de ser escolhido pelos aniversariantes
            </p>
            <label className="cursor-pointer">
              <Button className="bg-[#240046] hover:bg-[#3C096C]" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Adicionar Fotos
              </Button>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto: any, index: number) => (
              <div
                key={index}
                className="relative group aspect-square rounded-xl overflow-hidden bg-[#F7F7F8] border border-[#E7E7EA]"
              >
                <img
                  src={typeof foto === "string" ? foto : foto.url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-red-50 shadow-sm"
                  title="Remover foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  Foto {index + 1}
                </div>
              </div>
            ))}

            {/* Botão de adicionar mais */}
            {fotos.length < 10 && (
              <label className="cursor-pointer">
                <div
                  className={cn(
                    "aspect-square border-2 border-dashed border-[#E7E7EA] rounded-xl flex flex-col items-center justify-center transition-colors",
                    uploading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-[#240046] hover:bg-[#240046]/5 cursor-pointer",
                  )}
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-[#9CA3AF] animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-[#9CA3AF]" />
                      <span className="text-sm text-[#6B7280] mt-2">Adicionar</span>
                      <span className="text-xs text-[#9CA3AF]">{10 - fotos.length} restante(s)</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        )}

        {/* Info sobre otimização */}
        <div className="mt-4 text-xs text-[#9CA3AF] text-center">
          Formatos aceitos: JPG, PNG, WebP, GIF, BMP, HEIC • Tamanho máximo: ilimitado (otimizado automaticamente)
        </div>
      </PanelSection>
    </div>
  );
}

export default EstablishmentPhotos;
