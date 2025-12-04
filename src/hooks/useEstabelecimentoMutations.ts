import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EstabelecimentoData {
  nome_fantasia?: string;
  categoria?: string[];
  especialidades?: string[];
  cidade?: string;
  estado?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  cep?: string;
  telefone?: string;
  whatsapp?: string;
  instagram?: string;
  site?: string;
  descricao_beneficio?: string;
  regras_utilizacao?: string;
  periodo_validade_beneficio?: string;
  horario_funcionamento?: string;
  logo_url?: string;
  ativo?: boolean;
  latitude?: number;
  longitude?: number;
}

export const useEstabelecimentoMutations = () => {
  const queryClient = useQueryClient();

  // Função para invalidar TODAS as queries relacionadas
  const invalidateAllQueries = async () => {
    console.log('[Mutation] Invalidando todas as queries de estabelecimentos...');
    
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['estabelecimentos'] }),
      queryClient.invalidateQueries({ queryKey: ['public_estabelecimentos'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] }),
    ]);
    
    console.log('[Mutation] Queries invalidadas com sucesso');
  };

  // CRIAR estabelecimento
  const createMutation = useMutation({
    mutationFn: async (data: EstabelecimentoData) => {
      console.log('[Mutation] Criando estabelecimento:', data.nome_fantasia);
      
      const { data: result, error } = await supabase
        .from('estabelecimentos')
        .insert({ ...data, ativo: true })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (data) => {
      console.log('[Mutation] Estabelecimento criado:', data.id);
      await invalidateAllQueries();
      toast.success('Estabelecimento cadastrado com sucesso!');
    },
    onError: (error: any) => {
      console.error('[Mutation] Erro ao criar:', error);
      toast.error(error.message || 'Erro ao cadastrar estabelecimento');
    },
  });

  // ATUALIZAR estabelecimento
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EstabelecimentoData> }) => {
      console.log('[Mutation] Atualizando estabelecimento:', id);
      
      const { data: result, error } = await supabase
        .from('estabelecimentos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (data) => {
      console.log('[Mutation] Estabelecimento atualizado:', data.id);
      await invalidateAllQueries();
      toast.success('Estabelecimento atualizado!');
    },
    onError: (error: any) => {
      console.error('[Mutation] Erro ao atualizar:', error);
      toast.error(error.message || 'Erro ao atualizar estabelecimento');
    },
  });

  // DELETAR estabelecimento
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('[Mutation] Deletando estabelecimento:', id);
      
      const { error } = await supabase
        .from('estabelecimentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: async (id) => {
      console.log('[Mutation] Estabelecimento deletado:', id);
      await invalidateAllQueries();
      toast.success('Estabelecimento removido!');
    },
    onError: (error: any) => {
      console.error('[Mutation] Erro ao deletar:', error);
      toast.error(error.message || 'Erro ao remover estabelecimento');
    },
  });

  // TOGGLE ativo/inativo
  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      console.log('[Mutation] Toggle ativo:', id, ativo);
      
      const { data: result, error } = await supabase
        .from('estabelecimentos')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (data) => {
      await invalidateAllQueries();
      toast.success(data.ativo ? 'Estabelecimento ativado!' : 'Estabelecimento desativado!');
    },
    onError: (error: any) => {
      console.error('[Mutation] Erro ao toggle ativo:', error);
      toast.error(error.message || 'Erro ao alterar status');
    },
  });

  return {
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    toggleAtivo: toggleAtivoMutation.mutate,
    isLoading: 
      createMutation.isPending || 
      updateMutation.isPending || 
      deleteMutation.isPending ||
      toggleAtivoMutation.isPending,
    invalidateAllQueries,
  };
};
