import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      nome?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: WelcomeEmailPayload = await req.json();
    console.log("Recebido payload de boas-vindas:", { email: payload.user.email });

    const { user, email_data } = payload;
    const userName = user.user_metadata?.nome || user.email.split('@')[0];
    const confirmUrl = `${email_data.site_url}/auth/confirm?token_hash=${email_data.token_hash}&type=email`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao Aniversariante VIP</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <!-- Header com gradiente dourado -->
          <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; position: relative; z-index: 1;">ANIVERSARIANTE VIP</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px; position: relative; z-index: 1;">A maior plataforma de benefícios de aniversário</p>
          </div>
          
          <!-- Corpo do email -->
          <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h2 style="color: #333; margin-top: 0; font-size: 28px; text-align: center;">🎉 Bem-vindo(a)!</h2>
            
            <p style="font-size: 18px; color: #555; margin: 25px 0; text-align: center;">
              Olá, <strong style="color: #FFD700;">${userName}</strong>!
            </p>
            
            <p style="font-size: 16px; color: #555; margin: 20px 0; text-align: center;">
              Você está a um passo de aproveitar <strong>benefícios exclusivos</strong> no seu aniversário!
            </p>
            
            <!-- Card de benefícios -->
            <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%); border-left: 4px solid #FFD700; padding: 20px; margin: 30px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(255,215,0,0.2);">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">✨ O que você vai ganhar:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
                <li>Acesso a <strong>centenas de estabelecimentos parceiros</strong></li>
                <li><strong>Descontos e brindes exclusivos</strong> no mês do seu aniversário</li>
                <li>Cupons digitais <strong>fáceis de usar</strong></li>
                <li>Notificações de <strong>novos parceiros</strong> na sua região</li>
                <li>Plataforma <strong>100% gratuita</strong> para aniversariantes</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; color: #555; margin: 30px 0 20px 0; text-align: center;">
              Confirme seu email para começar:
            </p>
            
            <!-- Botão de confirmação -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${confirmUrl}" 
                 style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); 
                        color: white; 
                        padding: 18px 50px; 
                        text-decoration: none; 
                        border-radius: 50px; 
                        font-weight: bold; 
                        font-size: 18px;
                        display: inline-block;
                        box-shadow: 0 6px 20px rgba(255,165,0,0.4);
                        transition: transform 0.2s;
                        text-transform: uppercase;
                        letter-spacing: 1px;">
                ✓ Confirmar Meu Email
              </a>
            </div>
            
            <!-- Informações adicionais -->
            <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #333; font-weight: bold;">
                🎂 Dica importante:
              </p>
              <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                Não esqueça de atualizar seu perfil com sua <strong>data de aniversário</strong> para não perder nenhum benefício especial!
              </p>
            </div>
            
            <p style="font-size: 14px; color: #777; margin-top: 30px; text-align: center;">
              Precisa de ajuda? Acesse nossa <a href="${email_data.site_url}/faq" style="color: #FFD700; text-decoration: none; font-weight: bold;">Central de Ajuda</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <!-- Redes sociais (se houver) -->
            <div style="text-align: center; margin: 20px 0;">
              <p style="font-size: 14px; color: #999; margin-bottom: 15px;">Siga-nos nas redes sociais:</p>
              <div style="display: inline-block;">
                <!-- Adicione links das redes sociais aqui quando disponíveis -->
              </div>
            </div>
            
            <!-- Footer -->
            <p style="font-size: 12px; color: #999; text-align: center; margin: 20px 0 0 0;">
              © ${new Date().getFullYear()} Aniversariante VIP. Todos os direitos reservados.
            </p>
            
            <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 10px; line-height: 1.5;">
              Este é um email automático, por favor não responda.<br>
              Você está recebendo este email porque se cadastrou em nosso site.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Aniversariante VIP <onboarding@resend.dev>",
      to: [user.email],
      subject: "🎉 Bem-vindo ao Aniversariante VIP!",
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
