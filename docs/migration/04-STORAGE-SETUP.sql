-- ==============================================================================
-- FASE 4: CONFIGURAR STORAGE BUCKETS
-- Execute este script APÓS as políticas RLS
-- ==============================================================================

-- ==============================================================================
-- CRIAR BUCKETS
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('estabelecimentos', 'estabelecimentos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('estabelecimento-logos', 'estabelecimento-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('establishment-photos', 'establishment-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- POLÍTICAS DE STORAGE PARA ESTABELECIMENTOS
-- ==============================================================================

CREATE POLICY "Estabelecimentos podem fazer upload de suas fotos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'estabelecimentos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Estabelecimentos podem atualizar suas fotos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'estabelecimentos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Estabelecimentos podem deletar suas fotos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'estabelecimentos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Fotos de estabelecimentos são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'estabelecimentos');

-- ==============================================================================
-- POLÍTICAS DE STORAGE PARA AVATARS
-- ==============================================================================

CREATE POLICY "Usuários podem fazer upload de avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuários podem atualizar seu avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Usuários podem deletar seu avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars são públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ==============================================================================
-- POLÍTICAS DE STORAGE PARA LOGOS
-- ==============================================================================

CREATE POLICY "Estabelecimentos podem fazer upload de logo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'estabelecimento-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Estabelecimentos podem atualizar logo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'estabelecimento-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Estabelecimentos podem deletar logo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'estabelecimento-logos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Logos são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'estabelecimento-logos');

-- ==============================================================================
-- POLÍTICAS DE STORAGE PARA ESTABLISHMENT-PHOTOS
-- ==============================================================================

CREATE POLICY "Upload de fotos de estabelecimento"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'establishment-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Atualizar fotos de estabelecimento"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'establishment-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Deletar fotos de estabelecimento"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'establishment-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Fotos de establishment são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'establishment-photos');

-- ==============================================================================
-- POLÍTICAS PARA SERVICE ROLE (Edge Functions)
-- ==============================================================================

-- Permitir que service role faça upload (para edge functions)
CREATE POLICY "Service role pode fazer upload em todos os buckets"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role pode atualizar em todos os buckets"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role pode deletar em todos os buckets"
  ON storage.objects FOR DELETE
  TO service_role
  USING (true);

COMMIT;
