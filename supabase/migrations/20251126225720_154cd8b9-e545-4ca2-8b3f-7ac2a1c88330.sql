-- Limpar todos os dados de usuários para permitir setup inicial limpo
-- ATENÇÃO: Isso remove TODOS os usuários do sistema

-- Remover todos os roles
DELETE FROM public.user_roles;

-- Remover todos os profiles
DELETE FROM public.profiles;

-- Remover todos os aniversariantes
DELETE FROM public.aniversariantes;

-- Remover todos os estabelecimentos
DELETE FROM public.estabelecimentos;

-- Remover todos os cupons
DELETE FROM public.cupons;