import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { CONTATOS } from "@/lib/constants";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-vip-dark border-t border-border/50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Coluna 1 - Marca */}
          <div>
            <Link to="/" className="flex items-center mb-3 group">
              <img 
                src={logo} 
                alt="Aniversariante VIP" 
                className="h-16 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Guia de benefícios para aniversariantes em todo o Brasil.
            </p>
          </div>

          {/* Coluna 2 - Aniversariantes */}
          <div>
            <h3 className="font-semibold text-foreground mb-2.5 text-xs uppercase tracking-wider">
              Aniversariantes
            </h3>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/como-funciona" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Como Funciona
              </Link>
              <Link 
                to="/cadastro/aniversariante" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Cadastrar-se
              </Link>
              <Link 
                to="/login/aniversariante" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Área do Aniversariante
              </Link>
            </nav>
          </div>

          {/* Coluna 3 - Estabelecimentos */}
          <div>
            <h3 className="font-semibold text-foreground mb-2.5 text-xs uppercase tracking-wider">
              Estabelecimentos
            </h3>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/seja-parceiro" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Seja Parceiro
              </Link>
              <Link 
                to="/planos" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Planos para Estabelecimentos
              </Link>
              <Link 
                to="/login/estabelecimento" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Área do Estabelecimento
              </Link>
              <Link 
                to="/faq" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Coluna 4 - Suporte e Redes Sociais */}
          <div>
            <h3 className="font-semibold text-foreground mb-2.5 text-xs uppercase tracking-wider">
              Suporte
            </h3>
            <div className="flex flex-col gap-2 mb-4">
              <a
                href={`mailto:${CONTATOS.email}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="break-all">{CONTATOS.email}</span>
              </a>
              <a
                href={`https://wa.me/${CONTATOS.telefoneProprietario.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                {CONTATOS.telefoneProprietario}
              </a>
            </div>

            <h4 className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wider">
              Redes Sociais
            </h4>
            <a
              href={CONTATOS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
              @aniversariantevip
            </a>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="border-t border-border/30 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-3 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Aniversariante VIP. Todos os direitos reservados.
            </p>
            <div className="flex gap-3 text-xs">
              <Link to="/politica-privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/termos-uso" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
