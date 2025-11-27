import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Image, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CreatePost = ({ establishmentId }: { establishmentId: string }) => {
  const [postType, setPostType] = useState<'photo' | 'promo' | 'agenda'>('photo');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Campos para agenda
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [reservationLink, setReservationLink] = useState('');

  const { createPost, hasPostedToday } = usePosts(establishmentId);

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

    if (postType === 'agenda' && !eventDate) {
      toast.error('Informe a data do evento');
      return;
    }

    setIsUploading(true);

    try {
      // Upload da imagem para o storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${establishmentId}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('estabelecimento-logos')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('estabelecimento-logos')
        .getPublicUrl(fileName);

      // Criar o post
      await createPost({
        image_url: publicUrl,
        caption,
        type: postType,
      });

      // Se for agenda, criar o evento
      if (postType === 'agenda') {
        // Buscar o post recém-criado para obter o ID
        const { data: posts } = await supabase
          .from('posts')
          .select('id')
          .eq('establishment_id', establishmentId)
          .eq('image_url', publicUrl)
          .single();

        if (posts) {
          await supabase.from('agenda_events').insert({
            post_id: posts.id,
            establishment_id: establishmentId,
            event_date: eventDate,
            event_time: eventTime || null,
            title: eventTitle || caption,
            description: eventDescription,
            reservation_link: reservationLink,
          });
        }
      }

      // Limpar formulário
      setCaption('');
      setImageFile(null);
      setImagePreview(null);
      setEventDate('');
      setEventTime('');
      setEventTitle('');
      setEventDescription('');
      setReservationLink('');
      setPostType('photo');

      toast.success('Post publicado com sucesso! 🎉');
    } catch (error: any) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao publicar post');
    } finally {
      setIsUploading(false);
    }
  };

  const isDisabled = hasPostedToday || isUploading;

  return (
    <Card className="p-6 border-violet-500/20 bg-slate-900/50">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="text-violet-400" size={24} />
        <h2 className="text-xl font-bold text-white">Novo Post no Feed</h2>
      </div>

      {hasPostedToday && (
        <div className="mb-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
          <p className="text-sm text-violet-300">
            ✅ Post Realizado Hoje! Para manter a qualidade do Feed VIP, permitimos 1 destaque por dia. Capriche na escolha!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="postType" className="text-white">Tipo de Post</Label>
          <Select value={postType} onValueChange={(value: any) => setPostType(value)} disabled={isDisabled}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photo">📸 Foto do Dia</SelectItem>
              <SelectItem value="promo">🎁 Promoção Especial</SelectItem>
              <SelectItem value="agenda">📅 Evento/Agenda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="image" className="text-white flex items-center gap-2">
            <Image size={16} /> Imagem
          </Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isDisabled}
            className="bg-white/5 border-white/10 text-white"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-2 w-full h-48 object-cover rounded-lg" />
          )}
        </div>

        <div>
          <Label htmlFor="caption" className="text-white">Legenda</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escreva algo inspirador..."
            maxLength={200}
            disabled={isDisabled}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
          <p className="text-xs text-slate-500 mt-1">{caption.length}/200</p>
        </div>

        {postType === 'agenda' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate" className="text-white flex items-center gap-2">
                  <Calendar size={16} /> Data do Evento
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  disabled={isDisabled}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label htmlFor="eventTime" className="text-white">Horário (Opcional)</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  disabled={isDisabled}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="eventTitle" className="text-white">Título do Evento</Label>
              <Input
                id="eventTitle"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ex: Samba Raiz ao Vivo"
                disabled={isDisabled}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="eventDescription" className="text-white">Descrição</Label>
              <Textarea
                id="eventDescription"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Detalhes do evento..."
                disabled={isDisabled}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="reservationLink" className="text-white">Link de Reserva (Opcional)</Label>
              <Input
                id="reservationLink"
                type="url"
                value={reservationLink}
                onChange={(e) => setReservationLink(e.target.value)}
                placeholder="https://..."
                disabled={isDisabled}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
          </>
        )}

        <Button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-white font-bold"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Publicando...
            </>
          ) : hasPostedToday ? (
            'Post Realizado Hoje ✅'
          ) : (
            '✨ Publicar no Feed'
          )}
        </Button>
      </form>
    </Card>
  );
};
