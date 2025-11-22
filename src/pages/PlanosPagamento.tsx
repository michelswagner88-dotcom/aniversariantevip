import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const CATEGORIAS_PREMIUM = ["Bar", "Restaurante", "Balada"];

const PREMIUM_PLANS = {
  monthly: {
    name: "Mensal",
    price: "R$ 29,90",
    period: "/mês",
    subscriptionPriceId: "price_premium_monthly",
    oneTimePriceId: "price_premium_monthly_onetime",
    totalValue: "R$ 29,90",
    commitment: "1 mês",
    savings: null,
    popular: false,
  },
  quarterly: {
    name: "Trimestral",
    price: "R$ 26,63",
    period: "/mês",
    subscriptionPriceId: "price_premium_quarterly",
    oneTimePriceId: "price_premium_quarterly_onetime",
    totalValue: "R$ 79,90",
    commitment: "3 meses",
    savings: "Economize 11%",
    popular: true,
  },
  semester: {
    name: "Semestral",
    price: "R$ 24,98",
    period: "/mês",
    subscriptionPriceId: "price_premium_semester",
    oneTimePriceId: "price_premium_semester_onetime",
    totalValue: "R$ 149,90",
    commitment: "6 meses",
    savings: "Economize 16%",
    popular: false,
  },
  annual: {
    name: "Anual",
    price: "R$ 22,90",
    period: "/mês",
    subscriptionPriceId: "price_premium_annual",
    oneTimePriceId: "price_premium_annual_onetime",
    totalValue: "R$ 274,90",
    commitment: "12 meses",
    savings: "Economize 23%",
    popular: false,
  },
};

const STANDARD_PLANS = {
  monthly: {
    name: "Mensal",
    price: "R$ 19,90",
    period: "/mês",
    subscriptionPriceId: "price_standard_monthly",
    oneTimePriceId: "price_standard_monthly_onetime",
    totalValue: "R$ 19,90",
    commitment: "1 mês",
    savings: null,
    popular: false,
  },
  quarterly: {
    name: "Trimestral",
    price: "R$ 16,63",
    period: "/mês",
    subscriptionPriceId: "price_standard_quarterly",
    oneTimePriceId: "price_standard_quarterly_onetime",
    totalValue: "R$ 49,90",
    commitment: "3 meses",
    savings: "Economize 16%",
    popular: true,
  },
  semester: {
    name: "Semestral",
    price: "R$ 14,98",
    period: "/mês",
    subscriptionPriceId: "price_standard_semester",
    oneTimePriceId: "price_standard_semester_onetime",
    totalValue: "R$ 89,90",
    commitment: "6 meses",
    savings: "Economize 25%",
    popular: false,
  },
  annual: {
    name: "Anual",
    price: "R$ 13,32",
    period: "/mês",
    subscriptionPriceId: "price_standard_annual",
    oneTimePriceId: "price_standard_annual_onetime",
    totalValue: "R$ 159,90",
    commitment: "12 meses",
    savings: "Economize 33%",
    popular: false,
  },
};

const FEATURES = [
  "Perfil completo no site",
  "Emissão ilimitada de cupons",
  "Estatísticas de uso",
  "Suporte prioritário",
  "Atualizações gratuitas",
];

export default function PlanosPagamento() {
  const [loading, setLoading] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoria = searchParams.get("categoria");

  useEffect(() => {
    if (!categoria) {
      navigate("/selecionar-categoria");
    }
  }, [categoria, navigate]);

  if (!categoria) {
    return null;
  }

  const isPremium = CATEGORIAS_PREMIUM.includes(categoria);
  const PLANS = isPremium ? PREMIUM_PLANS : STANDARD_PLANS;

  const handleSubscribe = async (priceId: string, planName: string, paymentType: 'subscription' | 'onetime') => {
    try {
      setLoading(priceId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Você precisa estar logado para assinar");
        navigate("/login-estabelecimento");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, paymentType },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success(`Redirecionando para checkout do plano ${planName}...`);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Erro ao criar checkout. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Planos para {categoria}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Selecione o plano ideal para o seu estabelecimento e comece a atrair mais clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Card 
                key={key} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-3xl font-bold text-foreground mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: {plan.totalValue} • Compromisso: {plan.commitment}
                  </p>
                  {plan.savings && (
                    <Badge variant="secondary" className="w-fit mt-2">
                      {plan.savings}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {FEATURES.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.subscriptionPriceId, plan.name, 'subscription')}
                      disabled={loading !== null}
                    >
                      {loading === plan.subscriptionPriceId ? "Processando..." : "Parcelar no Cartão"}
                    </Button>
                    
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => handleSubscribe(plan.oneTimePriceId, plan.name, 'onetime')}
                      disabled={loading !== null}
                    >
                      {loading === plan.oneTimePriceId ? "Processando..." : "PIX ou Boleto à Vista"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 text-sm text-muted-foreground">
            <p>Todos os planos incluem período de teste de 7 dias</p>
            <p>Cancele a qualquer momento</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
