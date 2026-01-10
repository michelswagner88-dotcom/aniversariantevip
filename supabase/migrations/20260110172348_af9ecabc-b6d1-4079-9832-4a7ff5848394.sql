-- Criar bucket estabelecimento-fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'estabelecimento-fotos',
  'estabelecimento-fotos',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

-- Policy: Visualização pública
CREATE POLICY "Public view estabelecimento-fotos"
ON storage.objects FOR SELECT
USING (bucket_id = 'estabelecimento-fotos');

-- Policy: Upload autenticado
CREATE POLICY "Auth upload estabelecimento-fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'estabelecimento-fotos');

-- Policy: Update próprios arquivos
CREATE POLICY "Update own estabelecimento-fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'estabelecimento-fotos');

-- Policy: Delete próprios arquivos
CREATE POLICY "Delete own estabelecimento-fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'estabelecimento-fotos');