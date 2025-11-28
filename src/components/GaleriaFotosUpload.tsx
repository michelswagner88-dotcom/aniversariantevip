import { useState, useRef } from 'react';
import { Camera, Plus, X, Star, Loader2, GripVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { processarImagemQuadrada, dataURLtoBlob } from '@/lib/imageUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GaleriaFotosUploadProps {
  fotoPrincipal: string;
  setFotoPrincipal: (url: string) => void;
  galeriaFotos: string[];
  setGaleriaFotos: (urls: string[]) => void;
  maxFotos?: number;
}

// Componente de foto arrastável
const SortableFotoItem = ({ 
  foto, 
  index, 
  onRemove, 
  onSetPrincipal,
  isPrincipal,
  isProcessing
}: {
  foto: string;
  index: number;
  onRemove: () => void;
  onSetPrincipal: () => void;
  isPrincipal: boolean;
  isProcessing: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: foto });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className={`aspect-square rounded-xl overflow-hidden border-2 
        ${isPrincipal ? 'border-violet-500' : 'border-border'} 
        bg-muted transition-all ${isDragging ? 'ring-2 ring-violet-500' : ''}`}
      >
        <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
        
        {/* Grip handle para arrastar */}
        <div 
          {...listeners} 
          {...attributes}
          className="absolute top-2 left-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      </div>
      
      {isPrincipal && (
        <span className="absolute top-1 left-1 bg-violet-600 text-white text-xs px-1.5 py-0.5 rounded z-10">
          Principal
        </span>
      )}

      {/* Ações ao hover */}
      {!isProcessing && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
          {!isPrincipal && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetPrincipal(); }}
              className="p-1.5 bg-violet-600 rounded-full hover:bg-violet-700 transition-colors"
              title="Definir como principal"
            >
              <Star className="w-3 h-3 text-white" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
            title="Remover"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

const GaleriaFotosUpload = ({ 
  fotoPrincipal, 
  setFotoPrincipal, 
  galeriaFotos, 
  setGaleriaFotos,
  maxFotos = 5 
}: GaleriaFotosUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputGaleriaRef = useRef<HTMLInputElement>(null);

  const totalFotos = (fotoPrincipal ? 1 : 0) + galeriaFotos.length;
  const podeAdicionarMais = totalFotos < maxFotos;

  // Configuração de sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Precisa arrastar 8px para ativar
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler de drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const todasFotos = [fotoPrincipal, ...galeriaFotos].filter(Boolean);
      const oldIndex = todasFotos.indexOf(active.id as string);
      const newIndex = todasFotos.indexOf(over.id as string);

      const reordenadas = arrayMove(todasFotos, oldIndex, newIndex);

      // A primeira foto é sempre a principal
      setFotoPrincipal(reordenadas[0] as string);
      setGaleriaFotos(reordenadas.slice(1) as string[]);

      toast.success('Fotos reordenadas!');
    }
  };

  // Upload para storage
  const uploadImagem = async (base64: string, index: number): Promise<string> => {
    const fileName = `estabelecimento_${Date.now()}_${index}.jpg`;
    const blob = dataURLtoBlob(base64);
    
    const { data, error } = await supabase.storage
      .from('estabelecimento-logos')
      .upload(fileName, blob, { contentType: 'image/jpeg' });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('estabelecimento-logos')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  // Handler foto principal
  const handleFotoPrincipal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, envie apenas imagens');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 10MB.');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProcessingIndex(-1);
      const processada = await processarImagemQuadrada(file);
      const url = await uploadImagem(processada, 0);
      setFotoPrincipal(url);
      toast.success('Foto principal adicionada!');
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      toast.error('Erro ao processar imagem');
    } finally {
      setIsProcessing(false);
      setProcessingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handler fotos da galeria
  const handleFotosGaleria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const espacoDisponivel = maxFotos - totalFotos;
    const fotosParaAdicionar = files.slice(0, espacoDisponivel);
    
    if (files.length > espacoDisponivel) {
      toast.warning(`Limite de ${maxFotos} fotos. Apenas ${espacoDisponivel} serão adicionadas.`);
    }
    
    try {
      setIsProcessing(true);
      const novasFotos: string[] = [];
      
      for (let i = 0; i < fotosParaAdicionar.length; i++) {
        const file = fotosParaAdicionar[i];
        
        if (!file.type.startsWith('image/')) {
          toast.error(`Arquivo ${file.name} não é uma imagem válida`);
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande. Máximo 10MB.`);
          continue;
        }
        
        setProcessingIndex(galeriaFotos.length + i);
        const processada = await processarImagemQuadrada(file);
        const url = await uploadImagem(processada, galeriaFotos.length + i + 1);
        novasFotos.push(url);
      }
      
      setGaleriaFotos([...galeriaFotos, ...novasFotos]);
      toast.success(`${novasFotos.length} foto(s) adicionada(s)!`);
    } catch (err) {
      console.error('Erro ao processar imagens:', err);
      toast.error('Erro ao processar imagens');
    } finally {
      setIsProcessing(false);
      setProcessingIndex(null);
      if (fileInputGaleriaRef.current) fileInputGaleriaRef.current.value = '';
    }
  };

  // Definir como principal
  const definirComoPrincipal = (index: number) => {
    const fotoSelecionada = galeriaFotos[index];
    const novaGaleria = galeriaFotos.filter((_, i) => i !== index);
    
    if (fotoPrincipal) {
      novaGaleria.unshift(fotoPrincipal); // Antiga principal vai pra galeria
    }
    
    setFotoPrincipal(fotoSelecionada);
    setGaleriaFotos(novaGaleria);
    toast.success('Foto principal atualizada!');
  };

  // Remover foto
  const removerFoto = (index: number, isPrincipal: boolean) => {
    if (isPrincipal) {
      // Se remover principal e tiver na galeria, promove a primeira
      if (galeriaFotos.length > 0) {
        setFotoPrincipal(galeriaFotos[0]);
        setGaleriaFotos(galeriaFotos.slice(1));
      } else {
        setFotoPrincipal('');
      }
    } else {
      setGaleriaFotos(galeriaFotos.filter((_, i) => i !== index));
    }
    toast.success('Foto removida');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Fotos do Estabelecimento</Label>
        <span className="text-sm text-muted-foreground">{totalFotos}/{maxFotos} fotos</span>
      </div>
      
      {/* Grid de fotos com Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {/* Fotos com drag-and-drop */}
          {fotoPrincipal && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFotoPrincipal}
                className="hidden"
                disabled={isProcessing}
              />
              
              <SortableContext items={[fotoPrincipal, ...galeriaFotos]} strategy={rectSortingStrategy}>
                <SortableFotoItem
                  foto={fotoPrincipal}
                  index={0}
                  onRemove={() => removerFoto(0, true)}
                  onSetPrincipal={() => {}}
                  isPrincipal={true}
                  isProcessing={isProcessing}
                />
                
                {galeriaFotos.map((foto, index) => (
                  <SortableFotoItem
                    key={foto}
                    foto={foto}
                    index={index + 1}
                    onRemove={() => removerFoto(index, false)}
                    onSetPrincipal={() => definirComoPrincipal(index)}
                    isPrincipal={false}
                    isProcessing={isProcessing}
                  />
                ))}
              </SortableContext>
            </>
          )}
          
          {/* Se não tem foto principal, mostrar upload */}
          {!fotoPrincipal && (
            <div className="relative">
              <div 
                className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-border
                  bg-muted cursor-pointer hover:border-violet-400 transition-colors"
                onClick={() => !isProcessing && fileInputRef.current?.click()}
              >
                {isProcessing && processingIndex === -1 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center">Foto Principal</span>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFotoPrincipal}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          )}
          
          {/* Botão adicionar mais */}
          {podeAdicionarMais && (
            <div 
              className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted 
                cursor-pointer hover:border-violet-500 transition-colors flex flex-col items-center justify-center"
              onClick={() => !isProcessing && fileInputGaleriaRef.current?.click()}
            >
              {isProcessing && processingIndex !== -1 && processingIndex !== null ? (
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              ) : (
                <>
                  <Plus className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Adicionar</span>
                </>
              )}
            </div>
          )}
          
          <input
            ref={fileInputGaleriaRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFotosGaleria}
            className="hidden"
            disabled={isProcessing}
          />
        </div>
      </DndContext>
      
      <p className="text-xs text-muted-foreground">
        📱 Arraste as fotos para reordenar. A primeira foto será a principal.
      </p>
    </div>
  );
};

export default GaleriaFotosUpload;
