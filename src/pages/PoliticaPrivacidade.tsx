import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { Shield } from "lucide-react";

export default function PoliticaPrivacidade() {
  useSEO({
    title: SEO_CONTENT.politicaPrivacidade.title,
    description: SEO_CONTENT.politicaPrivacidade.description,
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
              <Shield className="w-4 h-4 text-[#C77DFF]" />
              <span className="text-sm text-white/90 font-medium">Seus dados protegidos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Política de Privacidade</h1>
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
            {/* Intro */}
            <p className="text-white/70 leading-relaxed">
              Esta Política de Privacidade explica como o <strong className="text-white">Aniversariante VIP</strong>{" "}
              coleta, usa e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD -
              Lei 13.709/2018).
            </p>

            {/* 1. Dados Coletados */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">1. Dados que coletamos</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#240046] border border-white/10 rounded-xl p-4">
                  <p className="text-white font-medium text-sm mb-2">Identificação</p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>• Nome completo</li>
                    <li>• E-mail</li>
                    <li>• CPF</li>
                    <li>• Data de nascimento</li>
                    <li>• Telefone</li>
                  </ul>
                </div>
                <div className="bg-[#240046] border border-white/10 rounded-xl p-4">
                  <p className="text-white font-medium text-sm mb-2">Localização</p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>• Cidade</li>
                    <li>• Estado</li>
                    <li>• CEP</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Finalidade */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">2. Para que usamos seus dados</h2>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Criar e gerenciar sua conta na plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Verificar se você é elegível para os benefícios de aniversário</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Enviar notificações sobre novos benefícios e atualizações</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Mostrar estabelecimentos próximos à sua localização</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Melhorar a experiência na plataforma</span>
                </li>
              </ul>
            </div>

            {/* 3. Compartilhamento */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">3. Com quem compartilhamos</h2>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                <p className="text-white font-medium text-sm">
                  🔒 Não vendemos, alugamos ou comercializamos seus dados pessoais.
                </p>
              </div>

              <p className="text-white/70 mb-3">Compartilhamos dados apenas com:</p>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Estabelecimentos parceiros:</strong> Quando você resgata um
                    benefício, o estabelecimento recebe apenas seu <strong className="text-white">nome</strong> para
                    validação. Não compartilhamos CPF, telefone ou endereço.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Prestadores de serviço:</strong> Empresas que auxiliam na operação
                    (hospedagem, envio de e-mails), sob acordos de confidencialidade.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Autoridades:</strong> Quando exigido por lei ou ordem judicial.
                  </span>
                </li>
              </ul>
            </div>

            {/* 4. Cookies */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">4. Cookies</h2>
              <p className="text-white/70 leading-relaxed">
                Usamos cookies para manter você logado, salvar suas preferências e entender como a plataforma é
                utilizada. Você pode gerenciar cookies nas configurações do seu navegador.
              </p>
            </div>

            {/* 5. Retenção */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">5. Por quanto tempo guardamos</h2>
              <p className="text-white/70 leading-relaxed">
                Mantemos seus dados enquanto sua conta estiver ativa. Se você solicitar exclusão, seus dados serão
                removidos em até <strong className="text-white">30 dias</strong>, exceto quando precisarmos manter por
                obrigação legal.
              </p>
            </div>

            {/* 6. Seus Direitos */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">6. Seus direitos (LGPD)</h2>
              <p className="text-white/70 mb-4">Você pode, a qualquer momento:</p>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Acessar os dados que temos sobre você</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Corrigir dados incompletos ou desatualizados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Solicitar a exclusão dos seus dados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Revogar seu consentimento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Solicitar portabilidade dos dados</span>
                </li>
              </ul>
            </div>

            {/* 7. Contato */}
            <div className="bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-3">7. Contato</h2>
              <p className="text-white/70 mb-4">Para exercer seus direitos ou tirar dúvidas sobre seus dados:</p>
              <a
                href="mailto:privacidade@aniversariantevip.com.br"
                className="text-[#C77DFF] hover:text-white transition-colors font-medium"
              >
                privacidade@aniversariantevip.com.br
              </a>
              <p className="text-white/50 text-sm mt-2">Respondemos em até 15 dias úteis.</p>
            </div>

            {/* Atualização */}
            <p className="text-white/50 text-sm">
              Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas por e-mail
              ou aviso na plataforma.
            </p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
