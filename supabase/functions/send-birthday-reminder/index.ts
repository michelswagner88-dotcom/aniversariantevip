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

const siteUrl = "https://aniversariantevip.com.br";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🤖 Robô de Aniversário iniciado às", new Date().toISOString());
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date();
    
    // Data 7 dias no futuro
    const sevenDaysAhead = new Date(today);
    sevenDaysAhead.setDate(today.getDate() + 7);
    
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const futureMonth = sevenDaysAhead.getMonth() + 1;
    const futureDay = sevenDaysAhead.getDate();
    
    console.log(`📅 Verificando: Hoje ${todayDay}/${todayMonth} | 7 dias: ${futureDay}/${futureMonth}`);
    
    // Buscar todos os aniversariantes
    const { data: aniversariantes, error: anivError } = await supabase
      .from('aniversariantes')
      .select('id, data_nascimento')
      .is('deleted_at', null);
    
    if (anivError) {
      console.error("❌ Erro ao buscar aniversariantes:", anivError);
      throw anivError;
    }
    
    if (!aniversariantes || aniversariantes.length === 0) {
      console.log("⚠️ Nenhum aniversariante cadastrado");
      return new Response(JSON.stringify({ message: "Nenhum aniversariante encontrado" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Separar: aniversariantes de HOJE e de 7 DIAS
    const birthdayToday = aniversariantes.filter(aniv => {
      const birthDate = new Date(aniv.data_nascimento);
      return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
    });
    
    const birthdayIn7Days = aniversariantes.filter(aniv => {
      const birthDate = new Date(aniv.data_nascimento);
      return birthDate.getMonth() + 1 === futureMonth && birthDate.getDate() === futureDay;
    });
    
    console.log(`🎂 Hoje: ${birthdayToday.length} | 📆 Em 7 dias: ${birthdayIn7Days.length}`);
    
    const results = [];
    
    // ===== ENVIAR E-MAILS PARA QUEM FAZ ANIVERSÁRIO HOJE =====
    if (birthdayToday.length > 0) {
      const userIds = birthdayToday.map(a => a.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, nome')
        .in('id', userIds);
      
      for (const profile of profiles || []) {
        const userName = profile.nome || profile.email.split('@')[0];
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #020617;">
              
              <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f472b6 100%); padding: 60px 30px; text-align: center; border-radius: 16px 16px 0 0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -120px; right: -120px; width: 350px; height: 350px; background: rgba(255,255,255,0.15); border-radius: 50%; filter: blur(80px);"></div>
                <div style="position: absolute; bottom: -100px; left: -100px; width: 300px; height: 300px; background: rgba(255,255,255,0.15); border-radius: 50%; filter: blur(80px);"></div>
                
                <div style="font-size: 80px; margin-bottom: 20px; position: relative; z-index: 1; animation: bounce 1s infinite;">🎉🎂🎁</div>
                <h1 style="color: white; margin: 0; font-size: 42px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; position: relative; z-index: 1; text-shadow: 0 6px 20px rgba(0,0,0,0.4); line-height: 1.2;">
                  HOJE É O SEU DIA!<br>PARABÉNS VIP! 🌟
                </h1>
                <p style="color: rgba(255,255,255,0.95); margin: 20px 0 0 0; font-size: 20px; position: relative; z-index: 1; font-weight: 600;">
                  Chegou a hora de brilhar e aproveitar! ✨
                </p>
              </div>
              
              <div style="background: linear-gradient(to bottom, #1e293b, #0f172a); padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                
                <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center;">
                  <p style="font-size: 24px; color: #f472b6; margin: 0 0 15px 0; font-weight: 800;">
                    Parabéns, ${userName}! 🎊
                  </p>
                  <p style="font-size: 17px; color: #cbd5e1; margin: 0; line-height: 1.8;">
                    Oiê! Sou a <strong style="color: #8b5cf6;">Carol</strong> e vim te dar os parabéns! 🥳<br>
                    Hoje é <strong style="color: #f472b6;">O SEU DIA</strong>! Seus benefícios estão liberados e os estabelecimentos estão te esperando de braços abertos!
                  </p>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%); border: 2px solid rgba(244, 114, 182, 0.4); padding: 30px; margin: 30px 0; border-radius: 16px; box-shadow: 0 0 60px rgba(236, 72, 153, 0.3); text-align: center;">
                  <div style="font-size: 56px; margin-bottom: 15px;">🎁</div>
                  <h3 style="margin: 0 0 20px 0; color: #f472b6; font-size: 24px; font-weight: 800;">Seus Presentes Te Aguardam!</h3>
                  <ul style="margin: 0; padding-left: 25px; color: #cbd5e1; line-height: 2; text-align: left; list-style: none;">
                    <li style="margin-bottom: 10px;">✅ Emita seus cupons agora mesmo</li>
                    <li style="margin-bottom: 10px;">✅ Escolha onde quer ir primeiro</li>
                    <li style="margin-bottom: 10px;">✅ Leve documento com foto</li>
                    <li style="margin-bottom: 10px;">✅ Aproveite SEM LIMITES! 🚀</li>
                  </ul>
                </div>
                
                <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 8px;">
                  <p style="margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.8;">
                    <strong style="color: #22c55e;">💚 Lembre-se:</strong><br>
                    Você pode emitir quantos cupons quiser, em quantos estabelecimentos diferentes você escolher! Não deixe passar essa chance de aproveitar ao máximo! O aniversariante nunca vai sozinho - leva a galera toda! 🎉
                  </p>
                </div>
                
                <p style="font-size: 17px; color: #cbd5e1; margin: 35px 0 30px 0; text-align: center; line-height: 1.8; font-weight: 600;">
                  Não deixe seus presentes esperando! Entre agora e comece a festa! 🥳🎈
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${siteUrl}" 
                     style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f472b6 100%); 
                            color: white; 
                            padding: 22px 60px; 
                            text-decoration: none; 
                            border-radius: 50px; 
                            font-weight: 800; 
                            font-size: 19px;
                            display: inline-block;
                            box-shadow: 0 10px 40px rgba(139, 92, 246, 0.6);
                            text-transform: uppercase;
                            letter-spacing: 2px;
                            border: 3px solid rgba(255,255,255,0.3);">
                    🎟️ RESGATAR MEUS PRESENTES
                  </a>
                </div>
                
                <p style="font-size: 16px; color: #94a3b8; text-align: center; margin: 40px 0 10px 0; line-height: 1.7; font-weight: 500;">
                  Aproveite cada momento deste dia incrível! Você merece! 💜✨<br>
                  <strong style="color: #8b5cf6;">Carol - Assistente Virtual</strong>
                </p>
                
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 35px 0;">
                
                <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} Aniversariante VIP
                </p>
              </div>
            </body>
          </html>
        `;
        
        try {
          const response = await resend.emails.send({
            from: "Carol - Aniversariante VIP <onboarding@resend.dev>",
            to: [profile.email],
            subject: "HOJE É O SEU DIA! Parabéns VIP 🎉🎁",
            html: emailHtml,
          });
          
          console.log(`✅ Email HOJE enviado para ${profile.email}`);
          results.push({ type: 'birthday', success: true, email: profile.email });
        } catch (error: any) {
          console.error(`❌ Erro ao enviar para ${profile.email}:`, error);
          results.push({ type: 'birthday', success: false, email: profile.email, error: error.message });
        }
      }
    }
    
    // ===== ENVIAR E-MAILS PARA QUEM FAZ ANIVERSÁRIO EM 7 DIAS =====
    if (birthdayIn7Days.length > 0) {
      const userIds = birthdayIn7Days.map(a => a.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, nome')
        .in('id', userIds);
      
      for (const profile of profiles || []) {
        const userName = profile.nome || profile.email.split('@')[0];
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #020617;">
              
              <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 50px 30px; text-align: center; border-radius: 16px 16px 0 0; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px);"></div>
                
                <div style="font-size: 72px; margin-bottom: 15px; position: relative; z-index: 1;">⏰🎂</div>
                <h1 style="color: white; margin: 0; font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; position: relative; z-index: 1; text-shadow: 0 4px 16px rgba(0,0,0,0.3);">
                  FALTA 1 SEMANA! 📆
                </h1>
                <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 19px; position: relative; z-index: 1; font-weight: 600;">
                  Já escolheu onde vai comemorar? 🎉
                </p>
              </div>
              
              <div style="background: linear-gradient(to bottom, #1e293b, #0f172a); padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                  <p style="font-size: 17px; color: #cbd5e1; margin: 0; line-height: 1.8;">
                    Oiê, <strong style="color: #a855f7;">${userName}</strong>! 👋<br><br>
                    Sou a <strong style="color: #8b5cf6;">Carol</strong>, aqui do Aniversariante VIP! A contagem regressiva começou! ⏳
                  </p>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%); border: 2px solid rgba(139, 92, 246, 0.4); padding: 30px; margin: 30px 0; border-radius: 16px; text-align: center; box-shadow: 0 0 40px rgba(99, 102, 241, 0.2);">
                  <div style="font-size: 64px; margin-bottom: 20px;">🎊</div>
                  <h2 style="margin: 0 0 15px 0; color: #a855f7; font-size: 28px; font-weight: 800;">
                    Daqui a 7 dias é seu dia!
                  </h2>
                  <p style="margin: 0; font-size: 17px; color: #cbd5e1; line-height: 1.8;">
                    Que tal já <strong style="color: #a855f7;">garantir sua reserva</strong> e escolher seus presentes? Entre no site agora e veja o que te espera! ✨
                  </p>
                </div>
                
                <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8b5cf6; padding: 25px; margin: 30px 0; border-radius: 8px;">
                  <h3 style="margin: 0 0 20px 0; color: #a855f7; font-size: 20px; font-weight: 700;">💡 Dicas para se preparar:</h3>
                  <ul style="margin: 0; padding-left: 25px; color: #cbd5e1; line-height: 2;">
                    <li>Navegue pelos estabelecimentos disponíveis</li>
                    <li><strong style="color: #a855f7;">Salve seus favoritos</strong> para facilitar no dia</li>
                    <li>Confira horários e regras de cada benefício</li>
                    <li>Chame a galera - o aniversariante nunca vai sozinho! 🎉</li>
                    <li>Separe um documento com foto para apresentar</li>
                  </ul>
                </div>
                
                <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 8px;">
                  <p style="margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.8;">
                    <strong style="color: #22c55e;">💚 Lembre-se:</strong><br>
                    Aqui a comemoração dura muito mais! Temos benefícios para usar no dia exato, na semana do aniversário ou até durante o mês inteiro! É o seu passaporte para estender a festa! 🚀
                  </p>
                </div>
                
                <p style="font-size: 17px; color: #cbd5e1; margin: 35px 0 30px 0; text-align: center; line-height: 1.8;">
                  Não deixe para a última hora! Já pode começar a planejar sua comemoração perfeita! 🥳
                </p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${siteUrl}" 
                     style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); 
                            color: white; 
                            padding: 20px 55px; 
                            text-decoration: none; 
                            border-radius: 50px; 
                            font-weight: 700; 
                            font-size: 18px;
                            display: inline-block;
                            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.5);
                            text-transform: uppercase;
                            letter-spacing: 1.5px;
                            border: 2px solid rgba(255,255,255,0.2);">
                    🎯 ESCOLHER MEUS BENEFÍCIOS
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #94a3b8; text-align: center; margin: 35px 0 10px 0; line-height: 1.6;">
                  Estou aqui para qualquer dúvida! Deixa comigo! 💜<br>
                  <strong style="color: #8b5cf6;">Carol - Assistente Virtual</strong>
                </p>
                
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 35px 0;">
                
                <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} Aniversariante VIP
                </p>
              </div>
            </body>
          </html>
        `;
        
        try {
          const response = await resend.emails.send({
            from: "Carol - Aniversariante VIP <onboarding@resend.dev>",
            to: [profile.email],
            subject: "Falta 1 semana! Já escolheu onde vai comemorar? 🎂",
            html: emailHtml,
          });
          
          console.log(`✅ Email 7 DIAS enviado para ${profile.email}`);
          results.push({ type: 'reminder', success: true, email: profile.email });
        } catch (error: any) {
          console.error(`❌ Erro ao enviar para ${profile.email}:`, error);
          results.push({ type: 'reminder', success: false, email: profile.email, error: error.message });
        }
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`🎉 Robô concluído: ${successCount}/${results.length} emails enviados`);
    
    return new Response(JSON.stringify({ 
      message: "Robô de Aniversário executado com sucesso",
      birthdayToday: birthdayToday.length,
      birthdayIn7Days: birthdayIn7Days.length,
      total: results.length,
      success: successCount,
      results 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error: any) {
    console.error("❌ Erro no Robô de Aniversário:", error);
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
