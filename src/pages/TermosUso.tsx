import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useSEO } from "@/hooks/useSEO";
import { SEO_CONTENT } from "@/constants/seo";
import { FileText, ChevronDown, Mail, UserCheck, Building2, ShieldX, XCircle, Scale } from "lucide-react";
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
  { id: "sobre", title: "1. Sobre o serviço", shortTitle: "Sobre" },
  { id: "aceitacao", title: "2. Aceitação", shortTitle: "Aceitação" },
  { id: "conta", title: "3. Sua conta", shortTitle: "Sua conta" },
  { id: "aniversariantes", title: "4. Para aniversariantes", shortTitle: "Aniversariantes" },
  { id: "estabelecimentos", title: "5. Para estabelecimentos", shortTitle: "Estabelecimentos" },
  { id: "conduta", title: "6. Conduta proibida", shortTitle: "Conduta" },
  { id: "responsabilidade", title: "7. Nossa responsabilidade", shortTitle: "Responsabilidade" },
  { id: "cancelamento", title: "8. Cancelamento", shortTitle: "Cancelamento" },
  { id: "alteracoes", title: "9. Alterações", shortTitle: "Alterações" },
  { id: "lei", title: "10. Lei aplicável", shortTitle: "Lei aplicável" },
  { id: "contato", title: "11. Contato", shortTitle: "Contato" },
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

export default function TermosUso() {
  const [activeSection, setActiveSection] = useState("sobre");

  useSEO({
    title: SEO_CONTENT.termosUso.title,
    description: SEO_CONTENT.termosUso.description,
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
              <FileText className="w-5 h-5 text-[#240046]" />
            </div>
            <span className="text-sm text-[#240046] font-medium uppercase tracking-wider">Termos legais</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight">Termos de Uso</h1>
          <p className="mt-3 text-base text-zinc-600 leading-relaxed max-w-2xl">
            Estes termos regulam o uso da plataforma Aniversariante VIP por aniversariantes e estabelecimentos
            parceiros.
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
              {/* 1. Sobre */}
              <SectionCard id="sobre" title="1. Sobre o serviço">
                <p>
                  O <strong className="text-zinc-900">Aniversariante VIP</strong> conecta aniversariantes a
                  estabelecimentos que oferecem benefícios especiais. Atuamos como intermediário, facilitando a
                  descoberta de vantagens exclusivas no período do seu aniversário.
                </p>
              </SectionCard>

              {/* 2. Aceitação */}
              <SectionCard id="aceitacao" title="2. Aceitação">
                <p>Ao criar uma conta, você concorda com estes termos. Se não concordar, não use a plataforma.</p>
              </SectionCard>

              {/* 3. Sua conta */}
              <SectionCard id="conta" title="3. Sua conta" icon={UserCheck}>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#240046]">•</span>
                    <span>Forneça informações verdadeiras e atualizadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#240046]">•</span>
                    <span>Você é responsável por manter sua senha segura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#240046]">•</span>
                    <span>É necessário ter 18 anos ou mais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#240046]">•</span>
                    <span>Apenas uma conta por CPF</span>
                  </li>
                </ul>
              </SectionCard>

              {/* 4. Para aniversariantes */}
              <SectionCard id="aniversariantes" title="4. Para aniversariantes">
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                  <p>
                    <strong className="text-zinc-900">Gratuito:</strong> O uso da plataforma é 100% gratuito.
                  </p>
                  <p>
                    <strong className="text-zinc-900">Pessoal:</strong> Os benefícios são intransferíveis. Venda ou
                    repasse é proibido.
                  </p>
                  <p>
                    <strong className="text-zinc-900">Validade:</strong> Cada benefício tem regras próprias (dia, semana
                    ou mês do aniversário).
                  </p>
                  <p>
                    <strong className="text-zinc-900">Validação:</strong> O estabelecimento pode recusar em caso de
                    suspeita de fraude.
                  </p>
                </div>
              </SectionCard>

              {/* 5. Para estabelecimentos */}
              <SectionCard id="estabelecimentos" title="5. Para estabelecimentos" icon={Building2}>
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                  <p>
                    <strong className="text-zinc-900">Assinatura:</strong> É necessário manter um plano ativo.
                  </p>
                  <p>
                    <strong className="text-zinc-900">Responsabilidade:</strong> O estabelecimento é responsável pelo
                    benefício oferecido.
                  </p>
                  <p>
                    <strong className="text-zinc-900">Honrar:</strong> Deve cumprir os benefícios anunciados conforme
                    suas regras.
                  </p>
                  <p>
                    <strong className="text-zinc-900">Alterações:</strong> Mudanças devem ser atualizadas imediatamente
                    na plataforma.
                  </p>
                </div>
              </SectionCard>

              {/* 6. Conduta proibida */}
              <SectionCard id="conduta" title="6. Conduta proibida" icon={XCircle}>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span>Usar para finalidade ilegal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span>Criar contas falsas ou usar dados de terceiros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span>Tentar burlar verificações ou sistemas de segurança</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✕</span>
                    <span>Usar bots ou automação não autorizada</span>
                  </li>
                </ul>
              </SectionCard>

              {/* 7. Nossa responsabilidade */}
              <SectionCard id="responsabilidade" title="7. Nossa responsabilidade" icon={ShieldX}>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-amber-900">
                    Somos <strong>intermediários</strong>. Não nos responsabilizamos pela qualidade, disponibilidade ou
                    características dos produtos/serviços dos estabelecimentos. Problemas devem ser resolvidos
                    diretamente com o estabelecimento.
                  </p>
                </div>
              </SectionCard>

              {/* 8. Cancelamento */}
              <SectionCard id="cancelamento" title="8. Cancelamento">
                <p>Você pode cancelar sua conta a qualquer momento nas configurações ou entrando em contato conosco.</p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#240046]">•</span>
                    <span>Dados excluídos em até 30 dias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#240046]">•</span>
                    <span>Benefícios não utilizados serão invalidados</span>
                  </li>
                </ul>
                <p className="mt-3 text-sm text-zinc-500">
                  Podemos suspender contas em caso de violação dos termos ou suspeita de fraude.
                </p>
              </SectionCard>

              {/* 9. Alterações */}
              <SectionCard id="alteracoes" title="9. Alterações">
                <p>
                  Podemos atualizar estes termos periodicamente. O uso continuado após alterações significa que você
                  aceita os novos termos.
                </p>
              </SectionCard>

              {/* 10. Lei aplicável */}
              <SectionCard id="lei" title="10. Lei aplicável" icon={Scale}>
                <p>Estes termos são regidos pelas leis do Brasil. Foro: comarca de Florianópolis/SC.</p>
              </SectionCard>

              {/* 11. Contato */}
              <SectionCard id="contato" title="11. Contato" icon={Mail}>
                <p className="mb-4">Dúvidas sobre os termos:</p>
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
