import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { checkRateLimit, getRequestIdentifier, rateLimitExceededResponse } from "../_shared/rateLimit.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryEmailPayload {
  user: {
    id: string;
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Rate limiting: 5 requisições por 15 minutos por IP
  const identifier = getRequestIdentifier(req);
  const { allowed, remaining } = await checkRateLimit(
    supabaseUrl,
    supabaseServiceKey,
    identifier,
    { limit: 5, windowMinutes: 15, keyPrefix: "recovery" }
  );

  if (!allowed) {
    return rateLimitExceededResponse(remaining);
  }

  try {
    const payload: RecoveryEmailPayload = await req.json();
    console.log("Recebido payload de recuperação:", { email: payload.user.email });

    const { user, email_data } = payload;
    const resetUrl = `${email_data.redirect_to}#access_token=${email_data.token}&type=recovery`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha - Aniversariante VIP</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">ANIVERSARIANTE VIP</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">Redefinição de Senha</h2>
            
            <p style="font-size: 16px; color: #555; margin: 20px 0;">
              Olá,
            </p>
            
            <p style="font-size: 16px; color: #555; margin: 20px 0;">
              Você solicitou a redefinição de sua senha na plataforma <strong>Aniversariante VIP</strong>.
            </p>
            
            <p style="font-size: 16px; color: #555; margin: 20px 0;">
              Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); 
                        color: white; 
                        padding: 16px 48px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        transition: transform 0.2s;">
                Redefinir Minha Senha
              </a>
            </div>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #FFD700; padding: 15px; margin: 30px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>⏰ Importante:</strong> Este link é válido por <strong>1 hora</strong> por motivos de segurança.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #777; margin-top: 30px;">
              Se você não solicitou esta redefinição, pode ignorar este email com segurança. Sua senha permanecerá inalterada.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Aniversariante VIP. Todos os direitos reservados.
            </p>
            
            <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 10px;">
              Este é um email automático, por favor não responda.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Aniversariante VIP <onboarding@resend.dev>",
      to: [user.email],
      subject: "Redefinição de Senha - Aniversariante VIP",
      html: emailHtml,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
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
