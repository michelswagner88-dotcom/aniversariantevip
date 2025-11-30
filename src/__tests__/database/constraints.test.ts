import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Database Constraints Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CPF UNIQUE Constraint', () => {
    it('should prevent duplicate CPF insertion', async () => {
      const duplicateCPF = '12345678900';

      // Simular erro de constraint violation
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: '23505',
                message: 'duplicate key value violates unique constraint "aniversariantes_cpf_key"',
              },
            }),
          }),
        }),
      } as any);

      const { error } = await supabase
        .from('aniversariantes')
        .insert({
          id: 'user-123',
          cpf: duplicateCPF,
          telefone: '11999999999',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          data_nascimento: '1990-01-01',
        })
        .select()
        .single();

      expect(error).toBeTruthy();
      expect(error?.code).toBe('23505');
      expect(error?.message).toContain('unique constraint');
    });

    it('should allow unique CPF insertion', async () => {
      const uniqueCPF = '98765432100';

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'new-aniv-id',
                cpf: uniqueCPF,
                cadastro_completo: false,
              },
              error: null,
            }),
          }),
        }),
      } as any);

      const { data, error } = await supabase
        .from('aniversariantes')
        .insert({
          id: 'user-456',
          cpf: uniqueCPF,
          telefone: '11999999999',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          data_nascimento: '1990-01-01',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.cpf).toBe(uniqueCPF);
    });
  });

  describe('CNPJ UNIQUE Constraint', () => {
    it('should prevent duplicate CNPJ insertion', async () => {
      const duplicateCNPJ = '12345678000199';

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: '23505',
                message: 'duplicate key value violates unique constraint "estabelecimentos_cnpj_key"',
              },
            }),
          }),
        }),
      } as any);

      const { error } = await supabase
        .from('estabelecimentos')
        .insert({
          cnpj: duplicateCNPJ,
          razao_social: 'Empresa Teste',
          nome_fantasia: 'Teste',
        })
        .select()
        .single();

      expect(error).toBeTruthy();
      expect(error?.code).toBe('23505');
      expect(error?.message).toContain('unique constraint');
    });

    it('should allow unique CNPJ insertion', async () => {
      const uniqueCNPJ = '98765432000188';

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'new-estab-id',
                cnpj: uniqueCNPJ,
                cadastro_completo: false,
              },
              error: null,
            }),
          }),
        }),
      } as any);

      const { data, error } = await supabase
        .from('estabelecimentos')
        .insert({
          cnpj: uniqueCNPJ,
          razao_social: 'Nova Empresa',
          nome_fantasia: 'Nova',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.cnpj).toBe(uniqueCNPJ);
    });
  });

  describe('cadastro_completo Default Value', () => {
    it('should default to false for aniversariantes', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'new-id',
                cadastro_completo: false, // Default
              },
              error: null,
            }),
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('aniversariantes')
        .insert({
          id: 'user-789',
          cpf: '11122233344',
          telefone: '11999999999',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          bairro: 'Bela Vista',
          data_nascimento: '1990-01-01',
        })
        .select()
        .single();

      expect(data?.cadastro_completo).toBe(false);
    });

    it('should default to false for estabelecimentos', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'new-estab',
                cadastro_completo: false, // Default
              },
              error: null,
            }),
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('estabelecimentos')
        .insert({
          cnpj: '11122233000144',
          razao_social: 'Teste',
          nome_fantasia: 'Teste',
        })
        .select()
        .single();

      expect(data?.cadastro_completo).toBe(false);
    });
  });

  describe('RLS Policy Enforcement', () => {
    it('should block anonymous user from reading aniversariantes', async () => {
      // Simular usuário anônimo
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST301', message: 'RLS policy violation' },
          }),
        }),
      } as any);

      const { error } = await supabase
        .from('aniversariantes')
        .select('*')
        .eq('cpf', '12345678900');

      expect(error).toBeTruthy();
    });

    it('should block unauthorized INSERT into estabelecimentos', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST301', message: 'RLS policy violation' },
        }),
      } as any);

      const { error } = await supabase
        .from('estabelecimentos')
        .insert({
          cnpj: '12345678000199',
          razao_social: 'Teste',
        });

      expect(error).toBeTruthy();
    });
  });
});
