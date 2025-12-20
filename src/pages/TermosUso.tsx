import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { FileText, ChevronDown, Mail, Building2 } from "lucide-react";
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
  { id: "identificacao", title: "0. Identificação", shortTitle: "Identificação" },
  { id: "definicoes", title: "1. Definições", shortTitle: "Definições" },
  { id: "sobre-o-servico", title: "2. Sobre o serviço", shortTitle: "Sobre o serviço" },
  { id: "aceitacao", title: "3. Aceitação e elegibilidade", shortTitle: "Aceitação" },
  { id: "sua-conta", title: "4. Sua Conta", shortTitle: "Sua Conta" },
  { id: "aniversariantes", title: "5. Regras para Aniversariantes", shortTitle: "Aniversariantes" },
  { id: "estabelecimentos", title: "6. Regras para Estabelecimentos", shortTitle: "Estabelecimentos" },
  { id: "pagamentos", title: "7. Pagamentos e planos", shortTitle: "Pagamentos" },
  { id: "conduta", title: "8. Conduta proibida", shortTitle: "Conduta" },
  { id: "propriedade", title: "9. Propriedade intelectual", shortTitle: "Propriedade" },
  { id: "terceiros", title: "10. Links de terceiros", shortTitle: "Terceiros" },
  { id: "disponibilidade", title: "11. Disponibilidade", shortTitle: "Disponibilidade" },
  { id: "limitacao", title: "12. Limitação de responsabilidade", shortTitle: "Limitação" },
  { id: "cancelamento", title: "13. Cancelamento", shortTitle: "Cancelamento" },
  { id: "lgpd", title: "14. Privacidade e LGPD", shortTitle: "LGPD" },
  { id: "alteracoes", title: "15. Alterações", shortTitle: "Alterações" },
  { id: "foro", title: "16. Lei aplicável", shortTitle: "Foro" },
  { id: "contato", title: "17. Contato", shortTitle: "Contato" },
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
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
      >
        <span className="text-sm font-medium text-white">Índice</span>
        <ChevronDown
          className={cn("w-4 h-4 text-white/60 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="mt-2 bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                activeSection === section.id
                  ? "bg-[#7C3AED]/20 text-[#C77DFF]"
                  : "text-white/60 hover:text-white hover:bg-white/5",
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
        <h3 className="text-sm font-semibold text-white mb-4">Índice</h3>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-[#7C3AED]/20 text-[#C77DFF] font-medium"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5",
                )}
              >
                {section.shortTitle || section.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export default function TermosUso() {
  const [activeSection, setActiveSection] = useState("identificacao");

  useSEO({
    title: SEO_CONTENT.termosUso.title,
    description: SEO_CONTENT.termosUso.description,
  });

  // Intersection Observer para destacar seção ativa
  // (simplificado - pode melhorar com useEffect + IntersectionObserver)

  return (
    <div className="min-h-screen bg-[#240046]">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 pb-8 sm:pb-10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-6">
            <BackButton />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#7C3AED]/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#C77DFF]" />
            </div>
            <span className="text-sm text-[#C77DFF] font-medium uppercase tracking-wider">Termos legais</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Termos de Uso</h1>
          <p className="mt-2 text-sm text-white/50">
            Atualizado em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* TOC Mobile */}
          <TOCMobile activeSection={activeSection} />

          {/* Grid: TOC + Conteúdo */}
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
            {/* TOC Desktop */}
            <TOCDesktop activeSection={activeSection} />

            {/* Conteúdo */}
            <div className="space-y-10 sm:space-y-12">
              {/* 0. Identificação */}
              <section id="identificacao" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">0. Identificação do responsável</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Building2 className="w-5 h-5 text-[#C77DFF] mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Aniversariante VIP</p>
                      <p className="text-sm text-white/60 mt-1">CNPJ: (em processo de registro)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#C77DFF] mt-0.5" />
                    <a
                      href="mailto:contato@aniversariantevip.com.br"
                      className="text-[#C77DFF] hover:text-white transition-colors"
                    >
                      contato@aniversariantevip.com.br
                    </a>
                  </div>
                </div>
              </section>

              {/* 1. Definições */}
              <section id="definicoes" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">1. Definições</h2>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-4">Para fins destes Termos:</p>
                <div className="space-y-3">
                  {[
                    { term: "Usuário", def: "qualquer pessoa que acessa a Plataforma, com ou sem conta." },
                    {
                      term: "Aniversariante",
                      def: "Usuário que utiliza a Plataforma para buscar e usufruir Benefícios.",
                    },
                    {
                      term: "Estabelecimento",
                      def: 'pessoa jurídica que anuncia e/ou oferece Benefícios por meio da Plataforma, podendo manter plano/assinatura ("Parceiro").',
                    },
                    {
                      term: "Benefício",
                      def: "vantagem ofertada pelo Estabelecimento (ex.: desconto, cortesia, brinde, condição especial), sempre sujeita a regras.",
                    },
                    {
                      term: "Conteúdo",
                      def: "textos, imagens, marcas, logotipos, descrições, regras, dados e demais informações exibidas na Plataforma.",
                    },
                    { term: "Conta", def: "cadastro do Usuário que permite acesso a recursos e personalizações." },
                    {
                      term: "Plano/Assinatura",
                      def: "contratação paga por Estabelecimentos para recursos, exposição e manutenção de perfil.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#C77DFF] font-medium shrink-0">{item.term}:</span>
                      <span className="text-sm sm:text-base text-white/70">{item.def}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. Sobre o serviço */}
              <section id="sobre-o-servico" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">2. Sobre o serviço</h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">2.1.</strong> O Aniversariante VIP conecta aniversariantes a
                    estabelecimentos que oferecem Benefícios especiais. Atuamos como intermediadores de descoberta e
                    informação, facilitando o acesso a vantagens disponíveis no período do aniversário.
                  </p>
                  <p>
                    <strong className="text-white">2.2.</strong> A Plataforma não é fornecedora dos produtos/serviços
                    prestados pelos Estabelecimentos (ex.: alimentação, hospedagem, serviços estéticos, entretenimento
                    etc.), não garante disponibilidade, qualidade, execução, segurança, preços, agenda, lotação ou
                    qualquer obrigação operacional do Estabelecimento.
                  </p>
                  <p>
                    <strong className="text-white">2.3.</strong> O Benefício é sempre oferecido e executado pelo
                    Estabelecimento, que define condições e validação no local.
                  </p>
                </div>
              </section>

              {/* 3. Aceitação */}
              <section id="aceitacao" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">3. Aceitação e elegibilidade</h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">3.1.</strong> Ao criar uma Conta ou utilizar a Plataforma, você
                    concorda com estes Termos e com demais políticas aplicáveis.
                  </p>
                  <p>
                    <strong className="text-white">3.2.</strong> Idade mínima: para criar Conta e utilizar recursos com
                    identificação, é necessário ter 18 anos ou mais.
                  </p>
                  <p>
                    <strong className="text-white">3.3.</strong> Podemos solicitar confirmações adicionais (ex.:
                    verificação de e-mail/telefone) e implementar mecanismos antifraude.
                  </p>
                </div>
              </section>

              {/* 4. Sua Conta */}
              <section id="sua-conta" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">4. Sua Conta</h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">4.1.</strong> Você deve fornecer informações verdadeiras, completas e
                    atualizadas.
                  </p>
                  <p>
                    <strong className="text-white">4.2.</strong> Você é responsável por manter sua senha e credenciais
                    seguras e por toda atividade realizada em sua Conta.
                  </p>
                  <p>
                    <strong className="text-white">4.3.</strong> Uma Conta por CPF, salvo autorização expressa pela
                    Plataforma.
                  </p>
                  <p>
                    <strong className="text-white">4.4.</strong> É proibido compartilhar, vender, ceder, emprestar ou
                    transferir sua Conta.
                  </p>
                  <p>
                    <strong className="text-white">4.5.</strong> Se houver suspeita de acesso não autorizado, você deve
                    comunicar imediatamente pelo e-mail de contato.
                  </p>
                </div>
              </section>

              {/* 5. Regras para Aniversariantes */}
              <section id="aniversariantes" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">5. Regras para Aniversariantes</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Gratuito:</strong> o uso da Plataforma pelo Aniversariante é 100%
                    gratuito.
                  </p>
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Pessoal e intransferível:</strong> Benefícios são destinados ao
                    Aniversariante e não podem ser vendidos, repassados ou utilizados por terceiros.
                  </p>
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Regras específicas:</strong> cada Benefício possui regras próprias
                    (ex.: válido no dia, semana ou mês do aniversário; itens incluídos/excluídos; necessidade de
                    reserva; horário; limite de uso).
                  </p>
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Validação no local:</strong> o Estabelecimento poderá exigir
                    documento oficial com foto para comprovar a condição de aniversariante.
                  </p>
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Sujeito a confirmação:</strong> recomenda-se confirmar com o
                    Estabelecimento antes de se deslocar, pois benefícios podem depender de disponibilidade.
                  </p>
                </div>
                <div className="mt-4 p-4 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl">
                  <p className="text-sm text-white/80">
                    <strong className="text-[#C77DFF]">Recusa:</strong> O Estabelecimento pode recusar o benefício em
                    caso de uso fora das regras, inconsistência de documentos, indícios de fraude ou conduta inadequada.
                  </p>
                </div>
              </section>

              {/* 6. Regras para Estabelecimentos */}
              <section id="estabelecimentos" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">6. Regras para Estabelecimentos</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Assinatura/Plano:</strong> o Estabelecimento pode precisar manter
                    Plano ativo para publicar e obter recursos adicionais.
                  </p>
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Responsabilidade:</strong> o Estabelecimento é integralmente
                    responsável pela veracidade das informações, cumprimento do benefício, qualidade do serviço e
                    atendimento ao consumidor.
                  </p>
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Dever de honrar:</strong> o Estabelecimento deve cumprir os
                    Benefícios anunciados conforme regras divulgadas.
                  </p>
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Atualização imediata:</strong> mudanças em benefício, regras,
                    horários e disponibilidade devem ser atualizadas imediatamente na Plataforma.
                  </p>
                  <p className="text-sm sm:text-base text-white/70">
                    <strong className="text-white">Direitos de conteúdo:</strong> o Estabelecimento declara possuir
                    direitos sobre fotos, marcas e descrições inseridas.
                  </p>
                </div>
              </section>

              {/* 7. Pagamentos */}
              <section id="pagamentos" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">7. Pagamentos, planos e cobranças</h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">7.1.</strong> Planos podem ser recorrentes
                    (mensal/trimestral/semestral/anual) e renovados automaticamente.
                  </p>
                  <p>
                    <strong className="text-white">7.2.</strong> Pagamentos podem ser processados por
                    provedores/gateways terceiros.
                  </p>
                  <p>
                    <strong className="text-white">7.3.</strong> Inadimplência pode resultar em suspensão do perfil,
                    perda de destaque ou bloqueio temporário.
                  </p>
                  <p>
                    <strong className="text-white">7.4.</strong> Regras de cancelamento e eventuais reembolsos seguem a
                    página comercial e/ou contrato vigente.
                  </p>
                  <p>
                    <strong className="text-white">7.5.</strong> Alterações de preço serão comunicadas com antecedência
                    razoável.
                  </p>
                </div>
              </section>

              {/* 8. Conduta proibida */}
              <section id="conduta" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">8. Conduta proibida</h2>
                <p className="text-sm sm:text-base text-white/70 mb-4">É proibido:</p>
                <ul className="space-y-2 text-sm sm:text-base text-white/70">
                  {[
                    "usar a Plataforma para fins ilegais, fraudulentos ou abusivos",
                    "criar contas falsas, usar dados de terceiros ou se passar por outra pessoa",
                    "tentar burlar verificações, validações e mecanismos antifraude",
                    "explorar vulnerabilidades, fazer engenharia reversa ou ataques",
                    "usar bots, scrapers, automações ou coleta de dados não autorizada",
                    "copiar, reproduzir ou explorar comercialmente a Plataforma sem autorização",
                    "publicar conteúdo ofensivo, discriminatório, difamatório ou ilegal",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-400 shrink-0">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 9. Propriedade intelectual */}
              <section id="propriedade" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                  9. Conteúdo e propriedade intelectual
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">9.1.</strong> A Plataforma, marca, layout, interface, textos, banco
                    de dados, design, código e elementos visuais são protegidos por leis de propriedade intelectual.
                  </p>
                  <p>
                    <strong className="text-white">9.2.</strong> Nenhuma disposição destes Termos concede ao Usuário ou
                    ao Estabelecimento qualquer direito de propriedade sobre a Plataforma.
                  </p>
                  <p>
                    <strong className="text-white">9.3.</strong> O Estabelecimento concede licença não exclusiva,
                    gratuita e revogável para exibição de seus conteúdos na Plataforma durante a parceria.
                  </p>
                </div>
              </section>

              {/* 10. Links de terceiros */}
              <section id="terceiros" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">10. Links e serviços de terceiros</h2>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  A Plataforma pode conter links e integrações com serviços de terceiros (ex.: WhatsApp, Instagram,
                  Google Maps, Waze, sites externos). Não controlamos tais serviços e não nos responsabilizamos por
                  políticas, disponibilidade, conteúdo ou falhas desses terceiros.
                </p>
              </section>

              {/* 11. Disponibilidade */}
              <section id="disponibilidade" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                  11. Disponibilidade e alterações técnicas
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">11.1.</strong> Podemos realizar manutenções, atualizações, correções
                    e mudanças no layout/funcionalidades.
                  </p>
                  <p>
                    <strong className="text-white">11.2.</strong> Não garantimos funcionamento ininterrupto, mas
                    buscamos manter estabilidade e segurança compatíveis com as melhores práticas.
                  </p>
                </div>
              </section>

              {/* 12. Limitação de responsabilidade */}
              <section id="limitacao" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">12. Limitação de responsabilidade</h2>
                <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-2xl p-5 sm:p-6 mb-4">
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    <strong className="text-white">A Plataforma é intermediadora.</strong> Não nos responsabilizamos por
                    qualidade, execução, disponibilidade e características de produtos/serviços dos Estabelecimentos;
                    recusa do Benefício quando houver descumprimento de regras ou suspeita de fraude; lotação, falta de
                    agenda/estoque, alterações operacionais; danos indiretos (lucros cessantes, perda de oportunidade,
                    etc.).
                  </p>
                </div>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">12.2.</strong> Problemas relacionados à prestação de serviço/produto
                    devem ser resolvidos diretamente com o Estabelecimento, sem prejuízo de eventual suporte da
                    Plataforma para mediação quando possível.
                  </p>
                  <p>
                    <strong className="text-white">12.3.</strong> Nada nestes Termos exclui responsabilidade quando
                    vedado por lei (ex.: dolo, fraude).
                  </p>
                </div>
              </section>

              {/* 13. Cancelamento */}
              <section id="cancelamento" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                  13. Cancelamento, suspensão e encerramento
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">13.1.</strong> O Usuário pode cancelar sua Conta a qualquer momento,
                    via configurações ou solicitando por e-mail.
                  </p>
                  <p>
                    <strong className="text-white">13.2.</strong> Podemos suspender ou encerrar contas em caso de
                    violação destes Termos, suspeita de fraude, risco à segurança ou exigência legal.
                  </p>
                  <p>
                    <strong className="text-white">13.3.</strong> Dados serão excluídos/anonimizados em até 30 dias,
                    salvo necessidade de retenção por obrigações legais.
                  </p>
                  <p>
                    <strong className="text-white">13.4.</strong> Ao encerrar a Conta, benefícios não utilizados podem
                    deixar de estar disponíveis.
                  </p>
                </div>
              </section>

              {/* 14. LGPD */}
              <section id="lgpd" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
                  14. Privacidade, LGPD e dados pessoais
                </h2>
                <div className="bg-gradient-to-br from-[#3C096C] to-[#240046] border border-[#7C3AED]/30 rounded-2xl p-5 sm:p-6">
                  <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed">
                    <p>
                      <strong className="text-white">14.1.</strong> O tratamento de dados pessoais segue a Lei Geral de
                      Proteção de Dados (LGPD) e a Política de Privacidade do Aniversariante VIP.
                    </p>
                    <p>
                      <strong className="text-white">14.2.</strong> Podemos tratar dados para: criação e gestão de
                      Conta; prevenção a fraudes; suporte e comunicação; melhoria de experiência.
                    </p>
                    <p>
                      <strong className="text-white">14.3.</strong> O Usuário poderá exercer seus direitos (acesso,
                      correção, exclusão, portabilidade etc.) conforme LGPD, por meio do canal indicado na Política de
                      Privacidade.
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <a
                      href="mailto:contato@aniversariantevip.com.br"
                      className="text-[#C77DFF] hover:text-white transition-colors font-medium text-sm"
                    >
                      contato@aniversariantevip.com.br
                    </a>
                  </div>
                </div>
              </section>

              {/* 15. Alterações */}
              <section id="alteracoes" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">15. Alterações destes Termos</h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">15.1.</strong> Podemos atualizar estes Termos periodicamente. A
                    versão vigente é a publicada no site.
                  </p>
                  <p>
                    <strong className="text-white">15.2.</strong> Alterações relevantes poderão ser comunicadas por
                    e-mail, aviso na Plataforma ou outro meio razoável.
                  </p>
                  <p>
                    <strong className="text-white">15.3.</strong> O uso continuado após alterações significa aceitação
                    dos novos Termos.
                  </p>
                </div>
              </section>

              {/* 16. Lei aplicável */}
              <section id="foro" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">16. Lei aplicável e foro</h2>
                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  <p>
                    <strong className="text-white">16.1.</strong> Estes Termos são regidos pelas leis do Brasil.
                  </p>
                  <p>
                    <strong className="text-white">16.2.</strong> Fica eleito o foro da comarca de Florianópolis/SC,
                    salvo hipóteses em que a lei determine foro diverso.
                  </p>
                </div>
              </section>

              {/* 17. Contato */}
              <section id="contato" className="scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">17. Contato</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                  <p className="text-sm sm:text-base text-white/70 mb-4">Dúvidas, solicitações e suporte:</p>
                  <a
                    href="mailto:contato@aniversariantevip.com.br"
                    className="inline-flex items-center gap-2 text-[#C77DFF] hover:text-white transition-colors font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    contato@aniversariantevip.com.br
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
