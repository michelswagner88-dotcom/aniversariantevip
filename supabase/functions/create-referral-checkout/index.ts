import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-REFERRAL-CHECKOUT] ${step}`, details || '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { priceId, establishmentId, referrerId } = await req.json();

    if (!priceId || !establishmentId) {
      throw new Error("Missing required fields: priceId, establishmentId");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Buscar email do estabelecimento
    const { data: establishment } = await supabaseClient
      .from('estabelecimentos')
      .select('id, razao_social, cnpj')
      .eq('id', establishmentId)
      .single();

    if (!establishment) {
      throw new Error("Establishment not found");
    }

    // Buscar ou criar customer no Stripe
    const customers = await stripe.customers.list({ 
      email: `${establishment.cnpj}@estabelecimento.com`,
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: `${establishment.cnpj}@estabelecimento.com`,
        name: establishment.razao_social,
        metadata: {
          establishment_id: establishmentId,
          cnpj: establishment.cnpj,
        },
      });
      customerId = customer.id;
    }

    logStep("Customer ready", { customerId });

    // Atualizar referrer_id se fornecido
    if (referrerId) {
      logStep("Linking referrer", { referrerId, establishmentId });
      await supabaseClient
        .from('estabelecimentos')
        .update({ referred_by_user_id: referrerId })
        .eq('id', establishmentId);
    }

    // Criar sessão de checkout
    const origin = req.headers.get("origin") || "http://localhost:8080";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/cadastro-estabelecimento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cadastro-estabelecimento/cancelado`,
      metadata: {
        establishment_id: establishmentId,
        referrer_id: referrerId || '',
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
