import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  nome: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome }: WelcomeEmailRequest = await req.json();
    console.log("Enviando email de boas-vindas para:", email);

    const userName = nome || email.split('@')[0];
    const siteUrl = "https://aniversariantevip.com.br";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    
    // Buscar user_id pelo email
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    // Criar registro de analytics
    const { data: analyticsRecord, error: analyticsError } = await supabase
      .from('email_analytics')
      .insert({
        user_id: profileData?.id,
        email_type: 'welcome',
        email_address: email,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (analyticsError) {
      console.error('Erro ao criar analytics:', analyticsError);
    }
    
    const trackingId = analyticsRecord?.id || 'unknown';
    const trackingPixelUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/track-email-open?id=${trackingId}`;
    const trackingClickUrl = (url: string) => `${Deno.env.get("SUPABASE_URL")}/functions/v1/track-email-click?id=${trackingId}&url=${encodeURIComponent(url)}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao Aniversariante VIP</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #020617;">
          <!-- Header com gradiente Cosmic -->
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f472b6 100%); padding: 50px 30px; text-align: center; border-radius: 16px 16px 0 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px);"></div>
            <div style="position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px);"></div>
            
            <div style="font-size: 64px; margin-bottom: 15px; position: relative; z-index: 1;">🎉</div>
            <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1; text-shadow: 0 4px 12px rgba(0,0,0,0.3);">
              BEM-VINDO AO CLUBE VIP
            </h1>
            <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; position: relative; z-index: 1; font-weight: 500;">
              Seu passaporte para benefícios exclusivos ✨
            </p>
          </div>
          
          <!-- Corpo do email -->
          <div style="background: linear-gradient(to bottom, #1e293b, #0f172a); padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
            
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <p style="font-size: 16px; color: #e2e8f0; margin: 0; line-height: 1.8;">
                Oiê, <strong style="color: #f472b6;">${userName}</strong>! 👋
              </p>
              <p style="font-size: 16px; color: #cbd5e1; margin: 15px 0 0 0; line-height: 1.8;">
                Sou a <strong style="color: #8b5cf6;">Carol</strong>, aqui do time do Aniversariante VIP! 
                Que bênção ter você com a gente! Você acabou de entrar no <strong>maior e mais completo guia de benefícios de aniversário do Brasil</strong>! 🎂✨
              </p>
            </div>
            
            <!-- Card de benefícios -->
            <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%); border: 1px solid rgba(139, 92, 246, 0.3); padding: 25px; margin: 30px 0; border-radius: 12px; box-shadow: 0 0 40px rgba(139, 92, 246, 0.2);">
              <h3 style="margin: 0 0 20px 0; color: #f472b6; font-size: 20px; font-weight: 700;">🎁 O que te espera aqui:</h3>
              <ul style="margin: 0; padding-left: 25px; color: #cbd5e1; line-height: 2;">
                <li><strong style="color: #f472b6;">Centenas de estabelecimentos parceiros</strong> em todo o Brasil</li>
                <li><strong style="color: #f472b6;">Benefícios exclusivos</strong> que duram o dia, a semana ou o mês inteiro!</li>
                <li>Tudo <strong style="color: #f472b6;">100% gratuito</strong> para você, aniversariante</li>
                <li><strong style="color: #f472b6;">Cupons digitais</strong> super fáceis de usar</li>
                <li>Notificações de <strong style="color: #f472b6;">novos parceiros</strong> na sua região</li>
              </ul>
            </div>
            
            <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 8px;">
              <p style="margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.8;">
                <strong style="color: #22c55e;">💚 Dica da Carol:</strong><br>
                Aqui a comemoração dura muito mais! Temos benefícios para usar no dia exato, na semana do aniversário ou até durante o mês inteiro, dependendo do estabelecimento. É o seu passaporte para estender a festa! 🥳
              </p>
            </div>
            
            <p style="font-size: 16px; color: #cbd5e1; margin: 35px 0 25px 0; text-align: center; line-height: 1.8;">
              Já pode começar a explorar os benefícios e escolher seus favoritos! 
              O aniversariante nunca vai sozinho, ele leva a galera toda! 🎉
            </p>
            
            <!-- Botão de ação -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${trackingClickUrl(siteUrl)}" 
                 style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f472b6 100%); 
                        color: white; 
                        padding: 18px 50px; 
                        text-decoration: none; 
                        border-radius: 50px; 
                        font-weight: 700; 
                        font-size: 17px;
                        display: inline-block;
                        box-shadow: 0 8px 32px rgba(139, 92, 246, 0.5);
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        border: 2px solid rgba(255,255,255,0.2);">
                🎯 ACESSAR O SITE AGORA
              </a>
            </div>
            
            <p style="font-size: 14px; color: #94a3b8; text-align: center; margin: 35px 0 10px 0; line-height: 1.6;">
              Qualquer dúvida, é só chamar! Estou aqui para te ajudar! 💜<br>
              <strong style="color: #8b5cf6;">Carol - Assistente Virtual</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 35px 0;">
            
            <p style="font-size: 12px; color: #64748b; text-align: center; margin: 20px 0 0 0;">
              © ${new Date().getFullYear()} Aniversariante VIP. Todos os direitos reservados.
            </p>
            
            <p style="font-size: 11px; color: #475569; text-align: center; margin-top: 10px; line-height: 1.5;">
              Você está recebendo este email porque se cadastrou em nosso site.<br>
              Este é um email automático, por favor não responda.
            </p>
          </div>
          <!-- Tracking Pixel -->
          <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block; border:0; opacity:0; position:absolute;" />
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Carol - Aniversariante VIP <onboarding@resend.dev>",
      to: [email],
      subject: "Bem-vindo ao Clube VIP! 🌟 Seu passaporte de benefícios",
      html: emailHtml,
    });

    console.log("Email de boas-vindas enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de boas-vindas:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
