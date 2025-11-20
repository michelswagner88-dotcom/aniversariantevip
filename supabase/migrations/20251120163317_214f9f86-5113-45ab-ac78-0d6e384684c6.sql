-- Criar tabelas para dados específicos de aniversariantes e estabelecimentos

-- Tabela de dados de aniversariantes
CREATE TABLE IF NOT EXISTS public.aniversariantes (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cpf text UNIQUE NOT NULL,
  data_nascimento date NOT NULL,
  telefone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de dados de estabelecimentos
CREATE TABLE IF NOT EXISTS public.estabelecimentos (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cnpj text UNIQUE NOT NULL,
  razao_social text NOT NULL,
  nome_fantasia text,
  telefone text,
  endereco text,
  logo_url text,
  descricao_beneficio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.aniversariantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estabelecimentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para aniversariantes
CREATE POLICY "Usuários podem ver seu próprio perfil de aniversariante"
ON public.aniversariantes
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil de aniversariante"
ON public.aniversariantes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil de aniversariante"
ON public.aniversariantes
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis de aniversariantes"
ON public.aniversariantes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para estabelecimentos
CREATE POLICY "Estabelecimentos podem ver seu próprio perfil"
ON public.estabelecimentos
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Estabelecimentos podem inserir seu próprio perfil"
ON public.estabelecimentos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Estabelecimentos podem atualizar seu próprio perfil"
ON public.estabelecimentos
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis de estabelecimentos"
ON public.estabelecimentos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Aniversariantes podem ver estabelecimentos"
ON public.estabelecimentos
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'aniversariante'));

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_aniversariantes_updated_at
  BEFORE UPDATE ON public.aniversariantes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estabelecimentos_updated_at
  BEFORE UPDATE ON public.estabelecimentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();