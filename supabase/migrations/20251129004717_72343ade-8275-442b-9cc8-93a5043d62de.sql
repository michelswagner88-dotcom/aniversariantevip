-- Criar bucket establishment-photos com acesso público (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('establishment-photos', 'establishment-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Fotos de estabelecimentos são públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias fotos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias fotos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem gerenciar todas as fotos" ON storage.objects;

-- Política: Qualquer pessoa pode visualizar fotos (leitura pública)
CREATE POLICY "Fotos de estabelecimentos são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'establishment-photos');

-- Política: Usuários autenticados podem fazer upload
CREATE POLICY "Usuários autenticados podem fazer upload de fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'establishment-photos');

-- Política: Usuários podem atualizar suas próprias fotos
CREATE POLICY "Usuários podem atualizar suas próprias fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'establishment-photos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'establishment-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política: Usuários podem deletar suas próprias fotos
CREATE POLICY "Usuários podem deletar suas próprias fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'establishment-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política: Admins podem gerenciar todas as fotos
CREATE POLICY "Admins podem gerenciar todas as fotos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'establishment-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'establishment-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);