import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PoliticaPrivacidade() {
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
            Política de Privacidade
          </h1>
          <p className="text-slate-400 mb-8">
            Atualizado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10 p-8 md:p-12 space-y-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Dados Coletados</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), coletamos os seguintes dados pessoais:
              </p>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                  <div>
                    <p className="font-semibold text-white mb-2">Dados de Identificação:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Nome completo</li>
                      <li>• CPF</li>
                      <li>• Data de nascimento</li>
                      <li>• E-mail</li>
                      <li>• Telefone/Celular</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">Dados de Localização:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• CEP</li>
                      <li>• Cidade</li>
                      <li>• Estado</li>
                      <li>• Bairro</li>
                      <li>• Logradouro e número</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Finalidade do Tratamento</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Utilizamos seus dados pessoais exclusivamente para as seguintes finalidades:
              </p>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1 font-bold">1.</span>
                  <span><strong className="text-white">Identificação:</strong> Criar e gerenciar sua conta na plataforma</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1 font-bold">2.</span>
                  <span><strong className="text-white">Emissão de Cupons:</strong> Verificar elegibilidade e gerar cupons de benefícios para aniversariantes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1 font-bold">3.</span>
                  <span><strong className="text-white">Comunicação:</strong> Enviar notificações sobre novos benefícios, ofertas e atualizações da plataforma</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1 font-bold">4.</span>
                  <span><strong className="text-white">Melhoria:</strong> Analisar uso da plataforma para aprimorar funcionalidades e experiência do usuário</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1 font-bold">5.</span>
                  <span><strong className="text-white">Segurança:</strong> Prevenir fraudes, abuso e garantir a integridade da plataforma</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Base Legal (LGPD)</h2>
              <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-lg p-6 border border-violet-500/20">
                <p className="text-slate-300 leading-relaxed">
                  O tratamento dos seus dados pessoais está fundamentado nas seguintes bases legais previstas pela LGPD:
                </p>
                <ul className="mt-4 space-y-2 text-slate-300">
                  <li><strong className="text-white">• Consentimento (Art. 7º, I):</strong> Você consente expressamente ao aceitar esta Política ao criar sua conta</li>
                  <li><strong className="text-white">• Execução de Contrato (Art. 7º, V):</strong> Necessário para fornecimento do serviço de intermediação de benefícios</li>
                  <li><strong className="text-white">• Legítimo Interesse (Art. 7º, IX):</strong> Para melhoria da plataforma e prevenção de fraudes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Compartilhamento de Dados</h2>
              <div className="bg-violet-500/10 rounded-lg p-6 border border-violet-500/20 mb-4">
                <p className="text-white font-semibold mb-2">🔒 Garantia de Privacidade</p>
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-white">NÃO vendemos, alugamos ou comercializamos</strong> seus dados pessoais 
                  para terceiros em nenhuma hipótese.
                </p>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                Compartilhamos dados pessoais apenas nas seguintes situações:
              </p>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1">•</span>
                  <span><strong className="text-white">Estabelecimentos Parceiros:</strong> Quando você emite um cupom, o estabelecimento recebe 
                  apenas seu <strong className="text-white">nome</strong> e <strong className="text-white">código do cupom</strong> para validação. 
                  Não compartilhamos CPF, telefone, endereço ou outros dados sensíveis.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1">•</span>
                  <span><strong className="text-white">Prestadores de Serviços:</strong> Empresas que auxiliam na operação da plataforma 
                  (hospedagem Supabase, infraestrutura de e-mail) sob rígidos acordos de confidencialidade.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1">•</span>
                  <span><strong className="text-white">Autoridades:</strong> Quando exigido por lei, ordem judicial ou requisição de autoridades competentes.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Armazenamento e Segurança</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Seus dados são armazenados em <strong className="text-white">servidores seguros</strong> providos pela 
                <strong className="text-white"> Supabase</strong>, com infraestrutura de nível empresarial, localizados 
                em data centers com certificações internacionais de segurança.
              </p>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <p className="text-white font-semibold mb-3">🔐 Medidas de Segurança Implementadas:</p>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Criptografia SSL/TLS em todas as comunicações</li>
                  <li>• Autenticação segura com hash de senhas</li>
                  <li>• Backups automáticos e redundantes</li>
                  <li>• Controle de acesso restrito por funções (RLS)</li>
                  <li>• Monitoramento contínuo de segurança e logs de auditoria</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies e Tecnologias Similares</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Utilizamos cookies para melhorar sua experiência na plataforma:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li><strong className="text-white">• Cookies Essenciais:</strong> Necessários para funcionamento da plataforma (sessão, autenticação)</li>
                <li><strong className="text-white">• Cookies de Preferências:</strong> Armazenam suas escolhas (tema, idioma, configurações)</li>
                <li><strong className="text-white">• Cookies Analíticos:</strong> Nos ajudam a entender como você usa a plataforma (anonimizados)</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Você pode gerenciar suas preferências de cookies através das configurações do seu navegador. 
                Desabilitar cookies essenciais pode afetar o funcionamento da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Retenção de Dados</h2>
              <p className="text-slate-300 leading-relaxed">
                Mantemos seus dados pessoais enquanto sua conta estiver ativa ou conforme necessário para 
                cumprir as finalidades descritas nesta política. Após solicitação de exclusão de conta, 
                seus dados serão permanentemente excluídos em até <strong className="text-white">30 dias</strong>, 
                exceto quando a retenção for necessária para cumprimento de obrigações legais ou regulatórias.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Seus Direitos (LGPD - Art. 18)</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Em conformidade com a LGPD, você possui os seguintes direitos em relação aos seus dados pessoais:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-semibold mb-2">Confirmação e Acesso</p>
                  <p className="text-slate-300 text-sm">Confirmar existência de tratamento e acessar seus dados</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-semibold mb-2">Correção</p>
                  <p className="text-slate-300 text-sm">Corrigir dados incompletos, inexatos ou desatualizados</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-semibold mb-2">Anonimização/Bloqueio</p>
                  <p className="text-slate-300 text-sm">Solicitar anonimização ou bloqueio de dados desnecessários</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-semibold mb-2">Eliminação</p>
                  <p className="text-slate-300 text-sm">Solicitar exclusão de dados tratados com consentimento</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-semibold mb-2">Portabilidade</p>
                  <p className="text-slate-300 text-sm">Obter cópia dos seus dados em formato estruturado</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-semibold mb-2">Revogação de Consentimento</p>
                  <p className="text-slate-300 text-sm">Revogar consentimento a qualquer momento</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed mt-4">
                Para exercer qualquer um desses direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Alterações nesta Política</h2>
              <p className="text-slate-300 leading-relaxed">
                Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas 
                práticas ou na legislação. Notificaremos sobre alterações significativas por e-mail ou através de 
                aviso destacado na plataforma. Recomendamos revisar esta página regularmente.
              </p>
            </section>

            <section className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-lg p-6 border border-violet-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">10. Contato e Encarregado (DPO)</h2>
              <p className="text-slate-300 mb-6">
                Para exercer seus direitos, esclarecer dúvidas ou enviar solicitações relacionadas ao tratamento 
                de dados pessoais, entre em contato com nosso <strong className="text-white">Encarregado de Proteção de Dados (DPO)</strong>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-violet-400 text-sm font-semibold mb-1">E-mail do DPO</p>
                    <a href="mailto:privacidade@aniversariantevip.com.br" className="text-white hover:text-violet-300 transition-colors">
                      privacidade@aniversariantevip.com.br
                    </a>
                  </div>
                  <div>
                    <p className="text-violet-400 text-sm font-semibold mb-1">Contato Geral</p>
                    <a href="mailto:contato@aniversariantevip.com.br" className="text-white hover:text-violet-300 transition-colors">
                      contato@aniversariantevip.com.br
                    </a>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-violet-400 text-sm font-semibold mb-1">Telefone</p>
                    <p className="text-white">(11) 99999-9999</p>
                  </div>
                  <div>
                    <p className="text-violet-400 text-sm font-semibold mb-1">Prazo de Resposta</p>
                    <p className="text-white">Até 15 dias úteis</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-slate-400 text-sm">
                  <strong className="text-white">Aniversariante VIP</strong> • CNPJ: 00.000.000/0001-00<br/>
                  Comprometidos com a LGPD e a proteção dos seus dados pessoais.
                </p>
              </div>
            </section>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
