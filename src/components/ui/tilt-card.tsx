import { useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  shadowAmount?: number;
  enableHolographic?: boolean;
}

export const TiltCard = ({ 
  children, 
  className = '', 
  tiltAmount = 10,
  shadowAmount = 20,
  enableHolographic = false
}: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * tiltAmount;
    const rotateYValue = ((centerX - x) / centerX) * tiltAmount;
    
    const shadowXValue = ((x - centerX) / centerX) * shadowAmount;
    const shadowYValue = ((y - centerY) / centerY) * shadowAmount;
    
    // Posição do mouse em percentual para efeitos holográficos
    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setShadowX(shadowXValue);
    setShadowY(shadowYValue);
    setMousePosition({ x: mouseXPercent, y: mouseYPercent });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setShadowX(0);
    setShadowY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: `${shadowX}px ${shadowY}px 40px rgba(139, 92, 246, 0.3)`,
        '--mouse-x': `${mousePosition.x}%`,
        '--mouse-y': `${mousePosition.y}%`,
      } as React.CSSProperties}
      className={cn(
        'transition-shadow duration-200',
        enableHolographic && 'holographic-card',
        className
      )}
    >
      {enableHolographic && (
        <>
          {/* Borda iridescente animada */}
          <div className="holographic-border" />
          {/* Overlay rainbow que segue o cursor */}
          <div className="holographic-overlay" />
          {/* Reflexo de luz deslizante */}
          <div className="holographic-shine" />
        </>
      )}
      {children}
    </motion.div>
  );
};
