-- ============================================
-- FOREIGN KEYS - ANIVERSARIANTE VIP
-- Correção Crítica: Adicionar integridade referencial
-- ============================================

-- 1. USER_ROLES → AUTH.USERS
ALTER TABLE user_roles
ADD CONSTRAINT fk_user_roles_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. PROFILES → AUTH.USERS
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_user
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. ANIVERSARIANTES → AUTH.USERS
ALTER TABLE aniversariantes
ADD CONSTRAINT fk_aniversariantes_user
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. ESTABELECIMENTOS → AUTH.USERS
ALTER TABLE estabelecimentos
ADD CONSTRAINT fk_estabelecimentos_user
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. FAVORITOS → AUTH.USERS
ALTER TABLE favoritos
ADD CONSTRAINT fk_favoritos_user
FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. FAVORITOS → ESTABELECIMENTOS
ALTER TABLE favoritos
ADD CONSTRAINT fk_favoritos_estabelecimento
FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 7. CUPONS → ANIVERSARIANTES
ALTER TABLE cupons
ADD CONSTRAINT fk_cupons_aniversariante
FOREIGN KEY (aniversariante_id) REFERENCES aniversariantes(id) ON DELETE CASCADE;

-- 8. CUPONS → ESTABELECIMENTOS
ALTER TABLE cupons
ADD CONSTRAINT fk_cupons_estabelecimento
FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 9. CUPOM_RATE_LIMIT → ANIVERSARIANTES
ALTER TABLE cupom_rate_limit
ADD CONSTRAINT fk_cupom_rate_limit_aniversariante
FOREIGN KEY (aniversariante_id) REFERENCES aniversariantes(id) ON DELETE CASCADE;

-- 10. CUPOM_RATE_LIMIT → ESTABELECIMENTOS
ALTER TABLE cupom_rate_limit
ADD CONSTRAINT fk_cupom_rate_limit_estabelecimento
FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 11. POSTS → ESTABELECIMENTOS
ALTER TABLE posts
ADD CONSTRAINT fk_posts_estabelecimento
FOREIGN KEY (establishment_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 12. STORIES → ESTABELECIMENTOS
ALTER TABLE stories
ADD CONSTRAINT fk_stories_estabelecimento
FOREIGN KEY (establishment_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 13. FOLLOWERS → AUTH.USERS
ALTER TABLE followers
ADD CONSTRAINT fk_followers_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 14. FOLLOWERS → ESTABELECIMENTOS
ALTER TABLE followers
ADD CONSTRAINT fk_followers_estabelecimento
FOREIGN KEY (establishment_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 15. POST_INTERACTIONS → AUTH.USERS
ALTER TABLE post_interactions
ADD CONSTRAINT fk_post_interactions_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 16. POST_INTERACTIONS → POSTS
ALTER TABLE post_interactions
ADD CONSTRAINT fk_post_interactions_post
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- 17. POST_VIEWS → POSTS
ALTER TABLE post_views
ADD CONSTRAINT fk_post_views_post
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- 18. POST_SHARES → POSTS
ALTER TABLE post_shares
ADD CONSTRAINT fk_post_shares_post
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- 19. FLASH_PROMOS → ESTABELECIMENTOS
ALTER TABLE flash_promos
ADD CONSTRAINT fk_flash_promos_estabelecimento
FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 20. AGENDA_EVENTS → ESTABELECIMENTOS
ALTER TABLE agenda_events
ADD CONSTRAINT fk_agenda_events_estabelecimento
FOREIGN KEY (establishment_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 21. AGENDA_EVENTS → POSTS
ALTER TABLE agenda_events
ADD CONSTRAINT fk_agenda_events_post
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- 22. ADMIN_ACCESS_LOGS → AUTH.USERS
ALTER TABLE admin_access_logs
ADD CONSTRAINT fk_admin_logs_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 23. ESTABELECIMENTO_ANALYTICS → ESTABELECIMENTOS
ALTER TABLE estabelecimento_analytics
ADD CONSTRAINT fk_estab_analytics_estabelecimento
FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 24. REFERRALS → AUTH.USERS (referrer)
ALTER TABLE referrals
ADD CONSTRAINT fk_referrals_referrer
FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 25. REFERRALS → ESTABELECIMENTOS
ALTER TABLE referrals
ADD CONSTRAINT fk_referrals_establishment
FOREIGN KEY (establishment_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 26. SECURITY_LOGS → AUTH.USERS
ALTER TABLE security_logs
ADD CONSTRAINT fk_security_logs_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 27. NAVIGATION_LOGS → AUTH.USERS
ALTER TABLE navigation_logs
ADD CONSTRAINT fk_navigation_logs_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 28. NAVIGATION_LOGS → ESTABELECIMENTOS
ALTER TABLE navigation_logs
ADD CONSTRAINT fk_navigation_logs_estabelecimento
FOREIGN KEY (establishment_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE;

-- 29. ANALYTICS → AUTH.USERS
ALTER TABLE analytics
ADD CONSTRAINT fk_analytics_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 30. EMAIL_ANALYTICS → AUTH.USERS
ALTER TABLE email_analytics
ADD CONSTRAINT fk_email_analytics_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 31. SEARCH_ANALYTICS → AUTH.USERS
ALTER TABLE search_analytics
ADD CONSTRAINT fk_search_analytics_user
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_estabelecimento ON favoritos(estabelecimento_id);
CREATE INDEX IF NOT EXISTS idx_cupons_aniversariante ON cupons(aniversariante_id);
CREATE INDEX IF NOT EXISTS idx_cupons_estabelecimento ON cupons(estabelecimento_id);
CREATE INDEX IF NOT EXISTS idx_posts_estabelecimento ON posts(establishment_id);
CREATE INDEX IF NOT EXISTS idx_stories_estabelecimento ON stories(establishment_id);
CREATE INDEX IF NOT EXISTS idx_followers_user ON followers(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_estabelecimento ON followers(establishment_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post ON post_interactions(post_id);