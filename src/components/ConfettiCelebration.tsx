import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

interface ConfettiCelebrationProps {
  isActive: boolean;
}

export const ConfettiCelebration = ({ isActive }: ConfettiCelebrationProps) => {
  const { width, height } = useWindowSize();

  if (!isActive) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
      colors={['#8B5CF6', '#D946EF', '#F472B6', '#FFD700', '#FFF']} // roxo, fuchsia, rosa, dourado, branco
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
    />
  );
};
