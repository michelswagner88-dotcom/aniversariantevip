import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { FileText } from "lucide-react";

export default function TermosUso() {
  useSEO({
    title: SEO_CONTENT.termosUso.title,
    description: SEO_CONTENT.termosUso.description,
  });

  return (
    <div className="min-h-screen bg-[#240046]">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 pb-12 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#7C3AED]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="mb-8">
            <BackButton />
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <FileText className="w-4 h-4 text-[#C77DFF]" />
              <span className="text-sm text-white/90 font-medium">Termos legais</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Termos de Uso</h1>
            <p className="text-white/60 text-sm">
              Atualizado em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="px-4 pb-20">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-[#1a0033] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8">
            {/* 1. Sobre */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">1. Sobre o serviço</h2>
              <p className="text-white/70 leading-relaxed">
                O <strong className="text-white">Aniversariante VIP</strong> conecta aniversariantes a estabelecimentos
                que oferecem benefícios especiais. Atuamos como intermediário, facilitando a descoberta de vantagens
                exclusivas no período do seu aniversário.
              </p>
            </div>

            {/* 2. Aceitação */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">2. Aceitação</h2>
              <p className="text-white/70 leading-relaxed">
                Ao criar uma conta, você concorda com estes termos. Se não concordar, não use a plataforma.
              </p>
            </div>

            {/* 3. Cadastro */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">3. Sua conta</h2>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Forneça informações verdadeiras e atualizadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Você é responsável por manter sua senha segura</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>É necessário ter 18 anos ou mais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Apenas uma conta por CPF</span>
                </li>
              </ul>
            </div>

            {/* 4. Regras Aniversariantes */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">4. Para aniversariantes</h2>
              <div className="bg-[#240046] border border-white/10 rounded-xl p-5 space-y-3">
                <p className="text-white/70">
                  <strong className="text-white">Gratuito:</strong> O uso da plataforma é 100% gratuito.
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Pessoal:</strong> Os benefícios são intransferíveis. Venda ou repasse é
                  proibido.
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Validade:</strong> Cada benefício tem regras próprias (dia, semana ou
                  mês do aniversário).
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Validação:</strong> O estabelecimento pode recusar em caso de suspeita
                  de fraude.
                </p>
              </div>
            </div>

            {/* 5. Regras Estabelecimentos */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">5. Para estabelecimentos</h2>
              <div className="bg-[#240046] border border-white/10 rounded-xl p-5 space-y-3">
                <p className="text-white/70">
                  <strong className="text-white">Assinatura:</strong> É necessário manter um plano ativo.
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Responsabilidade:</strong> O estabelecimento é responsável pelo
                  benefício oferecido.
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Honrar:</strong> Deve cumprir os benefícios anunciados conforme suas
                  regras.
                </p>
                <p className="text-white/70">
                  <strong className="text-white">Alterações:</strong> Mudanças devem ser atualizadas imediatamente na
                  plataforma.
                </p>
              </div>
            </div>

            {/* 6. Conduta */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">6. Conduta proibida</h2>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>Usar para finalidade ilegal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>Criar contas falsas ou usar dados de terceiros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>Tentar burlar verificações ou sistemas de segurança</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>Usar bots ou automação não autorizada</span>
                </li>
              </ul>
            </div>

            {/* 7. Isenção */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">7. Nossa responsabilidade</h2>
              <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl p-5">
                <p className="text-white/70 leading-relaxed">
                  Somos <strong className="text-white">intermediários</strong>. Não nos responsabilizamos pela
                  qualidade, disponibilidade ou características dos produtos/serviços dos estabelecimentos. Problemas
                  devem ser resolvidos diretamente com o estabelecimento.
                </p>
              </div>
            </div>

            {/* 8. Cancelamento */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">8. Cancelamento</h2>
              <p className="text-white/70 leading-relaxed mb-3">
                Você pode cancelar sua conta a qualquer momento nas configurações ou entrando em contato conosco.
              </p>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Dados excluídos em até 30 dias</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Benefícios não utilizados serão invalidados</span>
                </li>
              </ul>
              <p className="text-white/60 text-sm mt-3">
                Podemos suspender contas em caso de violação dos termos ou suspeita de fraude.
              </p>
            </div>

            {/* 9. Alterações */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">9. Alterações</h2>
              <p className="text-white/70 leading-relaxed">
                Podemos atualizar estes termos periodicamente. O uso continuado após alterações significa que você
                aceita os novos termos.
              </p>
            </div>

            {/* 10. Foro */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">10. Lei aplicável</h2>
              <p className="text-white/70 leading-relaxed">
                Estes termos são regidos pelas leis do Brasil. Foro: comarca de Florianópolis/SC.
              </p>
            </div>

            {/* Contato */}
            <div className="bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-3">Dúvidas?</h2>
              <p className="text-white/70 mb-3">Entre em contato:</p>
              <a
                href="mailto:contato@aniversariantevip.com.br"
                className="text-[#C77DFF] hover:text-white transition-colors font-medium"
              >
                contato@aniversariantevip.com.br
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
