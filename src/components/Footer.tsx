import { Link } from "react-router-dom";
import { 
  Gift, Globe, MessageCircle, Instagram, Mail, 
  Shield, Lock, CreditCard, CheckCircle2, Send
} from "lucide-react";
import { useCarol } from "./ChatBot/CarolProvider";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Footer = () => {
  const { abrirCarol } = useCarol();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Por favor, insira um email válido');
      return;
    }
    
    setIsSubmitting(true);
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setEmail('');
    setIsSubmitting(false);
    toast.success('Email cadastrado com sucesso!');
  };
  
  return (
    <footer className="bg-slate-100 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      
      {/* Newsletter Section */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#240046]/10 to-[#3C096C]/10 border border-[#240046]/20 rounded-full px-4 py-1.5 mb-4">
              <Gift className="w-4 h-4 text-[#240046] dark:text-[#A78BFA]" />
              <span className="text-sm font-medium text-[#240046] dark:text-[#A78BFA]">Newsletter exclusiva</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Receba ofertas exclusivas 🎁
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Cadastre seu email e receba os melhores benefícios de aniversário na sua cidade
            </p>
            
            {isSubscribed ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-full px-6 py-3 inline-flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Email cadastrado com sucesso!</span>
              </motion.div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu melhor email"
                    required
                    className="
                      w-full
                      bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      rounded-full
                      pl-12 pr-6 py-3.5
                      text-slate-900 dark:text-white
                      placeholder-slate-400
                      outline-none
                    transition-all duration-300
                    focus:border-[#240046] focus:ring-2 focus:ring-[#240046]/20
                  "
                />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    group
                    bg-gradient-to-r from-[#240046] to-[#3C096C]
                    text-white font-semibold
                    px-6 py-3.5
                    rounded-full
                    transition-all duration-300
                    hover:scale-105 hover:shadow-lg hover:shadow-[#240046]/30
                    active:scale-95
                    disabled:opacity-70 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Cadastrar</span>
                      <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Logo e Descrição */}
          <div className="lg:col-span-2">
            <Link to="/" className="group inline-flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#240046] to-[#3C096C] rounded-xl flex items-center justify-center shadow-lg shadow-[#240046]/20 transition-transform group-hover:scale-110 group-hover:rotate-6">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#240046] via-[#3C096C] to-[#240046] dark:from-[#A78BFA] dark:via-[#A78BFA] dark:to-[#A78BFA]">
                ANIVERSARIANTE VIP
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
              O maior guia de benefícios para aniversariantes do Brasil. 
              Descubra vantagens exclusivas para o seu dia especial.
            </p>
            
            {/* Redes Sociais Premium */}
            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com/aniversariantevip" 
                target="_blank" 
                rel="noopener noreferrer"
                className="
                  w-11 h-11
                  bg-gradient-to-br from-[#240046]/10 to-[#3C096C]/10
                  hover:from-[#240046] hover:to-[#3C096C]
                  border border-[#240046]/20 hover:border-transparent
                  rounded-xl
                  flex items-center justify-center
                  transition-all duration-300
                  hover:scale-110 hover:shadow-lg hover:shadow-[#240046]/30
                  group
                "
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-[#240046] dark:text-[#A78BFA] group-hover:text-white transition-colors" />
              </a>
              <a 
                href="https://wa.me/5561999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="
                  w-11 h-11
                  bg-emerald-500/10
                  hover:bg-emerald-500
                  border border-emerald-500/20 hover:border-transparent
                  rounded-xl
                  flex items-center justify-center
                  transition-all duration-300
                  hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/30
                  group
                "
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-emerald-500 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="mailto:contato@aniversariantevip.com.br"
                className="
                  w-11 h-11
                  bg-blue-500/10
                  hover:bg-blue-500
                  border border-blue-500/20 hover:border-transparent
                  rounded-xl
                  flex items-center justify-center
                  transition-all duration-300
                  hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30
                  group
                "
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Links - Descubra */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Descubra</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/sobre" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Sobre Nós
              </Link>
              <Link to="/como-funciona" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Como Funciona
              </Link>
              <Link to="/explorar" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Explorar
              </Link>
              <Link to="/faq" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Central de Ajuda
              </Link>
            </nav>
          </div>

          {/* Links - Parceiros */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Parceiros</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/seja-parceiro" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Seja Parceiro
              </Link>
              <Link to="/login/estabelecimento" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Área do Parceiro
              </Link>
              <Link to="/afiliado" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Indique e Ganhe
              </Link>
            </nav>
          </div>

          {/* Links - Suporte */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Suporte</h4>
            <nav className="flex flex-col gap-3">
              <button 
                onClick={abrirCarol}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors text-left"
              >
                <MessageCircle size={14} />
                Fale com a Carol
              </button>
              <Link to="/faq" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                FAQ
              </Link>
              <Link to="/politica-privacidade" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Privacidade
              </Link>
              <Link to="/termos-uso" className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#240046] dark:hover:text-[#A78BFA] transition-colors">
                Termos de Uso
              </Link>
            </nav>
          </div>
        </div>

        {/* Trust Seals - Selos de Confiança */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Shield className="w-5 h-5 text-emerald-500" />
            <span>Site Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Lock className="w-5 h-5 text-blue-500" />
            <span>LGPD Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <CreditCard className="w-5 h-5 text-[#240046] dark:text-[#A78BFA]" />
            <span>Pagamento Seguro</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {currentYear} Aniversariante VIP. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Globe className="w-4 h-4" />
            <span>Português (BR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
