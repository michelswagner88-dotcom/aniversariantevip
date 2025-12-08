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

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f97316 100%)',
          }}
        >
          {/* Elementos decorativos animados */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Partículas */}
          <div className="absolute top-8 left-12 w-2 h-2 bg-white/30 rounded-full animate-bounce" />
          <div className="absolute top-16 right-20 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-12 left-1/3 w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />

          {/* Conteúdo */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              {/* Ícone */}
              <div className="hidden sm:flex w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl items-center justify-center border border-white/30">
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {title}
                </h3>
                <p className="text-white/80 text-base sm:text-lg max-w-md">
                  {subtitle}
                </p>
              </div>
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
                shadow-xl shadow-black/20
                transition-all duration-300
                hover:scale-105
                hover:shadow-2xl
                active:scale-95
                whitespace-nowrap
              "
            >
              <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
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
