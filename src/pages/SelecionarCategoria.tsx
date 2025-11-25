import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIAS_ESTABELECIMENTO } from "@/lib/constants";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SelecionarCategoria = () => {
  const navigate = useNavigate();

  const handleCategoriaClick = (categoria: string) => {
    navigate(`/planos-pagamento?categoria=${encodeURIComponent(categoria)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Selecione a Categoria do Seu Estabelecimento
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha a categoria que melhor representa seu negócio para ver os planos disponíveis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {CATEGORIAS_ESTABELECIMENTO.map((categoria) => (
              <Card
                key={categoria.value}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                onClick={() => handleCategoriaClick(categoria.value)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span className="text-3xl">{categoria.icon}</span>
                    <span className="flex-1">{categoria.label}</span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                  <CardDescription>
                    Clique para ver os planos
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SelecionarCategoria;
