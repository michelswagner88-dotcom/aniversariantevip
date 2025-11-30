import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Especialidade {
  id: string;
  nome: string;
  icone: string;
}

interface Props {
  categoria: string;
  selected: string[];
  onChange: (especialidades: string[]) => void;
  maxSelection?: number;
}

const EspecialidadesSelector = ({ 
  categoria, 
  selected, 
  onChange, 
  maxSelection = 3 
}: Props) => {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEspecialidades = async () => {
      if (!categoria) {
        setEspecialidades([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('especialidades')
        .select('id, nome, icone')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('ordem');

      if (!error && data) {
        setEspecialidades(data);
      }
      setLoading(false);
    };

    fetchEspecialidades();
  }, [categoria]);

  const toggleEspecialidade = (nome: string) => {
    if (selected.includes(nome)) {
      // Remover
      onChange(selected.filter(s => s !== nome));
    } else if (selected.length < maxSelection) {
      // Adicionar
      onChange([...selected, nome]);
    }
  };

  if (!categoria) {
    return (
      <p className="text-muted-foreground text-sm">
        Selecione uma categoria primeiro
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (especialidades.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhuma especialidade disponível para esta categoria
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Especialidades (selecione até {maxSelection})
        </label>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          selected.length === maxSelection 
            ? "bg-green-500/20 text-green-400" 
            : "bg-muted text-muted-foreground"
        )}>
          {selected.length}/{maxSelection}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {especialidades.map((esp) => {
          const isSelected = selected.includes(esp.nome);
          const isDisabled = !isSelected && selected.length >= maxSelection;

          return (
            <button
              key={esp.id}
              type="button"
              onClick={() => toggleEspecialidade(esp.nome)}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                isSelected
                  ? "bg-primary/20 border-primary text-primary"
                  : isDisabled
                  ? "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-50"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              <span>{esp.icone}</span>
              <span className="text-sm">{esp.nome}</span>
              {isSelected && (
                <Check className="w-4 h-4" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EspecialidadesSelector;
