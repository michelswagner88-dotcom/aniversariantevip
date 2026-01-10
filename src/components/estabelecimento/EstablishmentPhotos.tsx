// =============================================================================
// ESTABLISHMENT PHOTOS - Galeria de fotos LIGHT
// Tema Light Premium estilo Stripe/Linear
// =============================================================================

import { useState } from "react";
import { Image, Upload, Plus, Trash2, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PanelSection } from "@/components/panel/PanelSection";
import { resizeImage } from "@/lib/imageUtils";
import { Progress } from "@/components/ui/progress";

// Tipos de imagem aceitos
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
const BUCKETS = ['estabelecimento-fotos', 'establishment-photos'] as const;

interface EstablishmentPhotosProps {
  estabelecimento: any;
  loading: boolean;
  onUpdate: (updates: any) => Promise<boolean>;
}

interface UploadStatus {
  fileName: string;
  status: 'pending' | 'processing' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function EstablishmentPhotos({ estabelecimento, loading, onUpdate }: EstablishmentPhotosProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  
  const fotos = Array.isArray(estabelecimento?.fotos)
    ? estabelecimento.fotos
    : Array.isArray(estabelecimento?.galeria_fotos)
      ? estabelecimento.galeria_fotos
      : [];

  // Tentar upload em múltiplos buckets (fallback)
  const uploadToBucket = async (fileName: string, file: File): Promise<{ bucket: string; error?: any }> => {
    for (const bucket of BUCKETS) {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });
      
      if (!error) {
        return { bucket };
      }
      
      console.log(`Bucket ${bucket} falhou, tentando próximo...`, error.message);
    }
    
    return { bucket: BUCKETS[0], error: new Error('Todos os buckets falharam') };
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fotos.length + files.length > 10) {
      toast.error("Máximo de 10 fotos permitido");
      return;
    }

    setUploading(true);
    
    // Inicializar status de cada arquivo
    const initialStatuses: UploadStatus[] = Array.from(files).map(f => ({
      fileName: f.name,
      status: 'pending',
      progress: 0
    }));
    setUploadStatuses(initialStatuses);

    try {
      const newFotos = [...fotos];
      const fileArray = Array.from(files);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Validar tipo
        if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
          setUploadStatuses(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'error', error: 'Formato não suportado' } : s
          ));
          continue;
        }

        // Status: Processando
        setUploadStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'processing', progress: 20 } : s
        ));

        // Comprimir imagem (max 1920px, 85% qualidade)
        let processedFile: File;
        try {
          processedFile = await resizeImage(file, 1920, 1920, 0.85);
        } catch (resizeError) {
          console.warn('Erro ao redimensionar, usando original:', resizeError);
          processedFile = file;
        }

        // Status: Uploading
        setUploadStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'uploading', progress: 50 } : s
        ));

        // Nome do arquivo (sempre .jpg após compressão)
        const fileName = `${estabelecimento?.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        // Upload com fallback de buckets
        const { bucket, error: uploadError } = await uploadToBucket(fileName, processedFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setUploadStatuses(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'error', error: 'Falha no upload' } : s
          ));
          continue;
        }

        // Status: Sucesso
        setUploadStatuses(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'success', progress: 100 } : s
        ));

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
        newFotos.push(publicUrl);
      }

      // Atualizar no banco
      const successCount = uploadStatuses.filter(s => s.status === 'success').length;
      if (newFotos.length > fotos.length) {
        const success = await onUpdate({ galeria_fotos: newFotos });
        if (success) {
          toast.success(`${newFotos.length - fotos.length} foto(s) adicionada(s) com sucesso!`);
        }
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Erro ao enviar fotos. Tente novamente.");
    } finally {
      // Limpar status após 3s
      setTimeout(() => setUploadStatuses([]), 3000);
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
        <h1 className="text-2xl font-bold text-foreground">Fotos</h1>
        <p className="text-muted-foreground mt-1">Gerencie as fotos do seu estabelecimento</p>
      </div>

      {/* Upload Progress */}
      {uploadStatuses.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-4 space-y-3 border">
          <p className="text-sm font-medium text-foreground">Enviando fotos...</p>
          {uploadStatuses.map((status, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {status.fileName}
                  </span>
                  <span className="text-xs">
                    {status.status === 'pending' && <span className="text-muted-foreground">Aguardando</span>}
                    {status.status === 'processing' && <span className="text-amber-600">Comprimindo...</span>}
                    {status.status === 'uploading' && <span className="text-blue-600">Enviando...</span>}
                    {status.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {status.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </span>
                </div>
                <Progress value={status.progress} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      <PanelSection
        title="Galeria de Fotos"
        description={`Adicione até 10 fotos para atrair mais clientes (${fotos.length}/10)`}
        icon={<Image className="w-5 h-5 text-blue-500" />}
      >
        {fotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/30">
            <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Nenhuma foto adicionada</p>
            <label className="cursor-pointer">
              <Button className="bg-primary hover:bg-primary/90" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Adicionar Fotos
              </Button>
              <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
            <p className="text-xs text-muted-foreground mt-3">JPG, PNG, WebP, GIF • Até 50MB (comprimido automaticamente)</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto: any, index: number) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-muted border">
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
                <div className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mt-2">Adicionar</span>
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
