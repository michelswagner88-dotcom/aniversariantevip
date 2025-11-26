import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, nome } = await req.json();

    console.log('Verificando se já existem admins...');
    
    // Verificar se já existe algum admin
    const { count } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (count && count > 0) {
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
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
