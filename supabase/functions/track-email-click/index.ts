import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem
  if (!validarOrigem(req)) {
    return new Response(null, {
      status: 403,
      headers: {
        "Location": "https://aniversariantevip.com.br",
        ...corsHeaders,
      },
    });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get("id");
    const targetUrl = url.searchParams.get("url");

    if (!emailId || !targetUrl) {
      console.warn("Email ID ou URL de destino não fornecidos");
      return new Response("Missing parameters", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userAgent = req.headers.get("user-agent") || "unknown";
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(',')[0] : "unknown";

    // Registrar clique
    const { data: existing } = await supabase
      .from('email_analytics')
      .select('id, clicked_at, click_count')
      .eq('id', emailId)
      .single();

    if (existing) {
      await supabase
        .from('email_analytics')
        .update({
          clicked_at: existing.clicked_at || new Date().toISOString(),
          click_count: (existing.click_count || 0) + 1,
          user_agent: userAgent,
          ip_address: ipAddress
        })
        .eq('id', emailId);

      console.log(`✅ Clique registrado para email ${emailId} (total: ${(existing.click_count || 0) + 1})`);
    }

    // Redirecionar para URL de destino
    return new Response(null, {
      status: 302,
      headers: {
        "Location": decodeURIComponent(targetUrl),
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Erro ao rastrear clique:", error);
    // Em caso de erro, redirecionar para home
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "https://aniversariantevip.com.br",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
