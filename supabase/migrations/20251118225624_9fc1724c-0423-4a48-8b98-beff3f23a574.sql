-- Create cupons table to track issued coupons
CREATE TABLE public.cupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estabelecimento_id UUID NOT NULL,
  aniversariante_id UUID NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_validade TIMESTAMP WITH TIME ZONE,
  usado BOOLEAN NOT NULL DEFAULT false,
  data_uso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

-- Policies for cupons table
CREATE POLICY "Estabelecimentos podem ver seus próprios cupons" 
ON public.cupons 
FOR SELECT 
USING (auth.uid() = estabelecimento_id);

CREATE POLICY "Estabelecimentos podem criar cupons" 
ON public.cupons 
FOR INSERT 
WITH CHECK (auth.uid() = estabelecimento_id);

CREATE POLICY "Estabelecimentos podem atualizar seus cupons" 
ON public.cupons 
FOR UPDATE 
USING (auth.uid() = estabelecimento_id);

CREATE POLICY "Aniversariantes podem ver seus cupons" 
ON public.cupons 
FOR SELECT 
USING (auth.uid() = aniversariante_id);

-- Create index for better performance
CREATE INDEX idx_cupons_estabelecimento ON public.cupons(estabelecimento_id);
CREATE INDEX idx_cupons_aniversariante ON public.cupons(aniversariante_id);