-- Adicionar coluna slug
ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS slug TEXT;

-- Criar índice único para slug + cidade + estado (evitar duplicatas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_estabelecimentos_slug_unique 
ON estabelecimentos(slug, cidade, estado) 
WHERE slug IS NOT NULL;

-- Função para gerar slug automaticamente
CREATE OR REPLACE FUNCTION generate_slug(nome TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRANSLATE(
            nome,
            'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
            'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
          ),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Função para gerar slug da cidade
CREATE OR REPLACE FUNCTION generate_city_slug(cidade TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRANSLATE(
          cidade,
          'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
          'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
        ),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Gerar slugs para estabelecimentos existentes
UPDATE estabelecimentos 
SET slug = generate_slug(nome_fantasia)
WHERE slug IS NULL AND nome_fantasia IS NOT NULL;

-- Trigger para gerar slug automaticamente em novos cadastros
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := generate_slug(NEW.nome_fantasia);
  final_slug := base_slug;
  
  WHILE EXISTS (
    SELECT 1 FROM estabelecimentos 
    WHERE slug = final_slug 
    AND cidade = NEW.cidade 
    AND estado = NEW.estado
    AND id != NEW.id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_slug ON estabelecimentos;
CREATE TRIGGER trigger_auto_slug
BEFORE INSERT OR UPDATE OF nome_fantasia ON estabelecimentos
FOR EACH ROW
WHEN (NEW.nome_fantasia IS NOT NULL)
EXECUTE FUNCTION auto_generate_slug();