import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FeatureGuard } from "@/components/FeatureGuard";
import { UpsellModal } from "@/components/UpsellModal";

interface CreateFlashPromoProps {
  isOpen: boolean;
  onClose: () => void;
  estabelecimentoId: string;
  cidade: string;
  estado: string;
  userPlan: string | null;
}

const durationOptions = [
  { value: "1", label: "1 hora", hours: 1 },
  { value: "3", label: "3 horas", hours: 3 },
  { value: "6", label: "6 horas", hours: 6 },
  { value: "12", label: "12 horas", hours: 12 },
  { value: "24", label: "24 horas (1 dia)", hours: 24 },
];

export const CreateFlashPromo = ({
  isOpen,
  onClose,
  estabelecimentoId,
  cidade,
  estado,
  userPlan,
}: CreateFlashPromoProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "3",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar plano antes de submeter
    if (!userPlan || userPlan === 'pending') {
      setShowUpsell(true);
      return;
    }

    setLoading(true);

    try {
      const selectedDuration = durationOptions.find(d => d.value === formData.duration);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (selectedDuration?.hours || 3));

      const { error } = await supabase.from("flash_promos").insert({
        estabelecimento_id: estabelecimentoId,
        title: formData.title,
        description: formData.description,
        cidade,
        estado,
        expires_at: expiresAt.toISOString(),
        status: 'ACTIVE',
      });

      if (error) throw error;

      toast({
        title: "Oferta Relâmpago Publicada! ⚡",
        description: "Sua oferta está visível para todos os usuários da sua cidade.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        duration: "3",
      });

      onClose();
    } catch (error: any) {
      console.error("Erro ao criar oferta relâmpago:", error);
      toast({
        title: "Erro ao publicar oferta",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Modal de Criação (Conteúdo Real)
  const CreationForm = (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-violet-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Criar Oferta Relâmpago
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Publique uma oferta por tempo limitado e apareça em destaque para milhares de usuários.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Título da Oferta */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Título da Oferta *
            </Label>
            <Input
              id="title"
              placeholder="Ex: Chopp em Dobro das 18h às 20h"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={60}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500">{formData.title.length}/60 caracteres</p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Descrição *
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva os detalhes da oferta..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              maxLength={200}
              rows={3}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500">{formData.description.length}/200 caracteres</p>
          </div>

          {/* Duração */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              Duração da Oferta *
            </Label>
            <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-orange-300 font-medium">Atenção</p>
              <p className="text-xs text-orange-200/80">
                Ofertas relâmpago não podem ser editadas ou canceladas após a publicação.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-slate-400 hover:text-white"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 via-violet-500 to-pink-500 hover:from-orange-600 hover:via-violet-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-orange-500/25"
            >
              {loading ? "Publicando..." : "⚡ Publicar Oferta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  // Se não for premium, mostrar modal de upsell ao invés do form
  if (!userPlan || userPlan === 'pending') {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 p-0">
            {/* Wrapper para trigger o upsell */}
            <div className="p-6">
              <UpsellModal 
                isOpen={true}
                onClose={onClose}
                feature="flash-promo"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {CreationForm}
      <UpsellModal 
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        feature="flash-promo"
      />
    </>
  );
};