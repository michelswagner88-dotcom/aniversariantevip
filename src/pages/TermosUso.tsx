import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function TermosUso() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>
          
          <Card className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar e usar a plataforma Aniversariante VIP, você concorda em cumprir estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground">
                O Aniversariante VIP é uma plataforma que conecta pessoas que fazem aniversário com estabelecimentos 
                parceiros que oferecem descontos e benefícios especiais. Não somos responsáveis pela qualidade ou 
                disponibilidade dos produtos/serviços oferecidos pelos estabelecimentos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Você deve fornecer informações verdadeiras, precisas e atualizadas</li>
                <li>Você é responsável por manter a confidencialidade de sua conta</li>
                <li>Você deve ter pelo menos 18 anos para criar uma conta</li>
                <li>É proibido criar múltiplas contas para o mesmo CPF</li>
                <li>Você deve notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Uso dos Cupons</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Os cupons são pessoais e intransferíveis</li>
                <li>Cada cupom pode ser usado apenas uma vez</li>
                <li>Os cupons têm prazo de validade definido pelo estabelecimento</li>
                <li>O estabelecimento pode recusar cupons em caso de suspeita de fraude</li>
                <li>Não é permitido a venda ou comercialização de cupons</li>
                <li>O benefício está sujeito às regras específicas de cada estabelecimento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Conduta do Usuário</h2>
              <p className="text-muted-foreground mb-4">Você concorda em NÃO:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Usar a plataforma para qualquer finalidade ilegal</li>
                <li>Tentar burlar sistemas de verificação ou segurança</li>
                <li>Criar contas falsas ou usar informações de terceiros</li>
                <li>Fazer engenharia reversa ou tentar acessar código-fonte</li>
                <li>Usar bots, scripts ou qualquer automação não autorizada</li>
                <li>Publicar conteúdo ofensivo, difamatório ou inadequado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones, imagens, clipes de áudio, 
                downloads digitais e software, é propriedade do Aniversariante VIP ou de seus fornecedores de conteúdo 
                e é protegido por leis de direitos autorais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground mb-4">
                O Aniversariante VIP não se responsabiliza por:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Qualidade, disponibilidade ou características dos produtos/serviços dos estabelecimentos</li>
                <li>Disputas entre usuários e estabelecimentos</li>
                <li>Falhas técnicas, interrupções ou indisponibilidade temporária da plataforma</li>
                <li>Perda de dados ou prejuízos decorrentes do uso da plataforma</li>
                <li>Alterações ou cancelamento de benefícios pelos estabelecimentos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Suspensão e Cancelamento</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de suspender ou cancelar sua conta a qualquer momento, sem aviso prévio, 
                em caso de violação destes termos ou suspeita de atividade fraudulenta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Modificações do Serviço</h2>
              <p className="text-muted-foreground">
                Podemos modificar, suspender ou descontinuar qualquer aspecto da plataforma a qualquer momento, 
                incluindo disponibilidade de funcionalidades, banco de dados ou conteúdo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Alterações nos Termos</h2>
              <p className="text-muted-foreground">
                Estes termos podem ser atualizados periodicamente. O uso continuado da plataforma após alterações 
                constitui aceitação dos novos termos. Recomendamos revisar esta página regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Lei Aplicável e Foro</h2>
              <p className="text-muted-foreground">
                Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP 
                para dirimir quaisquer controvérsias decorrentes destes termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contato</h2>
              <p className="text-muted-foreground">
                Para questões sobre estes Termos de Uso, entre em contato:
              </p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong>E-mail:</strong> contato@aniversariantevip.com.br</p>
                <p><strong>Telefone:</strong> (11) 99999-9999</p>
                <p><strong>Data da última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </section>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
