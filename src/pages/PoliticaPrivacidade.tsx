import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { Shield, ChevronDown, Mail, Building2, Lock, Globe, Clock, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TIPOS E DADOS
// =============================================================================

interface Section {
  id: string;
  title: string;
  shortTitle?: string;
}

const sections: Section[] = [
  { id: "controlador", title: "0. Quem somos", shortTitle: "Controlador" },
  { id: "o-que-e", title: "1. O que é o Aniversariante VIP", shortTitle: "O que é" },
  { id: "dados-coletados", title: "2. Dados coletados", shortTitle: "Dados coletados" },
  { id: "finalidades", title: "3. Finalidades", shortTitle: "Finalidades" },
  { id: "bases-legais", title: "4. Bases legais (LGPD)", shortTitle: "Bases legais" },
  { id: "compartilhamento", title: "5. Compartilhamento", shortTitle: "Compartilhamento" },
  { id: "pagamentos", title: "6. Pagamentos", shortTitle: "Pagamentos" },
  { id: "permissoes", title: "7. Permissões do dispositivo", shortTitle: "Permissões" },
  { id: "cookies", title: "8. Cookies", shortTitle: "Cookies" },
  { id: "transferencia", title: "9. Transferência internacional", shortTitle: "Transferência" },
  { id: "retencao", title: "10. Retenção", shortTitle: "Retenção" },
  { id: "seguranca", title: "11. Segurança", shortTitle: "Segurança" },
  { id: "seus-direitos", title: "12. Seus direitos", shortTitle: "Seus direitos" },
  { id: "menores", title: "13. Menores de idade", shortTitle: "Menores" },
  { id: "atualizacoes", title: "14. Atualizações", shortTitle: "Atualizações" },
  { id: "contato", title: "15. Contato", shortTitle: "Contato" },
];

// =============================================================================
// COMPONENTE TOC MOBILE (Accordion)
// =============================================================================

const TOCMobile = ({ activeSection }: { activeSection: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm"
      >
        <span className="text-sm font-medium text-zinc-900">Sumário</span>
        <ChevronDown
          className={cn("w-4 h-4 text-zinc-500 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="mt-2 bg-white border border-zinc-200 rounded-2xl p-3 shadow-sm space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                activeSection === section.id
                  ? "bg-[#240046]/5 text-[#240046] font-medium"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50",
              )}
            >
              {section.shortTitle || section.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// COMPONENTE TOC DESKTOP (Sticky)
// =============================================================================

const TOCDesktop = ({ activeSection }: { activeSection: string }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav className="hidden lg:block">
      <div className="lg:sticky lg:top-24">
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Sumário</h3>
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-[#240046]/5 text-[#240046] font-medium"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
                  )}
                >
                  {section.shortTitle || section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

// =============================================================================
// COMPONENTE CARD SEÇÃO
// =============================================================================

const SectionCard = ({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-28">
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <div className="w-10 h-10 bg-[#240046]/5 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#240046]" />
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 pt-1">{title}</h2>
      </div>
      <div className="text-sm sm:text-base text-zinc-700 leading-relaxed space-y-4">{children}</div>
    </div>
  </section>
);

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function PoliticaPrivacidade() {
  const [activeSection, setActiveSection] = useState("controlador");

  useSEO({
    title: SEO_CONTENT.politicaPrivacidade?.title || "Política de Privacidade | Aniversariante VIP",
    description: SEO_CONTENT.politicaPrivacidade?.description || "Política de Privacidade do Aniversariante VIP",
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 pb-8 sm:pb-10 bg-white border-b border-zinc-200">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-6">
            <BackButton />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#240046]/5 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#240046]" />
            </div>
            <span className="text-sm text-[#240046] font-medium uppercase tracking-wider">Privacidade</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight">Política de Privacidade</h1>
          <p className="mt-3 text-base text-zinc-600 leading-relaxed max-w-2xl">
            Esta Política explica como o Aniversariante VIP coleta, usa, compartilha e protege dados pessoais, em
            conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
          </p>
          <p className="mt-3 text-sm text-zinc-500">Atualizado em 10 de Janeiro de 2025</p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-8 sm:py-10">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* TOC Mobile */}
          <TOCMobile activeSection={activeSection} />

          {/* Grid: TOC + Conteúdo */}
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
            {/* TOC Desktop */}
            <TOCDesktop activeSection={activeSection} />

            {/* Conteúdo */}
            <div className="space-y-6">
              {/* 0. Controlador */}
              <SectionCard id="controlador" title="0. Quem somos (Controlador)" icon={Building2}>
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                  <p className="font-medium text-zinc-900 mb-2">Controlador dos dados:</p>
                  <p className="text-zinc-700">Aniversariante VIP</p>
                  <div className="mt-4 pt-4 border-t border-zinc-200">
                    <p className="text-sm text-zinc-600 mb-2">Canal de privacidade:</p>
                    <a
                      href="mailto:contato@aniversariantevip.com.br"
                      className="text-[#240046] hover:text-[#3C096C] font-medium transition-colors"
                    >
                      contato@aniversariantevip.com.br
                    </a>
                  </div>
                </div>
              </SectionCard>

              {/* 1. O que é */}
              <SectionCard id="o-que-e" title="1. O que é o Aniversariante VIP">
                <p>
                  O Aniversariante VIP é um marketplace que conecta aniversariantes a estabelecimentos que oferecem
                  benefícios de aniversário (descontos, brindes, cortesias e experiências).
                </p>
                <p>
                  Nós facilitamos a descoberta e a organização das informações — o benefício é oferecido e validado pelo
                  estabelecimento, conforme as regras do local.
                </p>
              </SectionCard>

              {/* 2. Dados coletados */}
              <SectionCard id="dados-coletados" title="2. Quais dados pessoais coletamos">
                <p>Coletamos dados conforme seu uso da Plataforma.</p>

                <div className="mt-4 space-y-4">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-zinc-900 mb-3">2.1. Dados de Aniversariantes</h4>
                    <ul className="space-y-2 text-zinc-700">
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Identificação e contato:</strong> nome, e-mail, telefone
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Elegibilidade:</strong> data de nascimento e/ou informações necessárias para validar
                          período de aniversário
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Documentos:</strong> CPF (se a Plataforma exigir para evitar duplicidade/fraude)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Localização informada:</strong> cidade, estado, CEP
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Dados de conta:</strong> senha (armazenada de forma criptografada)
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-zinc-900 mb-3">2.2. Dados de Estabelecimentos/Parceiros</h4>
                    <ul className="space-y-2 text-zinc-700">
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Responsável:</strong> nome, e-mail, telefone
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Dados do negócio:</strong> nome fantasia, razão social, CNPJ
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Endereço e operação:</strong> endereço, categoria, benefícios, regras, horários
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>
                          <strong>Dados comerciais:</strong> plano/assinatura e status de pagamento
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-zinc-900 mb-3">2.3. Login social (Google/Apple)</h4>
                    <p className="text-zinc-700">
                      Se você optar por login social, podemos receber do provedor: nome, e-mail, foto e identificador.
                      Usamos para criar e autenticar sua conta.
                    </p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-zinc-900 mb-3">2.4. Localização do dispositivo (opcional)</h4>
                    <p className="text-zinc-700">
                      Se você permitir, podemos coletar localização aproximada para mostrar estabelecimentos próximos.
                      Você pode negar ou revogar a qualquer momento nas permissões do dispositivo.
                    </p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-zinc-900 mb-3">2.5. Dados técnicos e de uso</h4>
                    <ul className="space-y-2 text-zinc-700">
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>IP, data/hora, tipo de navegador/dispositivo, páginas acessadas, logs de erros</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#240046]">•</span>
                        <span>Cookies/armazenamento local para sessão, preferências e métricas</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </SectionCard>

              {/* 3. Finalidades */}
              <SectionCard id="finalidades" title="3. Para que usamos seus dados">
                <p>Usamos seus dados para:</p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Criar e gerenciar sua conta e autenticar login",
                    "Mostrar estabelecimentos e benefícios por cidade/região",
                    "Verificar elegibilidade para benefícios (ex.: mês/dia do aniversário)",
                    "Prevenir fraude, abuso, duplicidade e acessos suspeitos",
                    "Comunicar atualizações importantes e avisos de segurança",
                    "Melhorar performance, experiência e qualidade do produto",
                    "Processar planos/assinaturas de estabelecimentos (via parceiros de pagamento)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#240046]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              {/* 4. Bases legais */}
              <SectionCard id="bases-legais" title="4. Bases legais (LGPD)">
                <p>Tratamos dados com base em:</p>
                <div className="mt-4 space-y-3">
                  {[
                    { title: "Execução de contrato", desc: "para fornecer a Plataforma e suas funções" },
                    {
                      title: "Legítimo interesse",
                      desc: "segurança, prevenção a fraudes, melhoria do produto e análises internas",
                    },
                    {
                      title: "Consentimento",
                      desc: "quando você habilitar localização precisa, notificações push e/ou cookies não essenciais",
                    },
                    {
                      title: "Obrigação legal/regulatória",
                      desc: "quando a lei exigir retenção ou fornecimento de dados",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#240046] font-medium shrink-0">•</span>
                      <span>
                        <strong className="text-zinc-900">{item.title}:</strong> {item.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* 5. Compartilhamento */}
              <SectionCard id="compartilhamento" title="5. Compartilhamento de dados">
                <div className="bg-[#240046]/5 border border-[#240046]/10 rounded-2xl p-4 mb-4">
                  <p className="font-semibold text-[#240046]">
                    Nós não vendemos, alugamos ou comercializamos seus dados pessoais.
                  </p>
                </div>

                <p>Compartilhamos apenas quando necessário:</p>

                <div className="mt-4 space-y-4">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-zinc-900 mb-2">5.1. Com estabelecimentos parceiros</h4>
                    <p className="text-zinc-700">
                      Quando você decide usar um benefício, o estabelecimento pode precisar confirmar elegibilidade.
                      Compartilhamos o mínimo necessário: nome e indicação de elegibilidade (ex.: "mês do aniversário").
                      Não compartilhamos CPF, telefone ou endereço completo, salvo exigência operacional específica e
                      informada.
                    </p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-zinc-900 mb-2">5.2. Com fornecedores de tecnologia</h4>
                    <p className="text-zinc-700 mb-3">Podemos usar provedores para operar a Plataforma:</p>
                    <ul className="space-y-1 text-zinc-600 text-sm">
                      <li>• Hospedagem/DB (ex.: Supabase)</li>
                      <li>• Pagamentos (ex.: Stripe)</li>
                      <li>• Mapas (ex.: Google Maps)</li>
                      <li>• Métricas (ex.: Google Analytics)</li>
                    </ul>
                    <p className="text-zinc-700 mt-3">
                      Esses fornecedores tratam dados como operadores, conforme nossas instruções e contratos.
                    </p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                    <h4 className="font-semibold text-zinc-900 mb-2">5.3. Com autoridades</h4>
                    <p className="text-zinc-700">Quando houver obrigação legal, ordem judicial ou requisição válida.</p>
                  </div>
                </div>
              </SectionCard>

              {/* 6. Pagamentos */}
              <SectionCard id="pagamentos" title="6. Pagamentos e dados financeiros">
                <p>Planos e assinaturas podem ser processados por parceiros (ex.: Stripe).</p>
                <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                  <p className="font-medium text-zinc-900">
                    Não armazenamos dados completos de cartão (número, CVV) em nossos servidores.
                  </p>
                  <p className="mt-2 text-zinc-700">
                    Armazenamos somente informações necessárias de cobrança (status, histórico, identificadores e notas
                    fiscais quando aplicável).
                  </p>
                </div>
              </SectionCard>

              {/* 7. Permissões */}
              <SectionCard id="permissoes" title="7. Permissões do dispositivo">
                <p>Podemos solicitar permissões:</p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#240046]">•</span>
                    <span>
                      <strong>Localização:</strong> para mostrar estabelecimentos próximos (opcional)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#240046]">•</span>
                    <span>
                      <strong>Notificações:</strong> para alertas relevantes (opcional)
                    </span>
                  </li>
                </ul>
                <p className="mt-4 text-zinc-600">
                  Você pode recusar ou desativar a qualquer momento nas configurações do dispositivo.
                </p>
              </SectionCard>

              {/* 8. Cookies */}
              <SectionCard id="cookies" title="8. Cookies e armazenamento local">
                <p>Usamos cookies e tecnologias similares para:</p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Manter você logado e autenticar sessão",
                    "Salvar preferências (cidade, filtros, idioma)",
                    "Medir uso e performance (analytics)",
                    "Aumentar segurança e prevenir fraudes",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#240046]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                  <p className="text-zinc-700">
                    <strong className="text-zinc-900">Controle:</strong> você pode gerenciar cookies no navegador e,
                    quando aplicável, via banner de consentimento.
                  </p>
                </div>
              </SectionCard>

              {/* 9. Transferência */}
              <SectionCard id="transferencia" title="9. Transferência internacional" icon={Globe}>
                <p>
                  Alguns fornecedores podem processar dados fora do Brasil. Nesses casos, adotamos medidas para garantir
                  nível adequado de proteção (contratos, boas práticas e mecanismos reconhecidos), conforme LGPD.
                </p>
              </SectionCard>

              {/* 10. Retenção */}
              <SectionCard id="retencao" title="10. Por quanto tempo guardamos" icon={Clock}>
                <p>Guardamos dados enquanto sua conta estiver ativa e enquanto necessário para as finalidades acima.</p>
                <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                  <p className="font-medium text-zinc-900 mb-2">Ao solicitar exclusão:</p>
                  <ul className="space-y-2 text-zinc-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#240046]">•</span>
                      <span>Removemos ou anonimizamos dados em até 30 dias, quando possível</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#240046]">•</span>
                      <span>Podemos reter dados mínimos por obrigações legais, prevenção a fraudes e segurança</span>
                    </li>
                  </ul>
                </div>
              </SectionCard>

              {/* 11. Segurança */}
              <SectionCard id="seguranca" title="11. Segurança da informação" icon={Lock}>
                <p>Adotamos medidas técnicas e organizacionais, como:</p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Senhas criptografadas/hasheadas",
                    "Controles de acesso e autenticação",
                    "Monitoramento de acessos suspeitos e logs",
                    "Práticas de minimização de dados",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#240046]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-amber-800 text-sm">
                    Nenhum sistema é 100% imune. Em caso de incidente relevante, adotaremos medidas de contenção e
                    comunicação conforme LGPD e orientações da ANPD.
                  </p>
                </div>
              </SectionCard>

              {/* 12. Seus direitos */}
              <SectionCard id="seus-direitos" title="12. Seus direitos (LGPD)" icon={UserCheck}>
                <p>Você pode solicitar:</p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Confirmação de tratamento e acesso",
                    "Correção de dados",
                    "Exclusão/anonimização (quando aplicável)",
                    "Portabilidade (quando aplicável)",
                    "Informação sobre compartilhamento",
                    "Revogação de consentimento",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#240046]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-[#240046]/5 border border-[#240046]/10 rounded-2xl p-4">
                  <p className="text-zinc-700 mb-2">
                    <strong className="text-zinc-900">Canal:</strong>
                  </p>
                  <a
                    href="mailto:contato@aniversariantevip.com.br"
                    className="text-[#240046] hover:text-[#3C096C] font-medium transition-colors"
                  >
                    contato@aniversariantevip.com.br
                  </a>
                  <p className="mt-3 text-sm text-zinc-600">
                    <strong>Prazo:</strong> respondemos em até 15 dias úteis, quando possível.
                  </p>
                </div>
              </SectionCard>

              {/* 13. Menores */}
              <SectionCard id="menores" title="13. Menores de idade">
                <p>
                  A Plataforma não é destinada a menores de 18 anos. Se identificarmos uso por menor, poderemos
                  restringir ou encerrar a conta.
                </p>
              </SectionCard>

              {/* 14. Atualizações */}
              <SectionCard id="atualizacoes" title="14. Atualizações desta Política">
                <p>
                  Podemos atualizar esta Política para refletir mudanças no produto ou exigências legais. Quando houver
                  mudanças relevantes, comunicaremos por e-mail e/ou aviso na Plataforma.
                </p>
              </SectionCard>

              {/* 15. Contato */}
              <SectionCard id="contato" title="15. Contato" icon={Mail}>
                <p className="mb-4">Dúvidas e solicitações LGPD:</p>
                <div className="bg-[#240046]/5 border border-[#240046]/10 rounded-2xl p-4">
                  <a
                    href="mailto:contato@aniversariantevip.com.br"
                    className="text-[#240046] hover:text-[#3C096C] font-medium text-lg transition-colors"
                  >
                    contato@aniversariantevip.com.br
                  </a>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
