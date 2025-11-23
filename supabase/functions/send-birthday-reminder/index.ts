import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Iniciando envio de lembretes de aniversário...");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Buscar aniversariantes cujo aniversário está em 7 dias
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 7);
    
    const targetMonth = targetDate.getMonth() + 1; // getMonth() retorna 0-11
    const targetDay = targetDate.getDate();
    
    console.log(`Buscando aniversariantes para ${targetDay}/${targetMonth}`);
    
    // Buscar todos os aniversariantes
    const { data: aniversariantes, error: anivError } = await supabase
      .from('aniversariantes')
      .select('id, data_nascimento, telefone');
    
    if (anivError) {
      console.error("Erro ao buscar aniversariantes:", anivError);
      throw anivError;
    }
    
    if (!aniversariantes || aniversariantes.length === 0) {
      console.log("Nenhum aniversariante cadastrado");
      return new Response(JSON.stringify({ message: "Nenhum aniversariante encontrado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Filtrar aniversariantes cujo aniversário é daqui a 7 dias
    const birthdayMatches = aniversariantes.filter(aniv => {
      const birthDate = new Date(aniv.data_nascimento);
      const birthMonth = birthDate.getMonth() + 1;
      const birthDay = birthDate.getDate();
      return birthMonth === targetMonth && birthDay === targetDay;
    });
    
    console.log(`Encontrados ${birthdayMatches.length} aniversariantes com aniversário em 7 dias`);
    
    if (birthdayMatches.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum aniversário próximo encontrado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Buscar perfis dos aniversariantes
    const userIds = birthdayMatches.map(a => a.id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, nome')
      .in('id', userIds);
    
    if (profileError) {
      console.error("Erro ao buscar perfis:", profileError);
      throw profileError;
    }
    
    // Buscar estabelecimentos disponíveis
    const { data: estabelecimentos, error: estabError } = await supabase
      .from('estabelecimentos')
      .select('nome_fantasia, categoria')
      .limit(5);
    
    if (estabError) {
      console.error("Erro ao buscar estabelecimentos:", estabError);
    }
    
    const estabelecimentosCount = estabelecimentos?.length || 0;
    
    // Enviar emails
    const emailPromises = profiles?.map(async (profile) => {
      const anivData = birthdayMatches.find(a => a.id === profile.id);
      const birthDate = new Date(anivData!.data_nascimento);
      const age = today.getFullYear() - birthDate.getFullYear();
      const userName = profile.nome || profile.email.split('@')[0];
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Seu aniversário está chegando! 🎉</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <!-- Header festivo -->
            <div style="background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 50%, #6C5B7B 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; position: relative; overflow: hidden;">
              <div style="font-size: 48px; margin-bottom: 10px;">🎂✨🎉</div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">SEU ANIVERSÁRIO ESTÁ CHEGANDO!</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 16px;">Apenas 7 dias para o seu dia especial</p>
            </div>
            
            <!-- Corpo do email -->
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <p style="font-size: 18px; color: #555; margin: 0 0 20px 0; text-align: center;">
                Olá, <strong style="color: #FF6B9D;">${userName}</strong>! 🎈
              </p>
              
              <div style="background: linear-gradient(135deg, #fff0f5 0%, #ffe4e8 100%); padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center; border: 2px solid #FFB6C1;">
                <div style="font-size: 36px; margin-bottom: 10px;">🎂</div>
                <h2 style="margin: 0 0 10px 0; color: #C06C84; font-size: 24px;">
                  Faltam apenas 7 dias!
                </h2>
                <p style="margin: 0; font-size: 18px; color: #666;">
                  Prepare-se para aproveitar seus benefícios exclusivos
                </p>
              </div>
              
              <p style="font-size: 16px; color: #555; margin: 25px 0; line-height: 1.8;">
                Estamos contando os dias junto com você! No dia <strong>${targetDay}/${targetMonth}</strong>, 
                você terá acesso a <strong>benefícios exclusivos</strong> em mais de 
                <strong style="color: #FF6B9D;">${estabelecimentosCount}+ estabelecimentos parceiros</strong>.
              </p>
              
              <!-- Dicas importantes -->
              <div style="background-color: #fff9e6; border-left: 4px solid #FFD700; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">💡 Prepare-se para o seu dia:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
                  <li>Acesse a plataforma e veja todos os <strong>estabelecimentos disponíveis</strong></li>
                  <li>Escolha seus favoritos e <strong>salve-os</strong> para facilitar no dia</li>
                  <li>Verifique os <strong>horários de funcionamento</strong> e regras de utilização</li>
                  <li>Leve um <strong>documento com foto</strong> para comprovar sua data de nascimento</li>
                  <li>Aproveite ao máximo - você merece! 🎉</li>
                </ul>
              </div>
              
              <!-- Categorias disponíveis -->
              ${estabelecimentos && estabelecimentos.length > 0 ? `
              <div style="margin: 30px 0;">
                <h3 style="color: #333; font-size: 18px; margin-bottom: 15px; text-align: center;">
                  📍 Categorias disponíveis:
                </h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                  ${Array.from(new Set(estabelecimentos.flatMap(e => e.categoria || []))).slice(0, 6).map(cat => `
                    <span style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: bold; display: inline-block;">
                      ${cat}
                    </span>
                  `).join('')}
                </div>
              </div>
              ` : ''}
              
              <!-- Botão de ação -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${supabaseUrl.replace('.supabase.co', '')}.lovable.app" 
                   style="background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%); 
                          color: white; 
                          padding: 18px 40px; 
                          text-decoration: none; 
                          border-radius: 50px; 
                          font-weight: bold; 
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 6px 20px rgba(255,107,157,0.4);
                          text-transform: uppercase;
                          letter-spacing: 1px;">
                  🎁 Ver Meus Benefícios
                </a>
              </div>
              
              <p style="font-size: 14px; color: #777; text-align: center; margin: 30px 0 10px 0;">
                Nos vemos em breve para comemorar! 🥳
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} Aniversariante VIP. Todos os direitos reservados.
              </p>
              
              <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 10px;">
                Você está recebendo este email porque seu aniversário está próximo.
              </p>
            </div>
          </body>
        </html>
      `;
      
      try {
        const response = await resend.emails.send({
          from: "Aniversariante VIP <onboarding@resend.dev>",
          to: [profile.email],
          subject: "🎉 Seu aniversário está chegando! Prepare-se para seus benefícios",
          html: emailHtml,
        });
        
        console.log(`Email enviado para ${profile.email}:`, response);
        return { success: true, email: profile.email, response };
      } catch (error: any) {
        console.error(`Erro ao enviar email para ${profile.email}:`, error);
        return { success: false, email: profile.email, error: error.message };
      }
    }) || [];
    
    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`Processo concluído: ${successCount}/${results.length} emails enviados com sucesso`);
    
    return new Response(JSON.stringify({ 
      message: "Lembretes enviados",
      total: results.length,
      success: successCount,
      results 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    console.error("Erro ao processar lembretes:", error);
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
