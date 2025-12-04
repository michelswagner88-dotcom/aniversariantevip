import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cake, Store, UserPlus, Search, FileText, Gift, 
  Building, Settings, CreditCard, Users, TrendingUp, 
  Target, DollarSign, Star, ArrowRight,
  Smartphone, Zap, LayoutGrid, MapPin, Shield, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';
import { SEO_CONTENT } from '@/constants/seo';

const ComoFunciona = () => {
  // SEO
  useSEO({
    title: SEO_CONTENT.comoFunciona.title,
    description: SEO_CONTENT.comoFunciona.description,
  });

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'aniversariante' | 'estabelecimento'>('aniversariante');

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Como Funciona
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Benefícios exclusivos para aniversariantes. 
            Novos clientes para estabelecimentos.
          </p>
        </div>
      </section>

      {/* Por que o Aniversariante VIP */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-violet-400 text-sm font-medium uppercase tracking-wider">
              A Plataforma
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-4">
              Por que o Aniversariante VIP?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tecnologia de ponta para a melhor experiência em benefícios de aniversário
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Diferencial 1 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-violet-500/30 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                Design Moderno
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Interface elegante e intuitiva, pensada para proporcionar a melhor experiência em qualquer dispositivo.
              </p>
            </div>

            {/* Diferencial 2 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-fuchsia-500/30 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-r from-fuchsia-600/20 to-pink-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-fuchsia-400" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                Tecnologia de Ponta
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Plataforma rápida, segura e sempre atualizada com as melhores práticas do mercado.
              </p>
            </div>

            {/* Diferencial 3 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-600/20 to-rose-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                Cards Completos
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Visualize foto, categoria, benefício, localização e avaliações de cada estabelecimento em cards informativos.
              </p>
            </div>

            {/* Diferencial 4 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-rose-500/30 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-r from-rose-600/20 to-orange-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                Busca Inteligente
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Encontre estabelecimentos por cidade, categoria ou proximidade com filtros avançados e mapa interativo.
              </p>
            </div>

            {/* Diferencial 5 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/30 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                100% Seguro
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Seus dados protegidos com criptografia de ponta. Privacidade e segurança são nossa prioridade.
              </p>
            </div>

            {/* Diferencial 6 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="font-semibold text-white text-lg mb-2">
                Feito com Carinho
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cada detalhe pensado para tornar seu aniversário ainda mais especial. Do Brasil, para brasileiros.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Toggle Tabs */}
      <section className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-900 p-1 rounded-2xl flex">
            <button
              onClick={() => setActiveTab('aniversariante')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-medium transition-all ${
                activeTab === 'aniversariante'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Cake className="w-5 h-5" />
              Aniversariante
            </button>
            <button
              onClick={() => setActiveTab('estabelecimento')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-medium transition-all ${
                activeTab === 'estabelecimento'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Store className="w-5 h-5" />
              Estabelecimento
            </button>
          </div>
        </div>
      </section>

      {/* Conteúdo Aniversariante */}
      {activeTab === 'aniversariante' && (
        <>
          {/* Passos */}
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
              
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
                Ganhe benefícios no seu aniversário
              </h2>
              <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                Em poucos passos você desbloqueia ofertas exclusivas nos melhores estabelecimentos da sua cidade
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Passo 1 */}
                <div className="relative group">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all h-full">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center mb-4">
                      <UserPlus className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Cadastre-se Grátis
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Crie sua conta com seus dados básicos para liberar os benefícios exclusivos.
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="relative group">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-fuchsia-500/50 transition-all h-full">
                    <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <div className="w-10 h-10 bg-fuchsia-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Search className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Encontre Estabelecimentos
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Navegue pelos estabelecimentos parceiros e descubra os benefícios disponíveis na sua cidade.
                    </p>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="relative group">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all h-full">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-5 h-5 text-pink-400" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Confira as Condições
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Antes de utilizar, leia atentamente as regras de cada estabelecimento.
                    </p>
                  </div>
                </div>

                {/* Passo 4 */}
                <div className="relative group">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-rose-500/50 transition-all h-full">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-600 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-white font-bold text-lg">4</span>
                    </div>
                    <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Gift className="w-5 h-5 text-rose-400" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">
                      Aproveite o Benefício
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Apresente seu documento no estabelecimento e aproveite sua vantagem de aniversário.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* CTA Aniversariante */}
          <section className="py-12 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Pronto para ganhar benefícios?
                </h3>
                <p className="text-gray-400 mb-6">
                  Cadastre-se gratuitamente e comece a aproveitar
                </p>
                <Button
                  onClick={() => navigate('/auth?modo=cadastro')}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-lg px-8 py-6 h-auto"
                >
                  Cadastrar Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Conteúdo Estabelecimento */}
      {activeTab === 'estabelecimento' && (
        <>
          {/* Header */}
          <section className="py-8 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Torne-se um Estabelecimento Parceiro
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Atraia mais clientes e destaque seu negócio na maior plataforma de benefícios para aniversariantes do Brasil
              </p>
            </div>
          </section>

          {/* Passos */}
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
              
              <h3 className="text-xl font-semibold text-white text-center mb-8">
                Como Funciona
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Passo 1 */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-violet-500/50 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Building className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">
                    Cadastre-se
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Preencha seus dados de acesso e informações do seu estabelecimento.
                  </p>
                </div>

                {/* Passo 2 */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-fuchsia-500/50 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div className="w-10 h-10 bg-fuchsia-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">
                    Defina Seus Benefícios
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Informe os benefícios para os aniversariantes e suas regras de utilização.
                  </p>
                </div>

                {/* Passo 3 */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-pink-500/50 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                    <CreditCard className="w-5 h-5 text-pink-400" />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">
                    Ative Seu Perfil
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Escolha um dos planos disponíveis para ativar sua oferta na plataforma.
                  </p>
                </div>

                {/* Passo 4 */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-rose-500/50 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-600 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">4</span>
                  </div>
                  <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-rose-400" />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">
                    Receba Aniversariantes
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Os aniversariantes encontram seu estabelecimento na plataforma e visitam para aproveitar o benefício.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* Vantagens */}
          <section className="py-12 px-4 bg-white/5">
            <div className="max-w-5xl mx-auto">
              
              <h3 className="text-2xl font-bold text-white text-center mb-4">
                Vantagens de Ser Parceiro
              </h3>
              <p className="text-gray-400 text-center mb-12">
                Descubra como a parceria pode transformar seu negócio
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Vantagem 1 */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">
                        Mais Movimento
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Aniversariante raramente comemora sozinho. Ele traz amigos, família, colegas de trabalho. Um único cupom pode representar uma mesa cheia de novos clientes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vantagem 2 */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-fuchsia-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-fuchsia-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">
                        Posicionamento Diferenciado
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Seu estabelecimento se torna referência em celebrações, aparecendo em uma plataforma focada 100% em aniversários, destaque frente à concorrência.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vantagem 3 */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">
                        Marketing Direcionado
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Divulgação ativa e contínua para um público com alta intenção de consumo: pessoas que estão prestes a comemorar e já procuram onde ir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vantagem 4 */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-rose-500/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg mb-2">
                        Baixo Custo, Alto Retorno
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Investimento muito menor que mídia tradicional, com potencial de retorno mês após mês, enquanto sua empresa estiver na plataforma.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* CTA Estabelecimento */}
          <section className="py-16 px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Pronto para atrair mais clientes?
                </h3>
                <p className="text-gray-400 mb-6">
                  Cadastre seu estabelecimento e comece a receber aniversariantes
                </p>
                <Button
                  onClick={() => navigate('/cadastro/estabelecimento')}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-lg px-8 py-6 h-auto"
                >
                  Cadastrar Estabelecimento
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Já tem conta? <button onClick={() => navigate('/login/estabelecimento')} className="text-violet-400 hover:text-violet-300">Entrar</button>
                </p>
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
};

export default ComoFunciona;
