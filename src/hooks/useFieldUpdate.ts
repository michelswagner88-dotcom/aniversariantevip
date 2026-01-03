// =============================================================================
// USE FIELD UPDATE - Hook para update de campo único do estabelecimento
// Abstração simples para usar com InlineSaveTextarea
// =============================================================================

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseFieldUpdateOptions {
  /** ID do estabelecimento */
  estabelecimentoId: string;
  /** Callback opcional após sucesso */
  onSuccess?: (field: string, value: any) => void;
  /** Callback opcional em caso de erro */
  onError?: (field: string, error: any) => void;
  /** Se deve mostrar toast (default: false, pois InlineSaveTextarea já mostra) */
  showToast?: boolean;
}

interface UpdateFieldParams {
  field: string;
  value: any;
}

/**
 * Hook para atualizar um campo específico do estabelecimento
 * Otimizado para uso com InlineSaveTextarea (save-per-field)
 *
 * @example
 * const { updateField, isUpdating } = useFieldUpdate({ estabelecimentoId: "123" });
 *
 * // No InlineSaveTextarea:
 * onSave={(value) => updateField("descricao_beneficio", value)}
 */
export function useFieldUpdate({ estabelecimentoId, onSuccess, onError, showToast = false }: UseFieldUpdateOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ field, value }: UpdateFieldParams) => {
      if (!estabelecimentoId) {
        throw new Error("ID do estabelecimento não fornecido");
      }

      console.log(`[useFieldUpdate] Atualizando ${field}:`, value);

      const { data, error } = await supabase
        .from("estabelecimentos")
        .update({ [field]: value })
        .eq("id", estabelecimentoId)
        .select()
        .single();

      if (error) {
        console.error(`[useFieldUpdate] Erro ao atualizar ${field}:`, error);
        throw error;
      }

      console.log(`[useFieldUpdate] ${field} atualizado com sucesso`);
      return { field, value, data };
    },
    onSuccess: async ({ field, value }) => {
      // Invalidar queries relacionadas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["estabelecimentos"] }),
        queryClient.invalidateQueries({ queryKey: ["public_estabelecimentos"] }),
      ]);

      onSuccess?.(field, value);
    },
    onError: (error: any, { field }) => {
      console.error(`[useFieldUpdate] Erro no campo ${field}:`, error);
      onError?.(field, error);
    },
  });

  /**
   * Atualiza um campo específico
   * @returns Promise<boolean> - true se sucesso, false se erro
   */
  const updateField = useCallback(
    async (field: string, value: any): Promise<boolean> => {
      try {
        await mutation.mutateAsync({ field, value });
        return true;
      } catch (error) {
        return false;
      }
    },
    [mutation],
  );

  /**
   * Cria uma função de save específica para um campo
   * Útil para passar diretamente ao InlineSaveTextarea
   *
   * @example
   * const saveDescricao = createFieldSaver("descricao_beneficio");
   * <InlineSaveTextarea onSave={saveDescricao} />
   */
  const createFieldSaver = useCallback(
    (field: string) => {
      return async (value: string): Promise<boolean> => {
        return updateField(field, value);
      };
    },
    [updateField],
  );

  return {
    updateField,
    createFieldSaver,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export default useFieldUpdate;
