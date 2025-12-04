import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";

export default function TermosUso() {
  // SEO
  useSEO({
    title: SEO_CONTENT.termosUso.title,
    description: SEO_CONTENT.termosUso.description,
  });
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Background com grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="fixed top-20 left-0 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <Header />
      
      <main className="relative flex-1 container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Termos de Uso
          </h1>
          <p className="text-slate-400 mb-8">
            Atualizado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10 p-8 md:p-12 space-y-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Sobre o Serviço</h2>
              <p className="text-slate-300 leading-relaxed">
                O <strong className="text-white">Aniversariante VIP</strong> é uma plataforma que conecta aniversariantes 
                a estabelecimentos parceiros em todo o Brasil que oferecem benefícios especiais. Atuamos como intermediário, 
                facilitando a descoberta e o acesso a vantagens exclusivas durante o período de aniversário.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Aceitação dos Termos</h2>
              <p className="text-slate-300 leading-relaxed">
                Ao criar uma conta e usar nossos serviços, você concorda integralmente com estes Termos de Uso. 
                Se não concordar com qualquer parte destes termos, não utilize a plataforma.
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
              <h2 className="text-2xl font-bold text-white mb-3">4. Regras para Aniversariantes</h2>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-3">
                <p className="text-slate-300"><strong className="text-white">• Cadastro Gratuito:</strong> O registro e uso da plataforma é 100% gratuito para aniversariantes.</p>
                <p className="text-slate-300"><strong className="text-white">• Limite de Cupons:</strong> É permitido emitir até 1 (um) cupom por estabelecimento a cada 7 dias.</p>
                <p className="text-slate-300"><strong className="text-white">• Uso Pessoal:</strong> Os cupons são pessoais e intransferíveis. A venda ou comercialização é estritamente proibida.</p>
                <p className="text-slate-300"><strong className="text-white">• Validade:</strong> Cada cupom possui prazo de validade específico (dia, semana ou mês) conforme definido pelo estabelecimento.</p>
                <p className="text-slate-300"><strong className="text-white">• Validação:</strong> O estabelecimento pode recusar cupons em caso de suspeita de fraude ou uso indevido.</p>
              </div>
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
              <h2 className="text-2xl font-bold text-white mb-3">5. Regras para Estabelecimentos</h2>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-3">
                <p className="text-slate-300"><strong className="text-white">• Planos Pagos:</strong> Estabelecimentos devem manter assinatura ativa em um dos planos disponíveis.</p>
                <p className="text-slate-300"><strong className="text-white">• Responsabilidade:</strong> O estabelecimento é integralmente responsável pelo benefício oferecido e sua entrega.</p>
                <p className="text-slate-300"><strong className="text-white">• Disponibilidade:</strong> O estabelecimento deve honrar os benefícios anunciados conforme suas próprias regras.</p>
                <p className="text-slate-300"><strong className="text-white">• Alterações:</strong> Mudanças nos benefícios devem ser comunicadas imediatamente através da plataforma.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Isenção de Responsabilidade</h2>
              <div className="bg-violet-500/10 rounded-lg p-6 border border-violet-500/20">
                <p className="text-slate-300 leading-relaxed">
                  O Aniversariante VIP atua <strong className="text-white">exclusivamente como intermediário</strong>, conectando aniversariantes 
                  e estabelecimentos. <strong className="text-white">Não somos responsáveis</strong> pela qualidade, disponibilidade, veracidade ou 
                  características dos produtos e serviços oferecidos pelos estabelecimentos parceiros. Disputas, reclamações ou problemas 
                  relacionados aos benefícios devem ser resolvidos diretamente com o estabelecimento.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Propriedade Intelectual</h2>
              <p className="text-slate-300 leading-relaxed">
                Todo o conteúdo da plataforma, incluindo nome, logo, design, código-fonte, textos, gráficos e funcionalidades, 
                é propriedade exclusiva do Aniversariante VIP e está protegido por leis de direitos autorais e propriedade intelectual brasileiras.
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
              <h2 className="text-2xl font-bold text-white mb-3">8. Cancelamento e Exclusão de Conta</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Você pode solicitar o cancelamento e exclusão completa de sua conta a qualquer momento através das 
                configurações da plataforma ou entrando em contato conosco. Após a solicitação:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-1">•</span>
                  <span>Seus dados pessoais serão excluídos permanentemente em até 30 dias</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-1">•</span>
                  <span>Cupons não utilizados serão invalidados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-1">•</span>
                  <span>Dados legais podem ser mantidos conforme exigências da legislação brasileira</span>
                </li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Reservamo-nos o direito de suspender ou cancelar contas em caso de violação destes termos, 
                suspeita de fraude ou uso indevido da plataforma.
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
              <h2 className="text-2xl font-bold text-white mb-3">11. Lei Aplicável e Foro</h2>
              <p className="text-slate-300 leading-relaxed">
                Estes Termos de Uso são regidos pelas leis da <strong className="text-white">República Federativa do Brasil</strong>. 
                Fica eleito o <strong className="text-white">foro da comarca de São Paulo/SP</strong> para dirimir quaisquer 
                controvérsias decorrentes destes termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
              </p>
            </section>

            <section className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-lg p-6 border border-violet-500/20">
              <h2 className="text-2xl font-bold text-white mb-3">12. Contato</h2>
              <p className="text-slate-300 mb-4">
                Para questões, dúvidas ou solicitações relacionadas a estes Termos de Uso:
              </p>
              <div className="space-y-2 text-slate-300">
                <p><strong className="text-white">E-mail:</strong> <a href="mailto:contato@aniversariantevip.com.br" className="text-violet-400 hover:text-violet-300">contato@aniversariantevip.com.br</a></p>
                <p><strong className="text-white">Telefone:</strong> (11) 99999-9999</p>
              </div>
            </section>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
