import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    return new Response(
      JSON.stringify({ error: 'Origem não autorizada' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Extrair e validar token JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação obrigatório' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Criar cliente com token do usuário para verificar identidade
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar se é ADMIN usando service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleError || !roleData) {
      console.warn(`⚠️ Tentativa de cleanup por usuário não-admin: ${user.email}`);
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem executar esta ação' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`✅ Admin ${user.email} iniciando cleanup...`);

    console.log('Limpando tabelas públicas primeiro...');
    
    // Limpar tabelas públicas (ordem importa por causa das foreign keys)
    await supabase.from('cupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('favoritos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_roles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('aniversariantes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('estabelecimentos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Tabelas públicas limpas. Buscando usuários do Auth...');
    
    // Buscar todos os usuários do Auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError);
      throw listError;
    }

    console.log(`Encontrados ${users.users.length} usuários para remover do Auth`);

    // Remover cada usuário do Auth (exceto o admin que está executando)
    let deletedCount = 0;
    for (const authUser of users.users) {
      // Não deletar o próprio admin que está executando
      if (authUser.id === user.id) {
        console.log(`⏭️ Pulando admin ${authUser.email} (usuário atual)`);
        continue;
      }
      
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id);
        if (!deleteError) {
          deletedCount++;
          console.log(`✓ Usuário ${authUser.email} removido do Auth`);
        } else {
          console.error(`✗ Erro ao remover ${authUser.email}:`, deleteError.message);
        }
      } catch (err) {
        console.error(`✗ Exceção ao remover ${authUser.email}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${deletedCount} usuários removidos com sucesso`,
        total: users.users.length,
        executedBy: user.email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro completo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
