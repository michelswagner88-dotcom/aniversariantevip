// BusinessHours.tsx - Horário de Funcionamento Premium 2025
// Tendências: Status visual, Dia atual destacado

import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessHoursProps {
  hours: string;
}

const BusinessHours = ({ hours }: BusinessHoursProps) => {
  if (!hours) return null;

  // Parse do horário (formato simples string)
  const parseHours = (hoursString: string) => {
    // Tentar fazer parse básico
    try {
      // Se já é JSON
      if (hoursString.startsWith("{") || hoursString.startsWith("[")) {
        const parsed = JSON.parse(hoursString);
        if (Array.isArray(parsed)) return parsed;
        // Se é objeto com dias
        const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
        return days.map((day) => ({
          day,
          hours: parsed[day.toLowerCase()] || parsed[day] || "Fechado",
        }));
      }
      // String simples
      return null;
    } catch {
      return null;
    }
  };

  const parsedHours = parseHours(hours);

  // Obter dia atual
  const getCurrentDay = () => {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  // Verificar se está aberto (simplificado)
  const checkIfOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    // Simplificado: considera aberto entre 8h e 22h em dias úteis
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0) return hour >= 10 && hour < 18; // Domingo
    return hour >= 8 && hour < 22;
  };

  const isOpen = checkIfOpen();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="mx-4 sm:mx-6 mt-8 sm:mt-10"
      aria-labelledby="hours-heading"
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="
          p-6 sm:p-8
          bg-white
          rounded-3xl
          border border-[#EBEBEB]
          shadow-sm
        "
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="
                w-10 h-10 rounded-xl
                bg-gradient-to-br from-[#240046] to-[#3C096C]
                flex items-center justify-center
              "
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 id="hours-heading" className="text-xl font-semibold text-[#222222]">
                Horário de funcionamento
              </h2>
            </div>

            {/* Status badge */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                isOpen ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
              )}
            >
              {isOpen ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{isOpen ? "Aberto agora" : "Fechado"}</span>
            </div>
          </div>

          {/* Lista de horários */}
          {parsedHours ? (
            <div className="space-y-3">
              {parsedHours.map((item: any, index: number) => {
                const isToday = item.day === currentDay;
                const isClosed = item.hours?.toLowerCase().includes("fechado");

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between py-3 px-4 rounded-xl transition-colors",
                      isToday && "bg-[#240046]/5 border border-[#240046]/10",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isToday && <div className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />}
                      <span className={cn("font-medium", isToday ? "text-[#240046]" : "text-[#484848]")}>
                        {item.day}
                      </span>
                      {isToday && <span className="text-xs text-[#7C3AED] font-medium">Hoje</span>}
                    </div>
                    <span className={cn("text-sm", isClosed ? "text-red-500" : "text-[#717171]")}>{item.hours}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            // Fallback: mostrar string original
            <p className="text-[#484848] leading-relaxed whitespace-pre-line">{hours}</p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default BusinessHours;
