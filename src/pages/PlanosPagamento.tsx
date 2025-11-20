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
    priceId: "price_1SVcAsAcRKjU8CGQeMIdjUdC",
    savings: null,
    popular: false,
  },
  quarterly: {
    name: "Trimestral",
    price: "R$ 129,00",
    period: "/trimestre",
    priceId: "price_1SVcB7AcRKjU8CGQjqMzv4fx",
    savings: "Economize 12%",
    popular: false,
  },
  semester: {
    name: "Semestral",
    price: "R$ 239,00",
    period: "/semestre",
    priceId: "price_1SVcBPAcRKjU8CGQbUILm2OU",
    savings: "Economize 19%",
    popular: false,
  },
  annual: {
    name: "Anual",
    price: "R$ 449,00",
    period: "/ano",
    priceId: "price_1SVcBhAcRKjU8CGQ9OBmBh9e",
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

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      setLoading(priceId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Você precisa estar logado para assinar");
        navigate("/login-estabelecimento");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
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
          <h1 className="text-4xl font-bold mb-4">Escolha seu Plano</h1>
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

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={loading !== null}
                >
                  {loading === plan.priceId ? "Processando..." : "Assinar Agora"}
                </Button>
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
