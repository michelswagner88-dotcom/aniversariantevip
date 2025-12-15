// AboutSection.tsx - Seção Sobre Premium 2025
// Tendências: Tipografia clean, Tags interativas

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  bio: string;
  tags?: string[];
}

const AboutSection = ({ bio, tags }: AboutSectionProps) => {
  if (!bio) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mx-4 sm:mx-6 mt-8 sm:mt-10"
      aria-labelledby="about-heading"
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="
          relative
          p-6 sm:p-8
          bg-white
          rounded-3xl
          border border-[#EBEBEB]
          shadow-sm
        "
        >
          {/* Aspas decorativas */}
          <div
            className="
            absolute top-4 right-6
            text-[120px] leading-none
            text-[#240046]/5
            font-serif
            select-none
            pointer-events-none
          "
          >
            "
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="
              w-10 h-10 rounded-xl
              bg-gradient-to-br from-[#240046] to-[#3C096C]
              flex items-center justify-center
            "
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 id="about-heading" className="text-xl font-semibold text-[#222222]">
              Sobre
            </h2>
          </div>

          {/* Bio */}
          <p
            className="
            text-[#484848] 
            text-base sm:text-lg
            leading-relaxed
            relative z-10
          "
          >
            {bio}
          </p>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[#EBEBEB]">
              {tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  className="
                    px-4 py-2 rounded-full
                    bg-[#F7F7F7]
                    text-sm font-medium text-[#484848]
                    border border-[#EBEBEB]
                    hover:border-[#240046]/30
                    hover:bg-[#240046]/5
                    transition-all duration-300
                    cursor-default
                  "
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default AboutSection;
