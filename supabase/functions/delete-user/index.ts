import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔵 delete-user: Iniciando requisição');
    
    const { userId } = await req.json();
    
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
    
    console.log('🔵 Deletando usuário:', userId);
    
    // Criar client com service_role (tem permissão de admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
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
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('❌ Erro ao deletar do Auth:', authError);
      throw authError;
    }
    
    console.log('✅ Usuário deletado completamente do sistema!');
    
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
