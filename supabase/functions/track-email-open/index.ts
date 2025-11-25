import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pixel transparente 1x1 em base64
const TRACKING_PIXEL = Uint8Array.from(atob(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
), c => c.charCodeAt(0));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get("id");

    if (!emailId) {
      console.warn("Email ID não fornecido");
      return new Response(TRACKING_PIXEL, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...corsHeaders,
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userAgent = req.headers.get("user-agent") || "unknown";
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(',')[0] : "unknown";

    // Registrar abertura (apenas se ainda não foi aberto)
    const { data: existing } = await supabase
      .from('email_analytics')
      .select('id, opened_at')
      .eq('id', emailId)
      .single();

    if (existing && !existing.opened_at) {
      await supabase
        .from('email_analytics')
        .update({
          opened_at: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: ipAddress
        })
        .eq('id', emailId);

      console.log(`✅ Email ${emailId} marcado como aberto`);
    }

    // Retornar pixel transparente
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Erro ao rastrear abertura:", error);
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
