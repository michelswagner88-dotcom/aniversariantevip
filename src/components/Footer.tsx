import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { CONTATOS } from "@/lib/constants";

export const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-950 border-t border-white/[0.08]">
      <div 
        className="container mx-auto px-4 py-10 sm:py-12" 
        style={{ paddingBottom: 'max(3rem, calc(180px + env(safe-area-inset-bottom, 0px)))' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
          {/* Coluna 1 - Marca */}
          <div>
            <Link to="/" className="inline-block mb-4 group">
              <h2 className="font-display font-extrabold text-xl md:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 transition-all duration-300 group-hover:scale-105">
                ANIVERSARIANTE VIP
              </h2>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Guia de benefícios para aniversariantes em todo o Brasil.
            </p>
          </div>

          {/* Coluna 2 - Aniversariantes */}
          <div>
            <h3 className="font-bold mb-4 text-xs uppercase tracking-wider bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Para Você
            </h3>
            <nav className="flex flex-col gap-2.5">
              <Link 
                to="/como-funciona" 
                className="text-sm text-slate-300 opacity-80 hover:text-violet-400 hover:opacity-100 transition-all duration-180 hover:translate-x-0.5"
              >
                Como Funciona
              </Link>
              <Link 
                to="/explorar" 
                className="text-sm text-slate-300 opacity-80 hover:text-violet-400 hover:opacity-100 transition-all duration-180 hover:translate-x-0.5"
              >
                Explorar
              </Link>
              <Link 
                to="/faq" 
                className="text-sm text-slate-300 opacity-80 hover:text-violet-400 hover:opacity-100 transition-all duration-180 hover:translate-x-0.5"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Coluna 3 - Estabelecimentos */}
          <div>
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Para Estabelecimentos
            </h3>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/seja-parceiro" 
                className="text-sm text-slate-400 hover:text-violet-400 transition-all hover:translate-x-1"
              >
                Seja Parceiro
              </Link>
              <Link 
                to="/login/estabelecimento" 
                className="text-sm text-slate-400 hover:text-violet-400 transition-all hover:translate-x-1"
              >
                Área do Estabelecimento
              </Link>
            </nav>
          </div>

          {/* Coluna 4 - Legal */}
          <div>
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Legal
            </h3>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/termos-uso" 
                className="text-sm text-slate-400 hover:text-violet-400 transition-all hover:translate-x-1"
              >
                Termos de Uso
              </Link>
              <Link 
                to="/politica-privacidade" 
                className="text-sm text-slate-400 hover:text-violet-400 transition-all hover:translate-x-1"
              >
                Política de Privacidade
              </Link>
            </nav>
          </div>
        </div>

        {/* Linha de Copyright Premium */}
        <div className="border-t border-white/[0.06] mt-10 pt-8">
          <p className="text-center text-sm text-slate-400 opacity-75">
            © {new Date().getFullYear()} Aniversariante VIP. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
