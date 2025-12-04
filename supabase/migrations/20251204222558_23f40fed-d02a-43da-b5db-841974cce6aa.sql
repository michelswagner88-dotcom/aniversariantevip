-- Habilitar realtime para tabelas de interação
ALTER PUBLICATION supabase_realtime ADD TABLE cupons;
ALTER PUBLICATION supabase_realtime ADD TABLE favoritos;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE flash_promos;
ALTER PUBLICATION supabase_realtime ADD TABLE post_interactions;