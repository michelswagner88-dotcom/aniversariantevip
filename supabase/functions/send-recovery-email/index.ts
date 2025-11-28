import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { checkRateLimit, getRequestIdentifier, rateLimitExceededResponse } from "../_shared/rateLimit.ts";
import { validarOrigem, getCorsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar origem (para invocações diretas do Supabase Auth, permitir sem origin)
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #020617;">
          
          <!-- Header com gradiente Cosmic Celebration -->
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f472b6 100%); padding: 50px 30px; text-align: center; border-radius: 16px 16px 0 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px);"></div>
            <div style="position: absolute; bottom: -80px; left: -80px; width: 250px; height: 250px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px);"></div>
            
            <div style="font-size: 64px; margin-bottom: 15px; position: relative; z-index: 1;">🔐</div>
            <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1; text-shadow: 0 4px 12px rgba(0,0,0,0.3);">
              REDEFINIR SENHA
            </h1>
            <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; position: relative; z-index: 1; font-weight: 500;">
              Aniversariante VIP - Recuperação de Acesso
            </p>
          </div>
          
          <!-- Corpo do email -->
          <div style="background: linear-gradient(to bottom, #1e293b, #0f172a); padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
            
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <p style="font-size: 16px; color: #e2e8f0; margin: 0; line-height: 1.8;">
                Oiê! 👋
              </p>
              <p style="font-size: 16px; color: #cbd5e1; margin: 15px 0 0 0; line-height: 1.8;">
                Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color: #f472b6;">Aniversariante VIP</strong>.
              </p>
            </div>
            
            <p style="font-size: 16px; color: #cbd5e1; margin: 25px 0; line-height: 1.8; text-align: center;">
              Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <!-- Botão de ação -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
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
                🔑 REDEFINIR MINHA SENHA
              </a>
            </div>
            
            <!-- Aviso importante -->
            <div style="background: rgba(251, 191, 36, 0.1); border-left: 4px solid #fbbf24; padding: 20px; margin: 30px 0; border-radius: 8px;">
              <p style="margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.8;">
                <strong style="color: #fbbf24;">⏰ Importante:</strong><br>
                Este link é válido por <strong style="color: #fbbf24;">1 hora</strong> por motivos de segurança. Se você não solicitou esta redefinição, pode ignorar este email com segurança.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #94a3b8; text-align: center; margin: 35px 0 10px 0; line-height: 1.6;">
              Qualquer dúvida, estamos aqui para ajudar! 💜<br>
              <strong style="color: #8b5cf6;">Carol - Assistente Virtual</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 35px 0;">
            
            <p style="font-size: 12px; color: #64748b; text-align: center; margin: 20px 0 0 0;">
              © ${new Date().getFullYear()} Aniversariante VIP. Todos os direitos reservados.
            </p>
            
            <p style="font-size: 11px; color: #475569; text-align: center; margin-top: 10px; line-height: 1.5;">
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
