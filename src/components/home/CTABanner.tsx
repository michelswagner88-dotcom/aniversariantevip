import { Sparkles, ArrowRight, Gift } from 'lucide-react';
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
      icon: Gift
    },
    benefits: {
      title: 'Mais de 500 benefícios esperando você',
      subtitle: 'Restaurantes, bares, spas e muito mais oferecendo vantagens no seu dia!',
      cta: 'Explorar agora',
      link: '/explorar',
      icon: ArrowRight
    }
  };

  const { title, subtitle, cta, link, icon: Icon } = content[variant];

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="
            relative
            bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600
            bg-[length:200%_auto]
            animate-[gradient-flow_3s_ease-in-out_infinite]
            rounded-3xl
            p-8 sm:p-12
            overflow-hidden
          "
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {title}
              </h3>
              <p className="text-white/80 text-lg">
                {subtitle}
              </p>
            </div>
            
            <Link
              to={link}
              className="
                group
                flex items-center gap-2
                bg-white
                text-purple-600
                font-bold
                px-8 py-4
                rounded-full
                shadow-xl shadow-purple-900/30
                transition-all duration-300
                hover:scale-105
                hover:shadow-2xl hover:shadow-purple-900/40
                active:scale-95
                whitespace-nowrap
              "
            >
              <Icon className="w-5 h-5" />
              <span>{cta}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
