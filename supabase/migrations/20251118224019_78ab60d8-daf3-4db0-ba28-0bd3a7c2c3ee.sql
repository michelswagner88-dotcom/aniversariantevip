-- Criar bucket para logos dos estabelecimentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('estabelecimento-logos', 'estabelecimento-logos', true);

-- Criar política para permitir upload de logos (usuários autenticados)
CREATE POLICY "Usuários podem fazer upload de logos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'estabelecimento-logos');

-- Criar política para visualizar logos (público)
CREATE POLICY "Logos são públicos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'estabelecimento-logos');

-- Criar política para atualizar logos
CREATE POLICY "Usuários podem atualizar seus logos"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'estabelecimento-logos');

-- Criar política para deletar logos
CREATE POLICY "Usuários podem deletar seus logos"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'estabelecimento-logos');