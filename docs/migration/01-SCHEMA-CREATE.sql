-- ==============================================================================
-- FASE 1: CRIAR SCHEMA NO PROJETO SUPABASE PRO (nugyoqgbrjqgtopkmdvz)
-- Execute este script no SQL Editor do seu projeto Supabase PRO
-- ==============================================================================

-- ==============================================================================
-- 1. CRIAR ENUMS
-- ==============================================================================

CREATE TYPE public.app_role AS ENUM ('aniversariante', 'estabelecimento', 'admin', 'colaborador');
CREATE TYPE public.post_type AS ENUM ('photo', 'video', 'event');

-- ==============================================================================
-- 2. CRIAR TABELA DE PROFILES (base para usuários)
-- ==============================================================================

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  stripe_account_id TEXT,
  stripe_onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 3. CRIAR TABELA DE USER_ROLES
-- ==============================================================================

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ==============================================================================
-- 4. CRIAR TABELA DE ADMINS
-- ==============================================================================

CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  nivel TEXT DEFAULT 'admin',
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  criado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 5. CRIAR TABELA DE ANIVERSARIANTES
-- ==============================================================================

CREATE TABLE public.aniversariantes (
  id UUID NOT NULL PRIMARY KEY,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento DATE NOT NULL,
  telefone TEXT NOT NULL,
  cep TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  cadastro_completo BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 6. CRIAR TABELA DE ESTABELECIMENTOS
-- ==============================================================================

CREATE TABLE public.estabelecimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT,
  razao_social TEXT,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE,
  categoria TEXT[],
  especialidades TEXT[],
  telefone TEXT,
  whatsapp TEXT,
  endereco TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  instagram TEXT,
  site TEXT,
  descricao_beneficio TEXT,
  periodo_validade_beneficio TEXT DEFAULT 'mes_aniversario',
  regras_utilizacao TEXT,
  horario_funcionamento TEXT,
  logo_url TEXT,
  logo_url_backup TEXT,
  galeria_fotos TEXT[],
  fotos JSONB,
  ativo BOOLEAN DEFAULT true,
  plan_status TEXT DEFAULT 'active',
  cadastro_completo BOOLEAN DEFAULT false,
  tem_conta_acesso BOOLEAN DEFAULT false,
  slug TEXT,
  bio TEXT,
  beneficio_titulo TEXT,
  beneficio_regras TEXT,
  beneficio_validade TEXT,
  tipo_beneficio TEXT,
  endereco_formatado TEXT,
  google_place_id TEXT,
  foto_buscada BOOLEAN DEFAULT false,
  foto_migrada BOOLEAN DEFAULT false,
  foto_migrada_em TIMESTAMP WITH TIME ZONE,
  link_cardapio TEXT,
  stripe_customer_id TEXT,
  referred_by_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para estabelecimentos
CREATE INDEX idx_estabelecimentos_cidade ON public.estabelecimentos(cidade);
CREATE INDEX idx_estabelecimentos_estado ON public.estabelecimentos(estado);
CREATE INDEX idx_estabelecimentos_slug ON public.estabelecimentos(slug);
CREATE INDEX idx_estabelecimentos_ativo ON public.estabelecimentos(ativo);
CREATE INDEX idx_estabelecimentos_categoria ON public.estabelecimentos USING GIN(categoria);

-- ==============================================================================
-- 7. CRIAR TABELA DE ESPECIALIDADES
-- ==============================================================================

CREATE TABLE public.especialidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  icone TEXT,
  ordem INTEGER,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 8. CRIAR TABELA DE CUPONS
-- ==============================================================================

CREATE TABLE public.cupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aniversariante_id UUID NOT NULL REFERENCES public.aniversariantes(id),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  codigo TEXT NOT NULL UNIQUE,
  data_emissao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_validade TIMESTAMP WITH TIME ZONE,
  data_uso TIMESTAMP WITH TIME ZONE,
  usado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 9. CRIAR TABELA DE CUPOM_RATE_LIMIT
-- ==============================================================================

CREATE TABLE public.cupom_rate_limit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aniversariante_id UUID NOT NULL REFERENCES public.aniversariantes(id),
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  ultima_emissao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  contador_semanal INTEGER DEFAULT 1,
  semana_referencia DATE DEFAULT CURRENT_DATE,
  UNIQUE(aniversariante_id, estabelecimento_id, semana_referencia)
);

-- ==============================================================================
-- 10. CRIAR TABELA DE FAVORITOS
-- ==============================================================================

CREATE TABLE public.favoritos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(usuario_id, estabelecimento_id)
);

-- ==============================================================================
-- 11. CRIAR TABELA DE FOLLOWERS
-- ==============================================================================

CREATE TABLE public.followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, establishment_id)
);

-- ==============================================================================
-- 12. CRIAR TABELA DE POSTS
-- ==============================================================================

CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  type post_type DEFAULT 'photo',
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 13. CRIAR TABELA DE POST_INTERACTIONS
-- ==============================================================================

CREATE TABLE public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  comment_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 14. CRIAR TABELA DE POST_VIEWS
-- ==============================================================================

CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 15. CRIAR TABELA DE POST_SHARES
-- ==============================================================================

CREATE TABLE public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID,
  platform TEXT,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 16. CRIAR TABELA DE STORIES
-- ==============================================================================

CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 17. CRIAR TABELA DE FLASH_PROMOS
-- ==============================================================================

CREATE TABLE public.flash_promos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  claims_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 18. CRIAR TABELA DE AGENDA_EVENTS
-- ==============================================================================

CREATE TABLE public.agenda_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  reservation_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 19. CRIAR TABELAS DE ANALYTICS
-- ==============================================================================

CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.estabelecimento_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estabelecimento_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  tipo_evento TEXT NOT NULL,
  user_id UUID,
  metadata JSONB,
  data_evento TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  email_address TEXT NOT NULL,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_term TEXT,
  user_lat NUMERIC,
  user_lng NUMERIC,
  results_count INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.navigation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES public.estabelecimentos(id),
  user_id UUID,
  app_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 20. CRIAR TABELAS DE LOGS E SEGURANÇA
-- ==============================================================================

CREATE TABLE public.admin_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  authorized BOOLEAN NOT NULL,
  endpoint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  metadata JSONB,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ==============================================================================
-- 21. CRIAR MATERIALIZED VIEWS
-- ==============================================================================

CREATE MATERIALIZED VIEW public.mv_estabelecimentos_populares AS
SELECT 
  e.id,
  e.nome_fantasia,
  e.slug,
  e.categoria,
  e.especialidades,
  e.cidade,
  e.estado,
  e.bairro,
  e.latitude,
  e.longitude,
  e.descricao_beneficio,
  e.logo_url,
  COUNT(f.id) as total_favoritos
FROM public.estabelecimentos e
LEFT JOIN public.favoritos f ON e.id = f.estabelecimento_id
WHERE e.ativo = true AND e.deleted_at IS NULL
GROUP BY e.id
ORDER BY total_favoritos DESC;

CREATE UNIQUE INDEX idx_mv_estabelecimentos_populares_id ON public.mv_estabelecimentos_populares(id);

CREATE MATERIALIZED VIEW public.mv_contagem_cidades AS
SELECT 
  cidade,
  estado,
  COUNT(*) as total_estabelecimentos,
  COUNT(*) FILTER (WHERE 'Restaurante' = ANY(categoria)) as restaurantes,
  COUNT(*) FILTER (WHERE 'Bar' = ANY(categoria)) as bares,
  COUNT(*) FILTER (WHERE 'Salão de Beleza' = ANY(categoria)) as saloes,
  COUNT(*) FILTER (WHERE 'Academia' = ANY(categoria)) as academias
FROM public.estabelecimentos
WHERE ativo = true AND deleted_at IS NULL
GROUP BY cidade, estado;

CREATE UNIQUE INDEX idx_mv_contagem_cidades ON public.mv_contagem_cidades(cidade, estado);

-- ==============================================================================
-- 22. CRIAR VIEW PÚBLICA PARA ESTABELECIMENTOS
-- ==============================================================================

CREATE VIEW public.public_estabelecimentos AS
SELECT 
  id, codigo, nome_fantasia, razao_social, categoria, especialidades,
  telefone, whatsapp, endereco, bairro, cidade, estado, latitude, longitude,
  instagram, site, descricao_beneficio, periodo_validade_beneficio,
  regras_utilizacao, horario_funcionamento, logo_url, galeria_fotos,
  slug, bio, ativo, plan_status
FROM public.estabelecimentos
WHERE ativo = true AND deleted_at IS NULL;

-- ==============================================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aniversariantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estabelecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupom_rate_limit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estabelecimento_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

COMMIT;
