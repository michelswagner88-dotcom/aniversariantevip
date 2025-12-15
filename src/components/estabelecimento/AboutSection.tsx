// AboutSection.tsx - Clean Design
// Sem decorações exageradas, focado no conteúdo

import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  bio: string;
  tags?: string[];
}

const AboutSection = ({ bio, tags }: AboutSectionProps) => {
  if (!bio) return null;

  return (
    <section className="mx-4 sm:mx-6 mt-6" aria-labelledby="about-heading">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-10 h-10 rounded-xl", "bg-[#240046]", "flex items-center justify-center")}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 id="about-heading" className="text-lg font-semibold text-gray-900">
              Sobre
            </h2>
          </div>

          {/* Bio */}
          <p className="text-gray-600 leading-relaxed">{bio}</p>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {tags.map((tag, index) => (
                <span key={index} className={cn("px-3 py-1.5 rounded-full", "bg-gray-100 text-sm text-gray-600")}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
