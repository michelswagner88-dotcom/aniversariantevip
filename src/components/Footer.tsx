import { Link } from "react-router-dom";
import { Globe, MessageCircle } from "lucide-react";
import { useCarol } from "./ChatBot/CarolProvider";

export const Footer = () => {
  const { abrirCarol } = useCarol();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-8">
        {/* Branding Section */}
        <div className="flex flex-col gap-3 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="group inline-flex flex-col gap-1 w-fit">
            <span className="font-display font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 group-hover:from-cyan-400 group-hover:via-violet-400 group-hover:to-fuchsia-400 transition-all duration-500">
              ANIVERSARIANTE VIP
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            O maior guia de benefícios para aniversariantes do Brasil
          </p>
        </div>

        {/* Links organizados em colunas estilo Airbnb */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Coluna 1 - Descubra */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">
              Descubra
            </h3>
            <nav className="flex flex-col gap-3">
              <Link 
                to="/sobre" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Sobre Nós
              </Link>
              <Link 
                to="/como-funciona" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Como Funciona
              </Link>
              <Link 
                to="/explorar" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Explorar
              </Link>
              <Link 
                to="/faq" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Central de Ajuda
              </Link>
            </nav>
          </div>

          {/* Coluna 2 - Parceiros */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">
              Parceiros
            </h3>
            <nav className="flex flex-col gap-3">
              <Link 
                to="/seja-parceiro" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Seja Parceiro
              </Link>
              <Link 
                to="/login/estabelecimento" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Área do Parceiro
              </Link>
            </nav>
          </div>

          {/* Coluna 3 - Suporte */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">
              Suporte
            </h3>
            <nav className="flex flex-col gap-3">
              <button 
                onClick={abrirCarol}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors text-left"
              >
                <MessageCircle size={14} />
                Fale com a Carol
              </button>
              <Link 
                to="/faq" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                FAQ
              </Link>
              <Link 
                to="/politica-privacidade" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Privacidade
              </Link>
              <Link 
                to="/termos-uso" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Termos
              </Link>
            </nav>
          </div>

          {/* Coluna 4 - Aniversariante VIP */}
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">
              Aniversariante VIP
            </h3>
            <nav className="flex flex-col gap-3">
              <Link 
                to="/auth" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Criar Conta
              </Link>
              <Link 
                to="/afiliado" 
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
              >
                Indique e Ganhe
              </Link>
            </nav>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          {/* Linha inferior */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright e links legais */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>© {currentYear} Aniversariante VIP</span>
              <span className="hidden md:inline">·</span>
              <Link to="/termos-uso" className="hover:underline">Termos</Link>
              <span>·</span>
              <Link to="/politica-privacidade" className="hover:underline">Privacidade</Link>
            </div>
            
            {/* Idioma (estilo Airbnb) */}
            <div className="flex items-center">
              <button className="flex items-center gap-2 text-sm text-slate-900 dark:text-white hover:underline">
                <Globe className="w-4 h-4" />
                <span>Português (BR)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
