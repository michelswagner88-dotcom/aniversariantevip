import { useState } from "react";
import { Image, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EstablishmentPhotosProps {
  estabelecimento: any;
  loading: boolean;
  onUpdate: (updates: any) => Promise<boolean>;
}

export function EstablishmentPhotos({ estabelecimento, loading, onUpdate }: EstablishmentPhotosProps) {
  const [uploading, setUploading] = useState(false);
  const fotos = Array.isArray(estabelecimento?.fotos) ? estabelecimento.fotos : 
                Array.isArray(estabelecimento?.galeria_fotos) ? estabelecimento.galeria_fotos : [];

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

        const { data: { publicUrl } } = supabase.storage
          .from("estabelecimento-fotos")
          .getPublicUrl(fileName);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fotos</h2>
          <p className="text-muted-foreground">Gerencie as fotos do seu estabelecimento</p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Image className="w-5 h-5" />
            Galeria de Fotos
          </CardTitle>
          <CardDescription>Adicione até 10 fotos para atrair mais clientes ({fotos.length}/10)</CardDescription>
        </CardHeader>
        <CardContent>
          {fotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma foto adicionada</p>
              <label className="cursor-pointer">
                <Button className="bg-primary hover:bg-primary/90" disabled={uploading}>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
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
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={typeof foto === 'string' ? foto : foto.url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemove(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {fotos.length < 10 && (
                <label className="cursor-pointer">
                  <div className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground mt-2">Adicionar</span>
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
        </CardContent>
      </Card>
    </div>
  );
}

export default EstablishmentPhotos;
