import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedAniversarianteRoute from '@/components/auth/ProtectedAniversarianteRoute';
import { supabase } from '@/integrations/supabase/client';

// Helper para esperar por condições
const waitFor = async (callback: () => boolean | void, timeout = 3000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const result = callback();
      if (result !== false) return;
    } catch (error) {
      // Continue trying
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Timeout waiting for condition');
};

describe('ProtectedAniversarianteRoute Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should render loading spinner initially', () => {
    // Mock sessão pendente
    vi.mocked(supabase.auth.getSession).mockReturnValue(
      new Promise(() => {}) // Never resolves
    );

    const { container } = render(
      <MemoryRouter>
        <ProtectedAniversarianteRoute>
          <div>Protected Content</div>
        </ProtectedAniversarianteRoute>
      </MemoryRouter>
    );

    // Verificar que está no estado de loading
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('should redirect when no session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { container } = render(
      <MemoryRouter>
        <ProtectedAniversarianteRoute>
          <div>Protected Content</div>
        </ProtectedAniversarianteRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Redirecting to /auth');
    });
  });

  it('should redirect when cadastro is incomplete', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'mock-token',
    };

    const mockAniversariante = {
      id: 'aniv-123',
      user_id: 'user-123',
      cadastro_completo: false,
      cpf: '12345678900',
      telefone: null, // Campo faltando
      cidade: 'São Paulo',
      estado: 'SP',
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn()
            .mockResolvedValueOnce({
              data: { role: 'aniversariante' },
              error: null,
            })
            .mockResolvedValueOnce({
              data: mockAniversariante,
              error: null,
            }),
        }),
      }),
    } as any);

    const { container } = render(
      <MemoryRouter>
        <ProtectedAniversarianteRoute>
          <div>Protected Content</div>
        </ProtectedAniversarianteRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Redirecting to /auth');
      expect(sessionStorage.getItem('needsCompletion')).toBe('true');
      expect(sessionStorage.getItem('forceStep2')).toBe('true');
    });
  });

  it('should render children when fully authorized', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'mock-token',
    };

    const mockAniversariante = {
      id: 'aniv-123',
      user_id: 'user-123',
      cadastro_completo: true,
      cpf: '12345678900',
      telefone: '11999999999',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      data_nascimento: '1990-01-01',
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn()
            .mockResolvedValueOnce({
              data: { role: 'aniversariante' },
              error: null,
            })
            .mockResolvedValueOnce({
              data: mockAniversariante,
              error: null,
            }),
        }),
      }),
    } as any);

    const { container } = render(
      <MemoryRouter>
        <ProtectedAniversarianteRoute>
          <div>Protected Content</div>
        </ProtectedAniversarianteRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Protected Content');
    });
  });

  it('should redirect when user has no role', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'mock-token',
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    } as any);

    const { container } = render(
      <MemoryRouter>
        <ProtectedAniversarianteRoute>
          <div>Protected Content</div>
        </ProtectedAniversarianteRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Redirecting');
    });
  });
});
