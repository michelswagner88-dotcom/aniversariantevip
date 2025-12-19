// BusinessHours.tsx - Clean Design
// Simples e funcional

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessHoursProps {
  hours: string;
  inline?: boolean;
}

const BusinessHours = ({ hours, inline }: BusinessHoursProps) => {
  if (!hours) return null;

  // Modo inline - apenas o conteúdo sem wrapper
  if (inline) {
    return <p className="text-gray-600 whitespace-pre-line">{hours}</p>;
  }

  return (
    <section className="mx-4 sm:mx-6 mt-6" aria-labelledby="hours-heading">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-10 h-10 rounded-xl", "bg-[#240046]", "flex items-center justify-center")}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 id="hours-heading" className="text-lg font-semibold text-gray-900">
              Horário de funcionamento
            </h2>
          </div>

          {/* Horário */}
          <p className="text-gray-600 whitespace-pre-line">{hours}</p>
        </div>
      </div>
    </section>
  );
};

export default BusinessHours;
