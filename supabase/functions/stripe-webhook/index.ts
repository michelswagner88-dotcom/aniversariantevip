import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "stripe-signature, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}`, details || '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      throw new Error("Missing signature or webhook secret");
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    logStep("Event type", { type: event.type });

    // Processar pagamento de assinatura
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      
      logStep("Processing invoice", { 
        invoiceId: invoice.id, 
        amount: invoice.amount_paid,
        customerId: invoice.customer 
      });

      // Buscar estabelecimento pelo stripe_customer_id
      const { data: establishments } = await supabaseClient
        .from('estabelecimentos')
        .select('id, referred_by_user_id')
        .eq('stripe_customer_id', invoice.customer as string)
        .single();

      if (!establishments?.referred_by_user_id) {
        logStep("No referrer found for this establishment");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Buscar dados do afiliado
      const { data: referrer } = await supabaseClient
        .from('profiles')
        .select('stripe_account_id, stripe_onboarding_completed')
        .eq('id', establishments.referred_by_user_id)
        .single();

      if (!referrer?.stripe_account_id || !referrer.stripe_onboarding_completed) {
        logStep("Referrer Stripe account not ready");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Calcular comissão (30%)
      const commissionAmount = Math.floor(invoice.amount_paid * 0.30);
      
      logStep("Transferring commission", {
        amount: commissionAmount,
        to: referrer.stripe_account_id
      });

      // Criar transferência para o afiliado
      const transfer = await stripe.transfers.create({
        amount: commissionAmount,
        currency: invoice.currency,
        destination: referrer.stripe_account_id,
        description: `Comissão - Estabelecimento ${establishments.id}`,
        metadata: {
          referrer_id: establishments.referred_by_user_id,
          establishment_id: establishments.id,
          invoice_id: invoice.id,
        },
      });

      logStep("Transfer created", { transferId: transfer.id });

      // Registrar comissão no banco
      await supabaseClient
        .from('referrals')
        .insert({
          referrer_id: establishments.referred_by_user_id,
          establishment_id: establishments.id,
          commission_amount: commissionAmount / 100, // Converter de centavos
          status: 'paid',
          stripe_transfer_id: transfer.id,
        });

      // Atualizar status do plano
      await supabaseClient
        .from('estabelecimentos')
        .update({ plan_status: 'active' })
        .eq('id', establishments.id);

      logStep("Commission recorded successfully");
    }

    // Processar conclusão de onboarding
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      
      if (account.charges_enabled && account.payouts_enabled) {
        logStep("Account onboarding completed", { accountId: account.id });
        
        await supabaseClient
          .from('profiles')
          .update({ stripe_onboarding_completed: true })
          .eq('stripe_account_id', account.id);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
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
        status: 400,
      }
    );
  }
});
