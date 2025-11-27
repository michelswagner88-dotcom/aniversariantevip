import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStories } from '@/hooks/useStories';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, Loader2 } from 'lucide-react';

export const CreateStory = ({ establishmentId }: { establishmentId: string }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { createStory, hasStoryToday } = useStories(establishmentId);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error('Selecione uma imagem');
      return;
    }

    setIsUploading(true);

    try {
      // Upload da imagem para o storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `story-${establishmentId}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('estabelecimento-logos')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('estabelecimento-logos')
        .getPublicUrl(fileName);

      // Criar o story
      createStory({
        media_url: publicUrl,
      });

      // Limpar formulário
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error('Erro ao criar story:', error);
      toast.error('Erro ao publicar story');
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled = hasStoryToday || isUploading;

  return (
    <Card className="p-6 border-violet-500/20 bg-slate-900/50">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="text-orange-400" size={24} />
        <h2 className="text-xl font-bold text-white">Novo Story (24h)</h2>
      </div>

      {hasStoryToday && (
        <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <p className="text-sm text-orange-300">
            ✅ Story Ativo! Você já publicou um story hoje. Volte amanhã para compartilhar mais!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="storyImage" className="text-white">Imagem Vertical (9:16)</Label>
          <Input
            id="storyImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isDisabled}
            className="bg-white/5 border-white/10 text-white"
          />
          {imagePreview && (
            <div className="mt-2 flex justify-center">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-48 h-80 object-cover rounded-lg border border-white/10" 
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Publicando...
            </>
          ) : hasStoryToday ? (
            'Story Publicado Hoje ✅'
          ) : (
            '⚡ Publicar Story'
          )}
        </Button>
      </form>
    </Card>
  );
};
