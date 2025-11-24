import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { CONTATOS } from "@/lib/constants";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-10">
          {/* Coluna 1 - Marca */}
          <div>
            <Link to="/" className="inline-block mb-4 group">
              <h2 className="font-display font-extrabold text-xl md:text-2xl tracking-tight text-white transition-all duration-300 group-hover:scale-105">
                ANIVERSARIANTE VIP
              </h2>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Guia de benefícios para aniversariantes em todo o Brasil.
            </p>
          </div>

          {/* Coluna 2 - Aniversariantes */}
          <div>
            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">
              Para Você
            </h3>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/como-funciona" 
                className="text-sm text-slate-400 hover:text-violet-400 transition-all hover:translate-x-1"
              >
                Como Funciona
              </Link>
              <Link 
                to="/" 
                className="text-sm text-slate-400 hover:text-violet-400 transition-all hover:translate-x-1"
              >
                Explorar
              </Link>
              <Link 
                to="/faq" 
                className="text-sm text-slate-400 hover:text-violet-400 transition-all hover:translate-x-1"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Coluna 3 - Estabelecimentos */}
          <div>
            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">
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
            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">
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

        {/* Linha de Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-6">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Aniversariante VIP. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
