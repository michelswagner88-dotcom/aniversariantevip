-- Criar buckets se não existirem
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('estabelecimentos', 'estabelecimentos', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Atualizar bucket existente para público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'estabelecimento-logos';

-- ============================================
-- POLÍTICAS PARA BUCKET: estabelecimentos
-- ============================================

-- SELECT: Visualização pública
CREATE POLICY "Fotos de estabelecimentos são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'estabelecimentos');

-- INSERT: Upload apenas por estabelecimentos e admins
CREATE POLICY "Estabelecimentos podem fazer upload de suas fotos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'estabelecimentos'
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'estabelecimento'::app_role)
    OR has_role(auth.uid(), 'colaborador'::app_role)
  )
);

-- UPDATE: Atualização por estabelecimentos e admins
CREATE POLICY "Estabelecimentos podem atualizar suas fotos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'estabelecimentos'
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'estabelecimento'::app_role)
    OR has_role(auth.uid(), 'colaborador'::app_role)
  )
);

-- DELETE: Apenas admins podem deletar
CREATE POLICY "Apenas admin pode deletar fotos de estabelecimentos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'estabelecimentos'
  AND auth.role() = 'authenticated'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================
-- POLÍTICAS PARA BUCKET: estabelecimento-logos
-- ============================================

-- SELECT: Visualização pública
CREATE POLICY "Logos de estabelecimentos são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'estabelecimento-logos');

-- INSERT: Upload apenas por estabelecimentos e admins
CREATE POLICY "Estabelecimentos podem fazer upload de logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'estabelecimento-logos'
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'estabelecimento'::app_role)
    OR has_role(auth.uid(), 'colaborador'::app_role)
  )
);

-- UPDATE: Atualização por estabelecimentos e admins
CREATE POLICY "Estabelecimentos podem atualizar logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'estabelecimento-logos'
  AND auth.role() = 'authenticated'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'estabelecimento'::app_role)
    OR has_role(auth.uid(), 'colaborador'::app_role)
  )
);

-- DELETE: Apenas admins podem deletar
CREATE POLICY "Apenas admin pode deletar logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'estabelecimento-logos'
  AND auth.role() = 'authenticated'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================
-- POLÍTICAS PARA BUCKET: avatars
-- ============================================

-- SELECT: Visualização pública
CREATE POLICY "Avatars são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- INSERT: Upload apenas do próprio avatar
CREATE POLICY "Usuários podem fazer upload do próprio avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: Atualização apenas do próprio avatar
CREATE POLICY "Usuários podem atualizar próprio avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Delete do próprio avatar ou admin
CREATE POLICY "Usuários podem deletar próprio avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);