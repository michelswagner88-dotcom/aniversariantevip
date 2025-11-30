-- ===================================================================
-- FASE 3: DEFESA EM PROFUNDIDADE - POLÍTICAS RESTRICTIVE
-- ===================================================================

-- 1. ANIVERSARIANTES - Bloquear acesso anônimo total
CREATE POLICY "Require authentication for aniversariantes"
ON public.aniversariantes
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 2. PROFILES - Bloquear acesso anônimo total
CREATE POLICY "Require authentication for profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 3. ESTABELECIMENTOS - Bloquear escrita anônima (SELECT via view pública)
CREATE POLICY "Require authentication for estabelecimentos insert"
ON public.estabelecimentos
AS RESTRICTIVE
FOR INSERT
TO public
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Require authentication for estabelecimentos update"
ON public.estabelecimentos
AS RESTRICTIVE
FOR UPDATE
TO public
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Require authentication for estabelecimentos delete"
ON public.estabelecimentos
AS RESTRICTIVE
FOR DELETE
TO public
USING (auth.uid() IS NOT NULL);

-- 4. CUPONS - Bloquear acesso anônimo total
CREATE POLICY "Require authentication for cupons"
ON public.cupons
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 5. EMAIL_ANALYTICS - Bloquear SELECT anônimo
CREATE POLICY "Require authentication for email_analytics select"
ON public.email_analytics
AS RESTRICTIVE
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);

-- 6. REFERRALS - Bloquear acesso anônimo total
CREATE POLICY "Require authentication for referrals"
ON public.referrals
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 7. CUPOM_RATE_LIMIT - Bloquear acesso anônimo total
CREATE POLICY "Require authentication for cupom_rate_limit"
ON public.cupom_rate_limit
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 8. USER_ROLES - Bloquear acesso anônimo total
CREATE POLICY "Require authentication for user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 9. FOLLOWERS - Bloquear acesso anônimo total
CREATE POLICY "Require authentication for followers"
ON public.followers
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 10. FAVORITOS - Bloquear acesso anônimo total
CREATE POLICY "Require authentication for favoritos"
ON public.favoritos
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);