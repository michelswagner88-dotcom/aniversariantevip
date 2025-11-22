import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PLANS = {
  monthly: {
    name: "Mensal",
    price: "R$ 49,00",
    period: "/mês",
    subscriptionPriceId: "price_1SVcAsAcRKjU8CGQeMIdjUdC",
    oneTimePriceId: "price_1SVe7TAcRKjU8CGQaRy3sobz",
    totalValue: "R$ 49,00",
    commitment: "1 mês",
    savings: null,
    popular: false,
  },
  quarterly: {
    name: "Trimestral",
    price: "R$ 43,00",
    period: "/mês",
    subscriptionPriceId: "price_1SVcR8AcRKjU8CGQGKl8Kda6",
    oneTimePriceId: "price_1SVe7yAcRKjU8CGQqXpLDknu",
    totalValue: "R$ 129,00",
    commitment: "3 meses",
    savings: "Economize 12%",
    popular: false,
  },
  semester: {
    name: "Semestral",
    price: "R$ 40,00",
    period: "/mês",
    subscriptionPriceId: "price_1SVcRIAcRKjU8CGQlSnekIxY",
    oneTimePriceId: "price_1SVeA4AcRKjU8CGQlslQYa9L",
    totalValue: "R$ 240,00",
    commitment: "6 meses",
    savings: "Economize 18%",
    popular: false,
  },
  annual: {
    name: "Anual",
    price: "R$ 37,42",
    period: "/mês",
    subscriptionPriceId: "price_1SVcRSAcRKjU8CGQZzNaPbcA",
    oneTimePriceId: "price_1SVeAEAcRKjU8CGQfXMeTVOj",
    totalValue: "R$ 449,00",
    commitment: "12 meses",
    savings: "Economize 24%",
    popular: true,
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
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha Seu Plano</h1>
          <p className="text-muted-foreground text-lg">
            Cadastre seu estabelecimento e comece a oferecer benefícios para aniversariantes
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
    </div>
  );
}
