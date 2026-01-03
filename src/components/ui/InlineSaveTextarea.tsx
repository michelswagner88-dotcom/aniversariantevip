// =============================================================================
// INLINE SAVE TEXTAREA - Componente de textarea com salvar por campo
// Padrão premium: dirty state, loading, success feedback, normalização PT-BR
// =============================================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, Loader2, Save, AlertCircle, Sparkles, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { normalizeWithDetails, NormalizationCorrection } from "@/lib/normalizePtBrText";

// =============================================================================
// TYPES
// =============================================================================

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface InlineSaveTextareaProps {
  /** ID único do campo (usado para acessibilidade) */
  id: string;
  /** Label do campo */
  label: string;
  /** Descrição/helper text abaixo do label */
  description?: string;
  /** Valor inicial do campo */
  value: string;
  /** Placeholder do textarea */
  placeholder?: string;
  /** Número de linhas do textarea */
  rows?: number;
  /** Máximo de caracteres (opcional) */
  maxLength?: number;
  /** Se o campo é obrigatório */
  required?: boolean;
  /** Se o campo está desabilitado */
  disabled?: boolean;
  /** Se deve aplicar normalização PT-BR antes de salvar */
  normalize?: boolean;
  /** Texto de ajuda abaixo do campo */
  helperText?: string;
  /** Função de salvar - recebe o valor e retorna Promise<boolean> */
  onSave: (value: string) => Promise<boolean>;
  /** Callback quando valor muda (opcional, para controle externo) */
  onChange?: (value: string) => void;
  /** Classes CSS adicionais para o container */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function InlineSaveTextarea({
  id,
  label,
  description,
  value: initialValue,
  placeholder,
  rows = 3,
  maxLength,
  required = false,
  disabled = false,
  normalize = true,
  helperText,
  onSave,
  onChange,
  className,
}: InlineSaveTextareaProps) {
  // Estados
  const [value, setValue] = useState(initialValue || "");
  const [originalValue, setOriginalValue] = useState(initialValue || "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  // Estados para mostrar correções
  const [corrections, setCorrections] = useState<NormalizationCorrection[]>([]);
  const [showCorrections, setShowCorrections] = useState(false);

  // Ref para timeout do status "saved"
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const correctionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync com valor externo
  useEffect(() => {
    setValue(initialValue || "");
    setOriginalValue(initialValue || "");
    setStatus("idle");
  }, [initialValue]);

  // Limpar timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      if (correctionsTimeoutRef.current) {
        clearTimeout(correctionsTimeoutRef.current);
      }
    };
  }, []);

  // Detectar mudanças (dirty state)
  const isDirty = value !== originalValue;

  // Atualizar status quando há mudanças
  useEffect(() => {
    if (isDirty && status !== "saving") {
      setStatus("dirty");
      // Esconder correções quando usuário começa a editar
      setShowCorrections(false);
    }
  }, [isDirty, status]);

  // Handler de mudança
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
      setValue(newValue);
      onChange?.(newValue);
    },
    [maxLength, onChange],
  );

  // Handler de salvar
  const handleSave = useCallback(async () => {
    if (!isDirty || status === "saving") return;

    // Validação de campo obrigatório
    if (required && !value.trim()) {
      toast.error("Este campo é obrigatório");
      return;
    }

    setStatus("saving");

    try {
      // Aplicar normalização se habilitada
      let finalValue = value;
      
      if (normalize) {
        const result = normalizeWithDetails(value);
        finalValue = result.text;
        
        // Se teve correções, mostrar indicador visual
        if (result.wasNormalized && result.corrections.length > 0) {
          setCorrections(result.corrections);
          setShowCorrections(true);
          setValue(finalValue);
          
          // Auto-hide após 8 segundos
          correctionsTimeoutRef.current = setTimeout(() => {
            setShowCorrections(false);
          }, 8000);
        } else if (result.wasNormalized) {
          // Houve mudança mas sem correções de dicionário (ex: capitalização)
          setValue(finalValue);
        }
      }

      // Chamar função de salvar
      const success = await onSave(finalValue);

      if (success) {
        setOriginalValue(finalValue);
        setStatus("saved");
        setLastSavedAt(new Date());

        // Toast de sucesso
        toast.success("Salvo com sucesso!");

        // Resetar status após 3 segundos
        savedTimeoutRef.current = setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        setStatus("error");
        toast.error("Erro ao salvar. Tente novamente.");
      }
    } catch (error) {
      console.error("Error saving field:", error);
      setStatus("error");
      toast.error("Erro ao salvar. Tente novamente.");
    }
  }, [isDirty, status, required, value, normalize, onSave]);

  // Formatar "última vez salvo"
  const getLastSavedText = () => {
    if (!lastSavedAt) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSavedAt.getTime()) / 1000);

    if (diff < 5) return "Salvo agora";
    if (diff < 60) return `Salvo há ${diff}s`;
    if (diff < 3600) return `Salvo há ${Math.floor(diff / 60)}min`;
    return `Salvo há ${Math.floor(diff / 3600)}h`;
  };

  // Renderizar ícone de status
  const renderStatusIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "saved":
        return <Check className="w-4 h-4 text-emerald-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Save className="w-4 h-4" />;
    }
  };

  // Texto do botão
  const getButtonText = () => {
    switch (status) {
      case "saving":
        return "Salvando...";
      case "saved":
        return "Salvo";
      case "error":
        return "Tentar novamente";
      default:
        return "Salvar";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label e Descrição */}
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium text-foreground flex items-center gap-1.5">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {/* Textarea */}
      <Textarea
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled || status === "saving"}
        spellCheck={true}
        lang="pt-BR"
        autoCorrect="on"
        autoCapitalize="sentences"
        aria-label={label}
        aria-describedby={helperText ? `${id}-helper` : undefined}
        aria-invalid={status === "error"}
        className={cn(
          "bg-muted border-border text-foreground resize-none transition-all duration-150",
          "focus:ring-2 focus:ring-primary/20 focus:border-primary",
          status === "error" && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          status === "saved" && "border-emerald-500/50",
        )}
      />

      {/* Indicador visual de correções */}
      {showCorrections && corrections.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <p className="font-medium text-amber-700 dark:text-amber-400">
              Texto corrigido automaticamente
            </p>
            <div className="flex flex-wrap gap-2">
              {corrections.map((correction, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-xs"
                >
                  <span className="line-through text-muted-foreground">
                    {correction.original}
                  </span>
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span className="font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                    {correction.corrected}
                  </span>
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCorrections(false)}
            className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            aria-label="Fechar aviso de correções"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer: Helper text + Contador + Botão */}
      <div className="flex items-center justify-between gap-4">
        {/* Lado esquerdo: Helper text e contador */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {helperText && <span id={`${id}-helper`}>{helperText}</span>}
          {maxLength && (
            <span className={cn(value.length >= maxLength && "text-amber-500")}>
              {value.length}/{maxLength}
            </span>
          )}
          {status === "saved" && lastSavedAt && (
            <span className="text-emerald-500 flex items-center gap-1">
              <Check className="w-3 h-3" />
              {getLastSavedText()}
            </span>
          )}
        </div>

        {/* Lado direito: Botão Salvar */}
        <Button
          type="button"
          size="sm"
          variant={status === "saved" ? "outline" : "default"}
          onClick={handleSave}
          disabled={!isDirty || status === "saving" || disabled}
          className={cn(
            "min-w-[100px] transition-all duration-150",
            status === "saved" && "border-emerald-500 text-emerald-500 hover:bg-emerald-500/10",
            status === "error" && "bg-red-500 hover:bg-red-600",
          )}
          aria-label={`Salvar ${label}`}
        >
          {renderStatusIcon()}
          <span className="ml-2">{getButtonText()}</span>
        </Button>
      </div>
    </div>
  );
}

export default InlineSaveTextarea;
