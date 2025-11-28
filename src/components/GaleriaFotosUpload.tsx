import { useState, useRef } from 'react';
import { Camera, Plus, X, Star, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { processarImagemQuadrada, dataURLtoBlob } from '@/lib/imageUtils';

interface GaleriaFotosUploadProps {
  fotoPrincipal: string;
  setFotoPrincipal: (url: string) => void;
  galeriaFotos: string[];
  setGaleriaFotos: (urls: string[]) => void;
  maxFotos?: number;
}

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
      
      {/* Grid de fotos */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        
        {/* Foto Principal */}
        <div className="relative">
          <div 
            className={`aspect-square rounded-xl overflow-hidden border-2 
              ${fotoPrincipal ? 'border-violet-500' : 'border-dashed border-border'} 
              bg-muted cursor-pointer hover:border-violet-400 transition-colors`}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            {isProcessing && processingIndex === -1 ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              </div>
            ) : fotoPrincipal ? (
              <img src={fotoPrincipal} alt="Principal" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground text-center">Foto Principal</span>
              </div>
            )}
          </div>
          
          {fotoPrincipal && !isProcessing && (
            <>
              <span className="absolute top-1 left-1 bg-violet-600 text-white text-xs px-1.5 py-0.5 rounded">
                Principal
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removerFoto(0, true);
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/90"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </>
          )}
          
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
        
        {/* Fotos da Galeria */}
        {galeriaFotos.map((foto, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-xl overflow-hidden border border-border bg-muted">
              {isProcessing && processingIndex === index ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                </div>
              ) : (
                <img src={foto} alt={`Foto ${index + 2}`} className="w-full h-full object-cover" />
              )}
            </div>
            
            {/* Botões de ação */}
            {!isProcessing && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                <button
                  onClick={() => definirComoPrincipal(index)}
                  className="p-1.5 bg-violet-600 rounded-full hover:bg-violet-700"
                  title="Definir como principal"
                >
                  <Star className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={() => removerFoto(index, false)}
                  className="p-1.5 bg-destructive rounded-full hover:bg-destructive/90"
                  title="Remover"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            )}
          </div>
        ))}
        
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
      
      <p className="text-xs text-muted-foreground">
        📱 Envie qualquer foto - ajustamos automaticamente! Arraste para ver todas as fotos.
      </p>
    </div>
  );
};

export default GaleriaFotosUpload;
