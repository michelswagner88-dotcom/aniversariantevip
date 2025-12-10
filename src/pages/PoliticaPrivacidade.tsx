import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { Shield, User, Building2, MapPin, CreditCard, Bell, Lock, Mail } from "lucide-react";

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
            <p className="text-white/60 text-sm">Atualizado em 10 de dezembro de 2025</p>
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
          <div className="bg-[#3C096C]/30 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8">
            {/* Intro */}
            <div>
              <p className="text-white/70 leading-relaxed mb-4">
                Esta Política de Privacidade explica como o <strong className="text-white">Aniversariante VIP</strong>{" "}
                coleta, usa e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD –
                Lei 13.709/2018).
              </p>
              <p className="text-white/70 leading-relaxed">
                Ao usar nosso site, PWA ou aplicativos para iOS/Android, você concorda com as práticas descritas aqui.
              </p>
            </div>

            {/* Quem somos */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">1. Quem somos</h2>
              <p className="text-white/70 leading-relaxed">
                O Aniversariante VIP é uma plataforma que conecta aniversariantes a estabelecimentos que oferecem
                benefícios exclusivos de aniversário (descontos, brindes, cortesias e experiências especiais). Quando
                falamos em "nós", "nosso" ou "plataforma", estamos nos referindo ao Aniversariante VIP.
              </p>
            </div>

            {/* Dados Coletados */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">2. Dados que coletamos</h2>
              <p className="text-white/70 mb-4">
                Podemos coletar diferentes tipos de dados, dependendo de como você usa a plataforma.
              </p>

              <div className="space-y-4">
                {/* Aniversariante */}
                <div className="bg-[#240046] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-[#C77DFF]" />
                    <p className="text-white font-medium">Dados de aniversariante</p>
                  </div>
                  <ul className="text-white/60 text-sm space-y-1 ml-7">
                    <li>• Nome completo, e-mail, telefone</li>
                    <li>• CPF e data de nascimento</li>
                    <li>• Cidade, estado e CEP</li>
                    <li>• Senha (armazenada criptografada)</li>
                  </ul>
                </div>

                {/* Estabelecimento */}
                <div className="bg-[#240046] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-[#C77DFF]" />
                    <p className="text-white font-medium">Dados de estabelecimentos parceiros</p>
                  </div>
                  <ul className="text-white/60 text-sm space-y-1 ml-7">
                    <li>• Nome do responsável, e-mail, telefone</li>
                    <li>• Nome fantasia, razão social, CNPJ</li>
                    <li>• Endereço completo</li>
                    <li>• Categoria, benefícios e regras</li>
                    <li>• Informações de plano e assinatura</li>
                  </ul>
                </div>

                {/* Login Social */}
                <div className="bg-[#240046] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-5 h-5 text-[#C77DFF]" />
                    <p className="text-white font-medium">Login social (Google / Apple)</p>
                  </div>
                  <p className="text-white/60 text-sm ml-7">
                    Ao entrar com Google ou Apple, podemos receber: nome, e-mail, foto de perfil e identificador do
                    provedor. Usamos apenas para criar e autenticar sua conta.
                  </p>
                </div>

                {/* Localização */}
                <div className="bg-[#240046] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-[#C77DFF]" />
                    <p className="text-white font-medium">Dados de localização</p>
                  </div>
                  <ul className="text-white/60 text-sm space-y-1 ml-7">
                    <li>• Cidade, estado e CEP informados no cadastro</li>
                    <li>• Coordenadas aproximadas (se você permitir) para mostrar estabelecimentos próximos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Finalidade */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">3. Para que usamos seus dados</h2>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Criar e gerenciar sua conta na plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Permitir login (e-mail/senha, Google ou Apple)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Verificar elegibilidade para benefícios de aniversário</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Exibir estabelecimentos na sua cidade ou região</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Enviar notificações sobre novos benefícios e atualizações</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Melhorar a experiência e performance da plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Prevenir fraudes e uso indevido</span>
                </li>
              </ul>
            </div>

            {/* Base Legal */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">4. Base legal (LGPD)</h2>
              <p className="text-white/70 mb-3">Tratamos dados pessoais com base nas seguintes hipóteses legais:</p>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Execução de contrato:</strong> para fornecer a plataforma e seus
                    recursos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Legítimo interesse:</strong> para melhorar o serviço, segurança e
                    análises internas
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Consentimento:</strong> para notificações push e localização precisa
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Obrigação legal:</strong> quando exigido por lei
                  </span>
                </li>
              </ul>
            </div>

            {/* Compartilhamento */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">5. Com quem compartilhamos</h2>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                <p className="text-white font-medium text-sm">
                  🔒 Não vendemos, alugamos ou comercializamos seus dados pessoais.
                </p>
              </div>

              <p className="text-white/70 mb-3">Compartilhamos dados apenas quando necessário, com:</p>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Estabelecimentos parceiros:</strong> Quando você utiliza um
                    benefício, o estabelecimento pode receber seu <strong className="text-white">nome</strong> para
                    validação. Não compartilhamos CPF, telefone ou endereço completo.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Fornecedores de tecnologia:</strong> Supabase (banco de dados),
                    Stripe (pagamentos), Google Maps (mapas), Google Analytics (métricas) — sob contratos de
                    confidencialidade.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>
                    <strong className="text-white">Autoridades:</strong> Quando exigido por lei, decisão judicial ou
                    pedido válido.
                  </span>
                </li>
              </ul>
            </div>

            {/* Pagamentos */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">6. Pagamentos</h2>
              <div className="bg-[#240046] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-[#C77DFF]" />
                  <p className="text-white font-medium">Processamento via Stripe</p>
                </div>
                <p className="text-white/60 text-sm ml-7">
                  Quando há pagamentos (planos para estabelecimentos), o processamento é feito pela Stripe.
                  <strong className="text-white/80"> Não armazenamos dados completos de cartão</strong> (número, CVV) em
                  nossos servidores.
                </p>
              </div>
            </div>

            {/* Permissões */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">7. Permissões do dispositivo</h2>
              <p className="text-white/70 mb-4">A plataforma pode solicitar permissões como:</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C77DFF] mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Localização</p>
                    <p className="text-white/60 text-sm">Para mostrar estabelecimentos próximos. Você pode recusar.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-[#C77DFF] mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Notificações (Push)</p>
                    <p className="text-white/60 text-sm">
                      Para alertas de novos benefícios. Desative nas configurações do dispositivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">8. Cookies e armazenamento local</h2>
              <p className="text-white/70 leading-relaxed">
                Usamos cookies e tecnologias similares para manter você logado, salvar preferências, melhorar
                performance e entender como a plataforma é utilizada. Você pode gerenciar cookies nas configurações do
                seu navegador.
              </p>
            </div>

            {/* Transferência Internacional */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">9. Transferência internacional</h2>
              <p className="text-white/70 leading-relaxed">
                Alguns fornecedores (Supabase, Stripe, Google) podem processar dados fora do Brasil. Nesses casos,
                buscamos parceiros que adotem padrões elevados de segurança e estejam adequados à LGPD.
              </p>
            </div>

            {/* Retenção */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">10. Por quanto tempo guardamos</h2>
              <p className="text-white/70 leading-relaxed">
                Mantemos seus dados enquanto sua conta estiver ativa. Se você solicitar exclusão, seus dados serão
                removidos em até <strong className="text-white">30 dias</strong>, exceto quando precisarmos manter por
                obrigação legal (ex.: informações fiscais).
              </p>
            </div>

            {/* Segurança */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">11. Segurança da informação</h2>
              <p className="text-white/70 leading-relaxed mb-3">
                Adotamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Criptografia de senhas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Controle de acesso por autenticação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Monitoramento de acessos suspeitos</span>
                </li>
              </ul>
              <p className="text-white/60 text-sm mt-3">
                Nenhum sistema é 100% imune. Em caso de incidente, tomaremos as medidas cabíveis conforme a LGPD.
              </p>
            </div>

            {/* Direitos */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">12. Seus direitos (LGPD)</h2>
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
                <li className="flex items-start gap-2">
                  <span className="text-[#C77DFF]">•</span>
                  <span>Obter informações sobre compartilhamentos</span>
                </li>
              </ul>
            </div>

            {/* Menores */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">13. Menores de idade</h2>
              <p className="text-white/70 leading-relaxed">
                A plataforma não é direcionada a menores de 18 anos. Se identificarmos uso indevido por menor, poderemos
                restringir ou encerrar a conta.
              </p>
            </div>

            {/* Contato */}
            <div className="bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-[#C77DFF]" />
                <h2 className="text-xl font-bold text-white">14. Contato</h2>
              </div>
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
            <div>
              <h2 className="text-xl font-bold text-white mb-4">15. Atualizações desta Política</h2>
              <p className="text-white/70 leading-relaxed">
                Esta política pode ser atualizada para refletir mudanças na plataforma ou exigências legais. Quando
                houver mudanças relevantes, avisaremos por e-mail ou aviso na plataforma.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
