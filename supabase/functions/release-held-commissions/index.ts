import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  console.log(`[RELEASE-COMMISSIONS] ${step}`, details || '');
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem (para invocações diretas do cron, permitir sem origin)
  const origin = req.headers.get('origin');
  if (origin && !validarOrigem(req)) {
    return new Response(
      JSON.stringify({ error: "Origem não autorizada" }),
      { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    logStep("Function started - checking for commissions to release");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Buscar comissões que estão em hold e cuja data de liberação já passou
    const { data: commissionsToRelease, error: queryError } = await supabaseClient
      .from('referrals')
      .select('*')
      .eq('status', 'held')
      .lte('hold_release_date', new Date().toISOString());

    if (queryError) {
      throw new Error(`Erro ao buscar comissões: ${queryError.message}`);
    }

    if (!commissionsToRelease || commissionsToRelease.length === 0) {
      logStep("No commissions to release");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma comissão para liberar',
          count: 0 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    logStep(`Found ${commissionsToRelease.length} commissions to release`);

    let successCount = 0;
    let errorCount = 0;

    // Atualizar status de cada comissão para "paid" (liberado para saque)
    for (const commission of commissionsToRelease) {
      try {
        const { error: updateError } = await supabaseClient
          .from('referrals')
          .update({ status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', commission.id);

        if (updateError) {
          logStep(`ERROR updating commission ${commission.id}`, { error: updateError });
          errorCount++;
        } else {
          logStep(`Commission ${commission.id} released successfully`);
          successCount++;
        }
      } catch (error: any) {
        logStep(`ERROR processing commission ${commission.id}`, { error: error.message });
        errorCount++;
      }
    }

    logStep(`Release completed`, { 
      total: commissionsToRelease.length,
      success: successCount,
      errors: errorCount 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${successCount} comissões liberadas, ${errorCount} erros`,
        total: commissionsToRelease.length,
        released: successCount,
        errors: errorCount
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
