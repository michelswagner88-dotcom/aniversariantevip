import { Sparkles, ArrowRight, Gift, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CTABannerProps {
  variant?: 'register' | 'partner' | 'benefits';
}

const CTABanner = ({ variant = 'register' }: CTABannerProps) => {
  const content = {
    register: {
      title: 'Seu aniversário está chegando?',
      subtitle: 'Cadastre-se grátis e descubra benefícios exclusivos perto de você!',
      cta: 'Criar minha conta',
      link: '/auth',
      icon: Sparkles
    },
    partner: {
      title: 'Tem um estabelecimento?',
      subtitle: 'Atraia aniversariantes e aumente suas vendas com benefícios exclusivos!',
      cta: 'Seja parceiro',
      link: '/seja-parceiro',
      icon: Star
    },
    benefits: {
      title: 'Mais de 500 benefícios esperando você',
      subtitle: 'Restaurantes, bares, spas e muito mais oferecendo vantagens no seu dia!',
      cta: 'Explorar agora',
      link: '/explorar',
      icon: Gift
    }
  };

  const { title, subtitle, cta, link, icon: Icon } = content[variant];

  // Cores por variante - Roxo escuro premium #240046
  const gradients = {
    register: 'linear-gradient(135deg, #240046 0%, #3C096C 100%)',
    partner: 'linear-gradient(135deg, #3C096C 0%, #240046 100%)',
    benefits: 'linear-gradient(135deg, #240046 0%, #3C096C 100%)',
  };

  return (
    <section className="py-4 sm:py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 lg:p-8"
        style={{ background: gradients[variant] }}
      >
        {/* Elementos decorativos sutis */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-3xl" />

        {/* Conteúdo compacto */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">
              {title}
            </h3>
            <p className="text-white/80 text-sm sm:text-base">{subtitle}</p>
          </div>
          
          <Link
            to={link}
            aria-label={cta}
            className="
              group flex items-center gap-2
              bg-white text-[#240046] font-bold
              px-6 py-3 rounded-full
              shadow-lg transition-all duration-300
              hover:scale-105 active:scale-95
              whitespace-nowrap text-sm sm:text-base
            "
          >
            <span>{cta}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default CTABanner;
