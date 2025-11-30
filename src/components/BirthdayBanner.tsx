import { Cake, Sparkles } from 'lucide-react';

interface BirthdayBannerProps {
  firstName: string;
}

export const BirthdayBanner = ({ firstName }: BirthdayBannerProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 py-3 px-4">
      {/* Sparkles animados */}
      <div className="absolute inset-0 opacity-30">
        <Sparkles 
          className="absolute top-1 left-[10%] w-4 h-4 text-white animate-pulse" 
        />
        <Sparkles 
          className="absolute top-2 left-[30%] w-3 h-3 text-yellow-200 animate-pulse" 
          style={{ animationDelay: '100ms' }}
        />
        <Sparkles 
          className="absolute bottom-1 left-[50%] w-4 h-4 text-white animate-pulse" 
          style={{ animationDelay: '200ms' }}
        />
        <Sparkles 
          className="absolute top-1 left-[70%] w-3 h-3 text-yellow-200 animate-pulse" 
          style={{ animationDelay: '300ms' }}
        />
        <Sparkles 
          className="absolute bottom-2 left-[90%] w-4 h-4 text-white animate-pulse" 
          style={{ animationDelay: '400ms' }}
        />
      </div>
      
      <div className="relative flex items-center justify-center gap-2 text-white font-medium">
        <Cake className="w-5 h-5" />
        <span>Feliz Aniversário, {firstName}! 🎉</span>
        <Cake className="w-5 h-5" />
      </div>
    </div>
  );
};
