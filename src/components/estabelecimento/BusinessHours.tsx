// BusinessHours.tsx - Horário de Funcionamento Clean

import { Clock } from "lucide-react";

interface BusinessHoursProps {
  hours: string;
}

const BusinessHours = ({ hours }: BusinessHoursProps) => {
  if (!hours) return null;

  return (
    <div className="mx-4 sm:mx-6 mt-4 sm:mt-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#240046]" />
            </div>
            <div>
              <h3 className="text-sm text-[#717171] mb-0.5">Horário de funcionamento</h3>
              <p className="text-[#222222] font-medium">{hours}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessHours;
