import "@testing-library/jest-dom";
import { expect, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Configuração Global de Testes
 *
 * Este arquivo é executado antes de todos os testes.
 * Configura mocks globais e limpeza entre testes.
 */

// ===== CLEANUP =====

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  sessionStorage.clear();
  localStorage.clear();
});

// ===== BROWSER APIS MOCKS =====

beforeAll(() => {
  // Mock window.matchMedia (usado por hooks de responsividade)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver (usado por muitos componentes UI)
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver (usado para lazy loading)
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: "",
    thresholds: [],
  }));

  // Mock scrollTo (usado por navegação)
  window.scrollTo = vi.fn();

  // Mock navigator.clipboard
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(""),
    },
    writable: true,
  });

  // Suprimir console.error de React em testes (opcional)
  // vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ===== SUPABASE MOCK =====

const createMockQueryBuilder = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  containedBy: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  then: vi.fn().mockResolvedValue({ data: [], error: null }),
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => createMockQueryBuilder()),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/image.jpg" } })),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  },
}));

// ===== REACT ROUTER MOCK =====

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
      key: "default",
    }),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    // Navigate component que pode ser testado
    Navigate: ({ to, replace, state }: { to: string; replace?: boolean; state?: any }) => {
      // Chamar mockNavigate para que testes possam verificar
      mockNavigate(to, { replace, state });
      return null; // Não renderiza nada
    },
  };
});

// Exportar para uso em testes
export { mockNavigate };

// ===== TOAST MOCK =====

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// ===== CUSTOM MATCHERS =====

interface CustomMatchers<R = unknown> {
  toBeRedirectedTo(expected: string): R;
  toHaveBeenNavigatedTo(expected: string): R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  /**
   * Verifica se mockNavigate foi chamado com a rota esperada
   */
  toHaveBeenNavigatedTo(received: typeof mockNavigate, expected: string) {
    const calls = received.mock.calls;
    const wasCalledWithRoute = calls.some(
      (call: [string, ...any[]]) => call[0] === expected || call[0]?.includes(expected),
    );

    return {
      pass: wasCalledWithRoute,
      message: () =>
        wasCalledWithRoute
          ? `Expected not to navigate to "${expected}", but it was called`
          : `Expected to navigate to "${expected}", but navigate was called with: ${JSON.stringify(calls)}`,
    };
  },

  /**
   * Verifica redirecionamento em string (legado, para compatibilidade)
   */
  toBeRedirectedTo(received: string, expected: string) {
    const pass = received.includes(expected);
    return {
      pass,
      message: () =>
        pass
          ? `Expected not to be redirected to "${expected}"`
          : `Expected to be redirected to "${expected}", but got "${received}"`,
    };
  },
});

// ===== HELPERS PARA TESTES =====

/**
 * Cria um mock de sessão do Supabase
 */
export const createMockSession = (overrides = {}) => ({
  user: {
    id: "test-user-id",
    email: "test@example.com",
    user_metadata: { name: "Test User" },
    ...overrides,
  },
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Date.now() + 3600000,
});

/**
 * Cria dados de aniversariante de teste (com CPF válido)
 */
export const createMockAniversariante = (overrides = {}) => ({
  id: "test-aniv-id",
  cpf: "52998224725", // CPF válido
  telefone: "48999999999",
  cidade: "Florianópolis",
  estado: "SC",
  cep: "88015600",
  logradouro: "Rua Teste",
  bairro: "Centro",
  data_nascimento: "1990-03-15",
  cadastro_completo: true,
  ...overrides,
});

/**
 * Cria dados de estabelecimento de teste (com CNPJ válido)
 */
export const createMockEstabelecimento = (overrides = {}) => ({
  id: "test-estab-id",
  cnpj: "11222333000181", // CNPJ válido
  nome_fantasia: "Restaurante Teste",
  razao_social: "Restaurante Teste LTDA",
  cadastro_completo: true,
  ...overrides,
});
