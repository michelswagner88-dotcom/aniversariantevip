import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { limit = 10, dryRun = false } = await req.json().catch(() => ({}));

    console.log(`[migrate-google-photos] Iniciando (limit: ${limit}, dryRun: ${dryRun})`);

    // Buscar estabelecimentos com backup de URL do Google que ainda não foram migrados
    const { data: estabelecimentos, error: fetchError } = await supabase
      .from("estabelecimentos")
      .select("id, nome_fantasia, logo_url_backup")
      .like("logo_url_backup", "%googleapis.com%")
      .eq("foto_migrada", false)
      .limit(limit);

    if (fetchError) throw new Error(`Erro ao buscar: ${fetchError.message}`);

    if (!estabelecimentos || estabelecimentos.length === 0) {
      // Contar quantos já foram migrados
      const { count: totalMigrated } = await supabase
        .from("estabelecimentos")
        .select("id", { count: "exact", head: true })
        .eq("foto_migrada", true);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Nenhum pendente para migração", 
          migrated: 0, 
          remaining: 0,
          totalMigrated: totalMigrated || 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📦 Processando ${estabelecimentos.length} estabelecimentos...`);

    const results = { 
      success: [] as string[], 
      failed: [] as { id: string; nome: string; error: string }[] 
    };

    for (const est of estabelecimentos) {
      try {
        console.log(`\n🏢 ${est.nome_fantasia}`);

        if (dryRun) {
          console.log("   [DRY RUN] Seria migrado");
          results.success.push(est.id);
          continue;
        }

        // Baixar imagem do Google (ÚLTIMA VEZ)
        console.log("   📥 Baixando imagem do Google...");
        const response = await fetch(est.logo_url_backup);
        
        if (!response.ok) {
          throw new Error(`Download falhou: ${response.status} ${response.statusText}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/jpeg";
        
        // Determinar extensão
        let extension = "jpg";
        if (contentType.includes("png")) extension = "png";
        if (contentType.includes("webp")) extension = "webp";

        const fileName = `establishments/${est.id}/photo.${extension}`;

        // Upload para Supabase Storage
        console.log("   📤 Fazendo upload para Supabase Storage...");
        const { error: uploadError } = await supabase.storage
          .from("establishment-photos")
          .upload(fileName, imageBuffer, { 
            contentType, 
            upsert: true 
          });

        if (uploadError) {
          throw new Error(`Upload falhou: ${uploadError.message}`);
        }

        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from("establishment-photos")
          .getPublicUrl(fileName);

        // Atualizar estabelecimento com nova URL do Supabase Storage
        const { error: updateError } = await supabase
          .from("estabelecimentos")
          .update({ 
            logo_url: publicUrlData.publicUrl,
            foto_migrada: true,
            foto_migrada_em: new Date().toISOString(),
          })
          .eq("id", est.id);

        if (updateError) {
          throw new Error(`Update falhou: ${updateError.message}`);
        }

        console.log(`   ✅ Migrado com sucesso!`);
        results.success.push(est.id);

        // Pequeno delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        console.error(`   ❌ Erro: ${errorMessage}`);
        results.failed.push({ 
          id: est.id, 
          nome: est.nome_fantasia || "Sem nome",
          error: errorMessage 
        });

        // Marcar como migrado mesmo com erro para não ficar em loop
        await supabase
          .from("estabelecimentos")
          .update({ 
            foto_migrada: true,
            foto_migrada_em: new Date().toISOString(),
          })
          .eq("id", est.id);
      }
    }

    // Contar quantos ainda faltam
    const { count: remaining } = await supabase
      .from("estabelecimentos")
      .select("id", { count: "exact", head: true })
      .like("logo_url_backup", "%googleapis.com%")
      .eq("foto_migrada", false);

    console.log(`\n📊 Resumo: ${results.success.length} migrados, ${results.failed.length} erros, ${remaining || 0} restantes`);

    return new Response(
      JSON.stringify({
        success: true,
        migrated: results.success.length,
        failed: results.failed.length,
        remaining: remaining || 0,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[migrate-google-photos] Erro geral:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
