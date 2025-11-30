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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, nome } = await req.json();

    // FASE 2: Proteção adicional - Extrair IP e User Agent
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log(`Setup Admin: Tentativa de criação de admin de IP ${clientIP}`);

    console.log('Verificando se já existem admins...');
    
    // Verificar se já existe algum admin
    const { count } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (count && count > 0) {
      // Log tentativa de criar admin quando já existe
      await supabase.from('admin_access_logs').insert({
        email: email || 'unknown',
        action: 'setup_admin_duplicate_attempt',
        endpoint: '/setup-first-admin',
        ip_address: clientIP,
        user_agent: userAgent,
        authorized: false,
        metadata: { 
          reason: 'admin_already_exists',
          existing_admins_count: count
        }
      });

      return new Response(
        JSON.stringify({ error: 'Já existem administradores cadastrados' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Criando novo usuário...');

    // Criar usuário com service role (bypass email confirmation)
    const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: { nome }
    });

    if (signUpError) {
      console.error('Erro ao criar usuário:', signUpError);
      
      // Se o email já existe, retornar erro específico
      if (signUpError.message?.includes('already been registered')) {
        return new Response(
          JSON.stringify({ 
            error: 'Este email já foi usado. Se você criou o admin antes, use outro email ou entre em contato com o suporte.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw signUpError;
    }

    if (!userData.user) {
      throw new Error('Usuário não foi criado');
    }

    console.log('Usuário criado:', userData.user.id);
    console.log('Criando profile...');

    // Criar profile manualmente (sem trigger)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userData.user.id,
        email,
        nome
      });

    if (profileError) {
      console.error('Erro ao criar profile:', profileError);
      // Não falhar se profile já existe
      if (profileError.code !== '23505') {
        throw profileError;
      }
    }

    console.log('Criando role de admin para:', userData.user.id);

    // Criar role de admin usando service role (bypass RLS)
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Erro ao criar role:', roleError);
      throw roleError;
    }

    console.log('Primeiro admin criado com sucesso!');

    // Log criação bem-sucedida do primeiro admin
    await supabase.from('admin_access_logs').insert({
      user_id: userData.user.id,
      email: email,
      action: 'setup_first_admin_success',
      endpoint: '/setup-first-admin',
      ip_address: clientIP,
      user_agent: userAgent,
      authorized: true,
      metadata: { 
        nome,
        created_at: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Primeiro administrador criado com sucesso!',
        userId: userData.user.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro completo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Log erro na criação do admin
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
      
      const clientIP = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      
      await supabaseClient.from('admin_access_logs').insert({
        email: 'unknown',
        action: 'setup_first_admin_error',
        endpoint: '/setup-first-admin',
        ip_address: clientIP,
        user_agent: userAgent,
        authorized: false,
        metadata: { 
          error: errorMessage,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('Erro ao logar erro de setup:', logError);
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
