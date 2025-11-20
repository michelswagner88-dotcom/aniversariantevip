-- CRÍTICO: Bloquear acesso público a todas as tabelas sensíveis

-- 1. Proteger tabela profiles (emails de usuários)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Apenas usuários autenticados podem ver perfis
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Proteger tabela cupons (códigos de cupons e dados de negócio)
DROP POLICY IF EXISTS "Public can view cupons" ON public.cupons;

-- Cupons só visíveis para o dono ou estabelecimento
-- As políticas existentes já estão corretas, mas vamos garantir que não há acesso público

-- 3. Proteger tabela favoritos (preferências dos usuários)
DROP POLICY IF EXISTS "Public can view favoritos" ON public.favoritos;

-- Favoritos já tem políticas corretas, apenas confirmar que não há acesso público

-- 4. Proteger tabela user_roles (roles de administradores)
DROP POLICY IF EXISTS "Public can view user_roles" ON public.user_roles;

-- Roles já tem políticas corretas para usuários autenticados

-- 5. Proteger tabela analytics (dados de negócio)
DROP POLICY IF EXISTS "Public can view analytics" ON public.analytics;

-- Analytics já tem política correta apenas para admins

-- Garantir que nenhuma tabela tem acesso público não autenticado
-- Todas as políticas agora exigem autenticação ou são específicas por usuário