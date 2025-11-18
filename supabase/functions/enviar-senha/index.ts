import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecuperarSenhaRequest {
  email: string;
  tipo: "aniversariante" | "estabelecimento";
  senha: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, tipo, senha }: RecuperarSenhaRequest = await req.json();

    console.log(`Recuperação de senha solicitada para: ${email}, tipo: ${tipo}`);

    const emailResponse = await resend.emails.send({
      from: "Aniversariantes <onboarding@resend.dev>",
      to: [email],
      subject: "Recuperação de Senha - Aniversariantes",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #333; margin-bottom: 20px;">🎂 Recuperação de Senha</h1>
            <p style="color: #555; font-size: 16px;">Olá!</p>
            <p style="color: #555; font-size: 16px;">Você solicitou a recuperação de senha para sua conta de <strong>${tipo}</strong>.</p>
            
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">Sua senha é:</p>
              <p style="color: #333; font-size: 20px; font-weight: bold; margin: 0; font-family: monospace;">${senha}</p>
            </div>

            <p style="color: #555; font-size: 16px;">Use esta senha para fazer login na plataforma.</p>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
              Se você não solicitou essa recuperação, por favor ignore este email e considere alterar sua senha.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
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
