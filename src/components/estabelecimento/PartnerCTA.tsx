// PartnerCTA.tsx - CTA para Parceiros Premium 2025
// Tendências: Gradientes vibrantes, Animações, Call-to-action impactante

import { motion } from "framer-motion";
import { Gift, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PartnerCTA = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/seja-parceiro");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="mx-4 sm:mx-6 mt-10 sm:mt-12 mb-8"
      aria-labelledby="partner-cta-heading"
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="
          relative overflow-hidden
          rounded-3xl
          bg-gradient-to-br from-[#240046] via-[#3C096C] to-[#5A189A]
          shadow-[0_20px_60px_rgba(124,58,237,0.3)]
        "
        >
          {/* Background patterns */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Círculos decorativos */}
            <div
              className="
              absolute -top-20 -right-20
              w-64 h-64 rounded-full
              bg-white/5
            "
            />
            <div
              className="
              absolute -bottom-32 -left-32
              w-80 h-80 rounded-full
              bg-white/5
            "
            />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 1px 1px, white 1px, transparent 0)
                `,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Conteúdo */}
          <div className="relative p-8 sm:p-10 text-center">
            {/* Ícone animado */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
              }}
              className="
                w-20 h-20 mx-auto mb-6
                rounded-3xl
                bg-gradient-to-br from-amber-400 to-orange-500
                flex items-center justify-center
                shadow-lg shadow-amber-500/30
              "
            >
              <Building2 className="w-10 h-10 text-white" />
            </motion.div>

            {/* Título */}
            <h2
              id="partner-cta-heading"
              className="
                text-2xl sm:text-3xl md:text-4xl
                font-bold text-white
                mb-3
              "
            >
              Quer sua página assim?
            </h2>

            {/* Subtítulo */}
            <p
              className="
              text-lg text-white/80
              max-w-md mx-auto
              mb-8
            "
            >
              Cadastre seu estabelecimento e atraia aniversariantes todos os meses!
            </p>

            {/* Benefícios rápidos */}
            <div
              className="
              flex flex-wrap justify-center gap-3
              mb-8
            "
            >
              {["Página exclusiva", "Destaque nas buscas", "Métricas em tempo real"].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + 0.1 * index }}
                  className="
                    flex items-center gap-2
                    px-4 py-2 rounded-full
                    bg-white/10 backdrop-blur-sm
                    border border-white/20
                  "
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Botão CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
              className="
                inline-flex items-center gap-3
                px-8 py-4
                bg-white
                text-[#240046] font-bold text-lg
                rounded-2xl
                shadow-lg shadow-black/20
                hover:shadow-xl hover:shadow-black/30
                transition-all duration-300
                group
              "
            >
              <Gift className="w-5 h-5" />
              <span>Cadastrar meu negócio</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>

          {/* Brilho no canto */}
          <div
            className="
            absolute top-0 right-0
            w-32 h-32
            bg-gradient-to-br from-white/20 to-transparent
            rounded-full
            blur-3xl
            -translate-y-1/2 translate-x-1/2
          "
          />
        </div>
      </div>
    </motion.section>
  );
};

export default PartnerCTA;
