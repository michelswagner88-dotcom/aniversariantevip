import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { CupomAniversario } from "@/components/CupomAniversario";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { useConfetti } from "@/hooks/useConfetti";

interface CupomData {
  codigo: string;
  data_emissao: string;
  data_validade: string;
  estabelecimento: {
    nome_fantasia: string;
    logo_url: string | null;
    descricao_beneficio: string;
    regras_utilizacao: string | null;
    periodo_validade_beneficio: string;
  };
  aniversariante: {
    nome: string;
    data_nascimento: string;
  };
}

const EmitirCupom = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cupomData, setCupomData] = useState<CupomData | null>(null);
  const { isActive: confettiActive, fireConfetti } = useConfetti();
  const estabelecimentoId = searchParams.get("estabelecimento");

  useEffect(() => {
    emitirCupom();
  }, [estabelecimentoId]);

  const emitirCupom = async () => {
    try {
      setLoading(true);

      if (!estabelecimentoId) {
        toast({
          title: "Erro",
          description: "Estabelecimento não encontrado",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para emitir cupons",
          variant: "destructive",
        });
        navigate("/login/aniversariante");
        return;
      }

      // Buscar dados do aniversariante
      const { data: aniversarianteData, error: anivError } = await supabase
        .from("aniversariantes")
        .select("data_nascimento")
        .eq("id", user.id)
        .single();

      if (anivError || !aniversarianteData) {
        toast({
          title: "Erro",
          description: "Dados do aniversariante não encontrados",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Buscar dados do perfil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", user.id)
        .single();

      // Buscar dados do estabelecimento
      const { data: estabelecimentoData, error: estabError } = await supabase
        .from("estabelecimentos")
        .select("nome_fantasia, logo_url, descricao_beneficio, regras_utilizacao, periodo_validade_beneficio")
        .eq("id", estabelecimentoId)
        .single();

      if (estabError || !estabelecimentoData) {
        toast({
          title: "Erro",
          description: "Estabelecimento não encontrado",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Chamar edge function para emitir cupom
      const { data: cupomResponse, error: cupomError } = await supabase.functions.invoke(
        "emit-coupon",
        {
          body: { estabelecimento_id: estabelecimentoId },
        }
      );

      if (cupomError || !cupomResponse) {
        toast({
          title: "Erro ao emitir cupom",
          description: cupomError?.message || "Não foi possível gerar o cupom",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Montar dados do cupom
      setCupomData({
        codigo: cupomResponse.codigo,
        data_emissao: cupomResponse.data_emissao,
        data_validade: cupomResponse.data_validade,
        estabelecimento: {
          nome_fantasia: estabelecimentoData.nome_fantasia || "",
          logo_url: estabelecimentoData.logo_url,
          descricao_beneficio: estabelecimentoData.descricao_beneficio || "",
          regras_utilizacao: estabelecimentoData.regras_utilizacao,
          periodo_validade_beneficio: estabelecimentoData.periodo_validade_beneficio || "mes_aniversario",
        },
        aniversariante: {
          nome: profileData?.nome || "",
          data_nascimento: aniversarianteData.data_nascimento,
        },
      });

      // Disparar confetti
      fireConfetti();

      toast({
        title: "Cupom Emitido!",
        description: "Seu cupom foi gerado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao emitir cupom:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao emitir o cupom",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Gerando seu cupom...</p>
        </div>
      </div>
    );
  }

  if (!cupomData) {
    return null;
  }

  return (
    <>
      <ConfettiCelebration isActive={confettiActive} />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <CupomAniversario
            estabelecimentoNome={cupomData.estabelecimento.nome_fantasia}
            estabelecimentoLogo={cupomData.estabelecimento.logo_url || undefined}
            aniversarianteNome={cupomData.aniversariante.nome}
            dataNascimento={cupomData.aniversariante.data_nascimento}
            descricaoBeneficio={cupomData.estabelecimento.descricao_beneficio}
            regrasUtilizacao={cupomData.estabelecimento.regras_utilizacao || undefined}
            codigoCupom={cupomData.codigo}
            dataEmissao={cupomData.data_emissao}
            periodoValidade={cupomData.estabelecimento.periodo_validade_beneficio}
          />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EmitirCupom;
