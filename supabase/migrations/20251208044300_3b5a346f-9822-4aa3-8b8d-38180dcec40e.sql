-- ============================================
-- SISTEMA DE BIO AUTOMÁTICA - ESTABELECIMENTOS
-- ============================================

-- 1. Função PostgreSQL para gerar bio premium por categoria
CREATE OR REPLACE FUNCTION public.generate_establishment_bio(
  p_nome TEXT,
  p_categoria TEXT,
  p_bairro TEXT,
  p_cidade TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_location TEXT;
  v_bio TEXT;
BEGIN
  -- Definir localização (bairro > cidade > default)
  v_location := COALESCE(NULLIF(p_bairro, ''), p_cidade, 'sua região');
  
  -- Gerar bio baseada na categoria com copywriting premium
  CASE COALESCE(p_categoria, 'Outros')
    WHEN 'Academia' THEN
      v_bio := COALESCE(p_nome, 'Academia') || ' é referência em fitness em ' || v_location || '. No seu aniversário, treine com benefícios exclusivos VIP!';
    
    WHEN 'Bar' THEN
      v_bio := 'O point obrigatório em ' || v_location || ' para celebrar. ' || COALESCE(p_nome, 'Bar') || ' oferece vantagens especiais para aniversariantes!';
    
    WHEN 'Barbearia' THEN
      v_bio := 'Estilo e atitude em ' || v_location || '. ' || COALESCE(p_nome, 'Barbearia') || ' cuida do seu visual com benefícios exclusivos no seu aniversário!';
    
    WHEN 'Cafeteria' THEN
      v_bio := 'Café especial e ambiente acolhedor em ' || v_location || '. ' || COALESCE(p_nome, 'Cafeteria') || ' celebra seu aniversário com você!';
    
    WHEN 'Casa Noturna' THEN
      v_bio := 'A noite é sua em ' || v_location || '! ' || COALESCE(p_nome, 'Casa Noturna') || ' oferece entrada VIP e benefícios exclusivos para aniversariantes!';
    
    WHEN 'Confeitaria' THEN
      v_bio := 'Doces momentos em ' || v_location || '. ' || COALESCE(p_nome, 'Confeitaria') || ' torna seu aniversário ainda mais especial!';
    
    WHEN 'Entretenimento' THEN
      v_bio := 'Diversão garantida em ' || v_location || '! ' || COALESCE(p_nome, 'Entretenimento') || ' tem surpresas especiais para aniversariantes!';
    
    WHEN 'Hospedagem' THEN
      v_bio := 'Conforto e exclusividade em ' || v_location || '. ' || COALESCE(p_nome, 'Hospedagem') || ' celebra seu aniversário com você!';
    
    WHEN 'Loja' THEN
      v_bio := COALESCE(p_nome, 'Loja') || ' em ' || v_location || ' tem ofertas imperdíveis para aniversariantes. Presenteie-se!';
    
    WHEN 'Restaurante' THEN
      v_bio := 'Experiência gastronômica de referência em ' || v_location || '. ' || COALESCE(p_nome, 'Restaurante') || ' celebra seu aniversário com sabor!';
    
    WHEN 'Salão de Beleza' THEN
      v_bio := 'Beleza e bem-estar em ' || v_location || '. ' || COALESCE(p_nome, 'Salão') || ' cuida de você com benefícios exclusivos no seu aniversário!';
    
    WHEN 'Saúde e Suplementos' THEN
      v_bio := 'Saúde e qualidade de vida em ' || v_location || '. ' || COALESCE(p_nome, 'Saúde') || ' oferece vantagens especiais para aniversariantes!';
    
    WHEN 'Serviços' THEN
      v_bio := COALESCE(p_nome, 'Serviços') || ' em ' || v_location || ' oferece atendimento VIP para aniversariantes. Aproveite!';
    
    WHEN 'Sorveteria' THEN
      v_bio := 'Sabores refrescantes em ' || v_location || '! ' || COALESCE(p_nome, 'Sorveteria') || ' adoça seu aniversário com benefícios exclusivos!';
    
    ELSE
      v_bio := COALESCE(p_nome, 'Estabelecimento') || ' em ' || v_location || ' tem benefícios exclusivos para aniversariantes. Venha celebrar!';
  END CASE;
  
  RETURN v_bio;
END;
$$;

-- 2. Trigger para gerar bio automaticamente no INSERT (se bio estiver vazia)
CREATE OR REPLACE FUNCTION public.trigger_generate_bio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só gera se bio estiver vazia ou nula
  IF NEW.bio IS NULL OR TRIM(NEW.bio) = '' THEN
    NEW.bio := generate_establishment_bio(
      NEW.nome_fantasia,
      COALESCE((NEW.categoria)[1], 'Outros'),
      NEW.bairro,
      NEW.cidade
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger (remove se existir)
DROP TRIGGER IF EXISTS auto_generate_establishment_bio ON public.estabelecimentos;
CREATE TRIGGER auto_generate_establishment_bio
  BEFORE INSERT ON public.estabelecimentos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_bio();

-- 3. UPDATE em massa para todos os estabelecimentos existentes sem bio
UPDATE public.estabelecimentos
SET bio = generate_establishment_bio(
  nome_fantasia,
  COALESCE((categoria)[1], 'Outros'),
  bairro,
  cidade
)
WHERE bio IS NULL OR TRIM(bio) = '';