import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  animated?: boolean;
}

export const Logo = ({ size = "md", showText = true, animated = false }: LogoProps) => {
  const sizes = {
    sm: { icon: 32, text: "text-sm" },
    md: { icon: 48, text: "text-lg" },
    lg: { icon: 64, text: "text-2xl" }
  };

  const iconSize = sizes[size].icon;
  const textSize = sizes[size].text;

  const CakeIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Candles */}
      <line x1="35" y1="8" x2="35" y2="18" stroke="url(#gold-gradient)" strokeWidth="2" />
      <line x1="50" y1="5" x2="50" y2="15" stroke="url(#gold-gradient)" strokeWidth="2" />
      <line x1="65" y1="8" x2="65" y2="18" stroke="url(#gold-gradient)" strokeWidth="2" />
      
      {/* Flames */}
      <circle cx="35" cy="8" r="3" fill="#FFB800" opacity="0.8" />
      <circle cx="50" cy="5" r="3" fill="#FFB800" opacity="0.8" />
      <circle cx="65" cy="8" r="3" fill="#FFB800" opacity="0.8" />
      
      {/* Top tier */}
      <path
        d="M 30 20 L 25 28 L 75 28 L 70 20 Z"
        fill="url(#gold-gradient)"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      <ellipse cx="50" cy="20" rx="20" ry="4" fill="#D4AF37" />
      
      {/* Decorations - top tier */}
      <circle cx="40" cy="24" r="2" fill="#0D0D0D" />
      <circle cx="50" cy="24" r="2" fill="#0D0D0D" />
      <circle cx="60" cy="24" r="2" fill="#0D0D0D" />
      
      {/* Middle tier */}
      <path
        d="M 20 35 L 15 50 L 85 50 L 80 35 Z"
        fill="url(#gold-gradient)"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      <ellipse cx="50" cy="35" rx="30" ry="5" fill="#D4AF37" />
      
      {/* Decorations - middle tier */}
      <path d="M 25 40 Q 30 45 35 40" stroke="#0D0D0D" strokeWidth="1.5" fill="none" />
      <path d="M 42 40 Q 47 45 52 40" stroke="#0D0D0D" strokeWidth="1.5" fill="none" />
      <path d="M 58 40 Q 63 45 68 40" stroke="#0D0D0D" strokeWidth="1.5" fill="none" />
      <path d="M 75 40 Q 80 45 85 40" stroke="#0D0D0D" strokeWidth="1.5" fill="none" />
      
      {/* Bottom tier */}
      <path
        d="M 10 55 L 5 75 L 95 75 L 90 55 Z"
        fill="url(#gold-gradient)"
        stroke="#D4AF37"
        strokeWidth="1.5"
      />
      <ellipse cx="50" cy="55" rx="40" ry="6" fill="#D4AF37" />
      
      {/* Decorations - bottom tier */}
      <circle cx="20" cy="65" r="2.5" fill="#0D0D0D" />
      <circle cx="35" cy="65" r="2.5" fill="#0D0D0D" />
      <circle cx="50" cy="65" r="2.5" fill="#0D0D0D" />
      <circle cx="65" cy="65" r="2.5" fill="#0D0D0D" />
      <circle cx="80" cy="65" r="2.5" fill="#0D0D0D" />
      
      {/* Base plate */}
      <ellipse cx="50" cy="75" rx="45" ry="8" fill="#D4AF37" stroke="#B8941E" strokeWidth="1.5" />
      
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
    </svg>
  );

  const LogoContent = () => (
    <div className="flex items-center gap-3">
      <CakeIcon />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-display font-bold text-primary ${textSize} tracking-wider`}>
            ANIVERSARIANTE
          </span>
          <span className={`font-display font-bold text-primary ${textSize} tracking-widest`}>
            VIP
          </span>
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <LogoContent />
      </motion.div>
    );
  }

  return <LogoContent />;
};
