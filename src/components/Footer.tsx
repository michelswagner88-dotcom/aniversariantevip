import { Link } from "react-router-dom";
import { Gift, Globe, MessageCircle, Instagram, Mail, Shield, Lock, CreditCard } from "lucide-react";
import { useCarol } from "./ChatBot/CarolProvider";

export const Footer = () => {
  const { abrirCarol } = useCarol();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#240046]" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}>
      {/* Main Footer */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo e Descrição */}
          <div className="lg:col-span-2">
            <Link to="/" className="group inline-flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-[#9D4EDD] to-[#22D3EE] bg-clip-text text-transparent">
                  ANIVERSARIANTE{" "}
                </span>
                <span className="bg-gradient-to-r from-[#C77DFF] to-[#22D3EE] bg-clip-text text-transparent">VIP</span>
              </span>
            </Link>
            <p className="text-white/70 text-sm mb-6 max-w-xs leading-relaxed">
              O maior guia de benefícios para aniversariantes do Brasil. Descubra vantagens exclusivas para o seu dia
              especial.
            </p>

            {/* Redes Sociais */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/aniversariantevip"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://wa.me/5561999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/10 hover:bg-emerald-500 border border-white/20 hover:border-transparent rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </a>
              <a
                href="mailto:contato@aniversariantevip.com.br"
                className="w-11 h-11 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Links - Descubra */}
          <div>
            <h4 className="font-semibold text-white mb-4">Descubra</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/sobre" className="text-sm text-white/70 hover:text-white transition-colors">
                Sobre Nós
              </Link>
              <Link to="/como-funciona" className="text-sm text-white/70 hover:text-white transition-colors">
                Como Funciona
              </Link>
              <Link to="/explorar" className="text-sm text-white/70 hover:text-white transition-colors">
                Explorar
              </Link>
            </nav>
          </div>

          {/* Links - Parceiros */}
          <div>
            <h4 className="font-semibold text-white mb-4">Parceiros</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/seja-parceiro" className="text-sm text-white/70 hover:text-white transition-colors">
                Seja Parceiro
              </Link>
              <Link to="/login/estabelecimento" className="text-sm text-white/70 hover:text-white transition-colors">
                Área do Parceiro
              </Link>
              <Link to="/afiliado" className="text-sm text-white/70 hover:text-white transition-colors">
                Indique e Ganhe
              </Link>
            </nav>
          </div>

          {/* Links - Suporte */}
          <div>
            <h4 className="font-semibold text-white mb-4">Suporte</h4>
            <nav className="flex flex-col gap-3">
              <button
                onClick={abrirCarol}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors text-left"
              >
                <MessageCircle size={14} />
                Fale com a Carol
              </button>
              <Link to="/faq" className="text-sm text-white/70 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link to="/politica-privacidade" className="text-sm text-white/70 hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link to="/termos-uso" className="text-sm text-white/70 hover:text-white transition-colors">
                Termos de Uso
              </Link>
            </nav>
          </div>
        </div>

        {/* Trust Seals */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Shield className="w-5 h-5 text-white" />
            <span>Site Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Lock className="w-5 h-5 text-white" />
            <span>LGPD Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <CreditCard className="w-5 h-5 text-white" />
            <span>Pagamento Seguro</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-white/10">
          <p className="text-white/50 text-sm">© {currentYear} Aniversariante VIP. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Globe className="w-4 h-4" />
            <span>Português (BR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
