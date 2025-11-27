import React from 'react';
import { CheckCircle2, Loader2, MapPin, Navigation, Search } from 'lucide-react';

type GeolocationStep = 
  | 'idle'
  | 'requesting_permission'
  | 'getting_coordinates'
  | 'geocoding'
  | 'success'
  | 'error';

interface GeolocationProgressProps {
  currentStep: GeolocationStep;
  className?: string;
}

const steps = [
  {
    id: 'requesting_permission',
    label: 'Solicitando permissão',
    icon: MapPin,
  },
  {
    id: 'getting_coordinates',
    label: 'Obtendo coordenadas',
    icon: Navigation,
  },
  {
    id: 'geocoding',
    label: 'Identificando cidade',
    icon: Search,
  },
];

export const GeolocationProgress: React.FC<GeolocationProgressProps> = ({
  currentStep,
  className = '',
}) => {
  if (currentStep === 'idle' || currentStep === 'success') {
    return null;
  }

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`absolute -bottom-24 left-0 right-0 z-50 ${className}`}>
      <div className="mx-auto max-w-md rounded-2xl border border-violet-500/30 bg-slate-900/95 p-4 backdrop-blur-xl shadow-2xl">
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    isCompleted
                      ? 'bg-green-500/20 text-green-400'
                      : isActive
                      ? 'bg-violet-500/20 text-violet-400 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'text-green-400'
                      : isActive
                      ? 'text-white'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                  {isActive && (
                    <span className="ml-2 inline-block">
                      <span className="animate-[pulse_1s_ease-in-out_infinite]">.</span>
                      <span className="animate-[pulse_1s_ease-in-out_0.2s_infinite]">.</span>
                      <span className="animate-[pulse_1s_ease-in-out_0.4s_infinite]">.</span>
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
