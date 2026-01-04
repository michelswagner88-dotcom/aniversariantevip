import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";
import { isValidUUID, logSecurityEvent } from "../_shared/validation.ts";
import { checkRateLimit, getRequestIdentifier, rateLimitExceededResponse } from "../_shared/rateLimit.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    logSecurityEvent('delete_user_blocked_origin', { 
      origin: req.headers.get('origin') 
    }, 'warn');
    return new Response(
      JSON.stringify({ error: 'Origem não autorizada' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Rate limiting: 5 requisições por 10 minutos por IP
  const identifier = getRequestIdentifier(req);
  const { allowed, remaining } = await checkRateLimit(
    supabaseUrl,
    supabaseServiceKey,
    identifier,
    { limit: 5, windowMinutes: 10, keyPrefix: "delete_user" }
  );

  if (!allowed) {
    logSecurityEvent('delete_user_rate_limited', { identifier }, 'warn');
    return rateLimitExceededResponse(remaining);
  }

  try {
    console.log('🔵 delete-user: Iniciando requisição');
    
    // VALIDAÇÃO 1: Autenticação obrigatória
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logSecurityEvent('delete_user_no_auth', { identifier }, 'warn');
      return new Response(
        JSON.stringify({ error: 'Autenticação obrigatória' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar client com service_role (tem permissão de admin)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verificar usuário autenticado
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      logSecurityEvent('delete_user_invalid_token', { identifier }, 'warn');
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { userId } = await req.json();
    
    // VALIDAÇÃO 2: userId fornecido
    if (!userId) {
      console.error('❌ userId não fornecido');
      return new Response(
        JSON.stringify({ error: 'userId é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // VALIDAÇÃO 3: Formato UUID válido
    if (!isValidUUID(userId)) {
      logSecurityEvent('delete_user_invalid_uuid', { 
        userId, 
        requestingUserId: requestingUser.id 
      }, 'warn');
      return new Response(
        JSON.stringify({ error: 'Formato de userId inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // VALIDAÇÃO 4: Verificar se é admin ou o próprio usuário
    const isAdmin = await checkIsAdmin(supabaseAdmin, requestingUser.id);
    const isSelf = requestingUser.id === userId;

    if (!isAdmin && !isSelf) {
      logSecurityEvent('delete_user_unauthorized', { 
        requestingUserId: requestingUser.id,
        targetUserId: userId,
        isAdmin,
        isSelf
      }, 'error');
      return new Response(
        JSON.stringify({ error: 'Você não tem permissão para deletar este usuário' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔵 Deletando usuário:', userId, 'por:', requestingUser.id, isAdmin ? '(admin)' : '(self)');
    
    // Log do evento de deleção
    logSecurityEvent('delete_user_started', {
      requestingUserId: requestingUser.id,
      targetUserId: userId,
      isAdmin,
      isSelf
    }, 'info');
    
    // ORDEM DE EXCLUSÃO (do mais dependente para o menos)
    
    // 1. Deletar cupons do usuário
    console.log('🔵 Deletando cupons...');
    const { error: cuponsError } = await supabaseAdmin
      .from('cupons')
      .delete()
      .eq('aniversariante_id', userId);
    
    if (cuponsError && cuponsError.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao deletar cupons:', cuponsError);
    }
    
    // 2. Deletar rate limits de cupons
    console.log('🔵 Deletando rate limits...');
    const { error: rateLimitError } = await supabaseAdmin
      .from('cupom_rate_limit')
      .delete()
      .eq('aniversariante_id', userId);
    
    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao deletar rate limits:', rateLimitError);
    }
    
    // 3. Deletar favoritos do usuário
    console.log('🔵 Deletando favoritos...');
    const { error: favoritosError } = await supabaseAdmin
      .from('favoritos')
      .delete()
      .eq('usuario_id', userId);
    
    if (favoritosError && favoritosError.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao deletar favoritos:', favoritosError);
    }
    
    // 4. Deletar followers
    console.log('🔵 Deletando followers...');
    const { error: followersError } = await supabaseAdmin
      .from('followers')
      .delete()
      .eq('user_id', userId);
    
    if (followersError && followersError.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao deletar followers:', followersError);
    }
    
    // 5. Deletar interações em posts
    console.log('🔵 Deletando interações em posts...');
    const { error: interactionsError } = await supabaseAdmin
      .from('post_interactions')
      .delete()
      .eq('user_id', userId);
    
    if (interactionsError && interactionsError.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao deletar interações:', interactionsError);
    }
    
    // 6. Deletar da tabela aniversariantes
    console.log('🔵 Deletando aniversariante...');
    const { error: anivError } = await supabaseAdmin
      .from('aniversariantes')
      .delete()
      .eq('id', userId);
    
    if (anivError) {
      console.error('❌ Erro ao deletar aniversariante:', anivError);
      throw anivError;
    }
    
    // 7. Deletar da tabela user_roles
    console.log('🔵 Deletando user_roles...');
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (rolesError && rolesError.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao deletar roles:', rolesError);
    }
    
    // 8. Deletar da tabela profiles
    console.log('🔵 Deletando profile...');
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('⚠️ Erro ao deletar profile:', profileError);
    }
    
    // 9. Deletar usuário do Supabase Auth (último passo)
    console.log('🔵 Deletando do Auth...');
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      console.error('❌ Erro ao deletar do Auth:', authDeleteError);
      throw authDeleteError;
    }
    
    console.log('✅ Usuário deletado completamente do sistema!');
    
    logSecurityEvent('delete_user_success', {
      requestingUserId: requestingUser.id,
      targetUserId: userId,
      isAdmin
    }, 'info');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Usuário deletado completamente do sistema'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error: any) {
    console.error('❌ Erro geral na Edge Function:', error);
    logSecurityEvent('delete_user_error', { error: error.message }, 'error');
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao deletar usuário',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Verifica se um usuário é admin
 */
async function checkIsAdmin(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .eq('ativo', true)
      .single();
    
    return !!data;
  } catch {
    return false;
  }
}
