-- ==============================================================================
-- FASE 3: CRIAR POLÍTICAS RLS (Row Level Security)
-- Execute este script APÓS o 02-FUNCTIONS-CREATE.sql
-- ==============================================================================

-- ==============================================================================
-- POLÍTICAS PARA PROFILES
-- ==============================================================================

CREATE POLICY "Profiles são visíveis para usuários autenticados"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Inserir perfil via trigger"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- POLÍTICAS PARA USER_ROLES
-- ==============================================================================

CREATE POLICY "Usuários podem ver suas próprias roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins podem gerenciar roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (is_admin());

-- ==============================================================================
-- POLÍTICAS PARA ADMINS
-- ==============================================================================

CREATE POLICY "Admins podem ver tabela de admins"
  ON public.admins FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Super admins podem gerenciar admins"
  ON public.admins FOR ALL
  TO authenticated
  USING (get_admin_level() = 'super_admin');

-- ==============================================================================
-- POLÍTICAS PARA ANIVERSARIANTES
-- ==============================================================================

CREATE POLICY "Aniversariantes podem ver seus próprios dados"
  ON public.aniversariantes FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Aniversariantes podem atualizar seus dados"
  ON public.aniversariantes FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem se cadastrar como aniversariante"
  ON public.aniversariantes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os aniversariantes"
  ON public.aniversariantes FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins podem gerenciar aniversariantes"
  ON public.aniversariantes FOR ALL
  TO authenticated
  USING (is_admin());

-- ==============================================================================
-- POLÍTICAS PARA ESTABELECIMENTOS
-- ==============================================================================

-- Leitura pública para estabelecimentos ativos
CREATE POLICY "Estabelecimentos ativos são públicos"
  ON public.estabelecimentos FOR SELECT
  USING (ativo = true AND deleted_at IS NULL);

-- Estabelecimentos podem editar seus próprios dados
CREATE POLICY "Estabelecimentos podem editar seus dados"
  ON public.estabelecimentos FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admins têm acesso total
CREATE POLICY "Admins podem gerenciar estabelecimentos"
  ON public.estabelecimentos FOR ALL
  TO authenticated
  USING (is_admin());

-- Colaboradores podem gerenciar estabelecimentos
CREATE POLICY "Colaboradores podem gerenciar estabelecimentos"
  ON public.estabelecimentos FOR ALL
  TO authenticated
  USING (is_colaborador());

-- ==============================================================================
-- POLÍTICAS PARA ESPECIALIDADES
-- ==============================================================================

CREATE POLICY "Especialidades são públicas para leitura"
  ON public.especialidades FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admins podem gerenciar especialidades"
  ON public.especialidades FOR ALL
  TO authenticated
  USING (is_admin());

-- ==============================================================================
-- POLÍTICAS PARA CUPONS
-- ==============================================================================

CREATE POLICY "Aniversariantes podem ver seus cupons"
  ON public.cupons FOR SELECT
  TO authenticated
  USING (auth.uid() = aniversariante_id);

CREATE POLICY "Aniversariantes podem emitir cupons"
  ON public.cupons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = aniversariante_id);

CREATE POLICY "Estabelecimentos podem ver cupons emitidos para eles"
  ON public.cupons FOR SELECT
  TO authenticated
  USING (auth.uid() = estabelecimento_id);

CREATE POLICY "Estabelecimentos podem atualizar cupons (validar uso)"
  ON public.cupons FOR UPDATE
  TO authenticated
  USING (auth.uid() = estabelecimento_id);

CREATE POLICY "Admins podem gerenciar todos os cupons"
  ON public.cupons FOR ALL
  TO authenticated
  USING (is_admin());

-- ==============================================================================
-- POLÍTICAS PARA CUPOM_RATE_LIMIT
-- ==============================================================================

CREATE POLICY "Aniversariantes podem ver seu rate limit"
  ON public.cupom_rate_limit FOR SELECT
  TO authenticated
  USING (auth.uid() = aniversariante_id);

CREATE POLICY "Rate limit é gerenciado pela função"
  ON public.cupom_rate_limit FOR ALL
  TO authenticated
  USING (auth.uid() = aniversariante_id);

-- ==============================================================================
-- POLÍTICAS PARA FAVORITOS
-- ==============================================================================

CREATE POLICY "Usuários podem ver seus favoritos"
  ON public.favoritos FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem adicionar favoritos"
  ON public.favoritos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem remover seus favoritos"
  ON public.favoritos FOR DELETE
  TO authenticated
  USING (auth.uid() = usuario_id);

-- ==============================================================================
-- POLÍTICAS PARA FOLLOWERS
-- ==============================================================================

CREATE POLICY "Usuários podem ver seus follows"
  ON public.followers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem seguir estabelecimentos"
  ON public.followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deixar de seguir"
  ON public.followers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Estabelecimentos podem ver seus seguidores"
  ON public.followers FOR SELECT
  TO authenticated
  USING (auth.uid() = establishment_id);

-- ==============================================================================
-- POLÍTICAS PARA POSTS
-- ==============================================================================

CREATE POLICY "Posts são públicos para leitura"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Estabelecimentos podem criar posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem editar seus posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem deletar seus posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = establishment_id);

-- ==============================================================================
-- POLÍTICAS PARA POST_INTERACTIONS
-- ==============================================================================

CREATE POLICY "Interações de posts são visíveis"
  ON public.post_interactions FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem interagir"
  ON public.post_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas interações"
  ON public.post_interactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- POLÍTICAS PARA POST_VIEWS E POST_SHARES
-- ==============================================================================

CREATE POLICY "Views são públicas para inserção"
  ON public.post_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Views são visíveis para donos do post"
  ON public.post_views FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_id AND posts.establishment_id = auth.uid()
  ));

CREATE POLICY "Shares são públicas para inserção"
  ON public.post_shares FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Shares são visíveis para donos do post"
  ON public.post_shares FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_id AND posts.establishment_id = auth.uid()
  ));

-- ==============================================================================
-- POLÍTICAS PARA STORIES
-- ==============================================================================

CREATE POLICY "Stories ativos são públicos"
  ON public.stories FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Estabelecimentos podem criar stories"
  ON public.stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem deletar seus stories"
  ON public.stories FOR DELETE
  TO authenticated
  USING (auth.uid() = establishment_id);

-- ==============================================================================
-- POLÍTICAS PARA FLASH_PROMOS
-- ==============================================================================

CREATE POLICY "Flash promos ativas são públicas"
  ON public.flash_promos FOR SELECT
  USING (status = 'active' AND expires_at > now());

CREATE POLICY "Estabelecimentos podem criar promos"
  ON public.flash_promos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = estabelecimento_id);

CREATE POLICY "Estabelecimentos podem editar suas promos"
  ON public.flash_promos FOR UPDATE
  TO authenticated
  USING (auth.uid() = estabelecimento_id);

-- ==============================================================================
-- POLÍTICAS PARA AGENDA_EVENTS
-- ==============================================================================

CREATE POLICY "Eventos são públicos"
  ON public.agenda_events FOR SELECT
  USING (true);

CREATE POLICY "Estabelecimentos podem criar eventos"
  ON public.agenda_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem editar seus eventos"
  ON public.agenda_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = establishment_id);

CREATE POLICY "Estabelecimentos podem deletar seus eventos"
  ON public.agenda_events FOR DELETE
  TO authenticated
  USING (auth.uid() = establishment_id);

-- ==============================================================================
-- POLÍTICAS PARA ANALYTICS
-- ==============================================================================

CREATE POLICY "Analytics pode ser inserido"
  ON public.analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver analytics"
  ON public.analytics FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Estabelecimento analytics é inserível"
  ON public.estabelecimento_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Estabelecimentos podem ver suas analytics"
  ON public.estabelecimento_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = estabelecimento_id OR is_admin());

CREATE POLICY "Navigation logs podem ser inseridos"
  ON public.navigation_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Estabelecimentos podem ver seus navigation logs"
  ON public.navigation_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = establishment_id OR is_admin());

-- ==============================================================================
-- POLÍTICAS PARA EMAIL_ANALYTICS E SEARCH_ANALYTICS
-- ==============================================================================

CREATE POLICY "Email analytics inserível"
  ON public.email_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver email analytics"
  ON public.email_analytics FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Search analytics inserível"
  ON public.search_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver search analytics"
  ON public.search_analytics FOR SELECT
  TO authenticated
  USING (is_admin());

-- ==============================================================================
-- POLÍTICAS PARA LOGS DE SEGURANÇA
-- ==============================================================================

CREATE POLICY "Admin access logs inserível"
  ON public.admin_access_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver access logs"
  ON public.admin_access_logs FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Security logs inserível"
  ON public.security_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver security logs"
  ON public.security_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- ==============================================================================
-- POLÍTICAS PARA RATE_LIMITS
-- ==============================================================================

CREATE POLICY "Rate limits gerenciado por funções"
  ON public.rate_limits FOR ALL
  USING (true);

COMMIT;
