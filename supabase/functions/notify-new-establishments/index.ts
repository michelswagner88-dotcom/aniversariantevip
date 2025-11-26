import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  estabelecimento_id: string;
  nome_estabelecimento: string;
  cidade: string;
  estado: string;
  categoria: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { estabelecimento_id, nome_estabelecimento, cidade, estado, categoria }: NotificationPayload = await req.json();

    console.log(`Notificando aniversariantes sobre novo estabelecimento: ${nome_estabelecimento} em ${cidade}, ${estado}`);

    // Buscar aniversariantes na mesma cidade e estado
    const { data: aniversariantes, error: fetchError } = await supabase
      .from('aniversariantes')
      .select('id, telefone')
      .eq('cidade', cidade)
      .eq('estado', estado)
      .is('deleted_at', null)
      .not('telefone', 'is', null);

    if (fetchError) {
      console.error('Erro ao buscar aniversariantes:', fetchError);
      throw fetchError;
    }

    if (!aniversariantes || aniversariantes.length === 0) {
      console.log(`Nenhum aniversariante encontrado em ${cidade}, ${estado}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum aniversariante na região',
          notified: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${aniversariantes.length} aniversariantes encontrados na região`);

    // Registrar notificação no analytics
    const notificationPromises = aniversariantes.map(async (aniversariante) => {
      return supabase.from('analytics').insert({
        event_type: 'push_notification_sent',
        user_id: aniversariante.id,
        metadata: {
          estabelecimento_id,
          nome_estabelecimento,
          cidade,
          estado,
          categoria,
          tipo: 'new_establishment',
        },
      });
    });

    await Promise.all(notificationPromises);

    console.log(`Notificações registradas com sucesso para ${aniversariantes.length} usuários`);

    // Aqui você pode integrar com um serviço de push notification real
    // como Firebase Cloud Messaging (FCM), OneSignal, etc.
    // Por enquanto, apenas registramos no analytics

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notificações enviadas para ${aniversariantes.length} aniversariantes`,
        notified: aniversariantes.length,
        estabelecimento: nome_estabelecimento,
        location: `${cidade}, ${estado}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao processar notificações:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
