// AboutSection.tsx - Seção Sobre Clean

import { Store } from "lucide-react";

interface AboutSectionProps {
  bio: string;
  tags?: string[];
}

const AboutSection = ({ bio, tags = [] }: AboutSectionProps) => {
  return (
    <div className="mx-4 sm:mx-6 mt-4 sm:mt-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#240046]/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#240046]" />
            </div>
            <h2 className="text-lg font-semibold text-[#240046]">Sobre</h2>
          </div>

          {/* Bio */}
          <p className="text-[#3C096C] leading-relaxed text-[15px]">{bio}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="
                    px-3 py-1.5 
                    rounded-full 
                    text-sm 
                    bg-[#240046]/5
                    text-[#3C096C]
                    border border-[#240046]/10
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
