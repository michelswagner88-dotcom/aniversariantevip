import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Story {
  id: string;
  media_url: string;
  created_at: string;
  expires_at: string;
}

interface StoryViewerProps {
  stories: Story[];
  establishmentName: string;
  establishmentLogo?: string;
  onClose: () => void;
}

export const StoryViewer = ({ stories, establishmentName, establishmentLogo, onClose }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];

  // Auto-progress para próximo story
  useEffect(() => {
    const duration = 5000; // 5 segundos por story
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Próximo story
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, stories.length, onClose]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black animate-fade-in">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          {establishmentLogo && (
            <img
              src={establishmentLogo}
              alt={establishmentName}
              className="w-10 h-10 rounded-full border-2 border-white object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-white text-sm">{establishmentName}</p>
            <p className="text-xs text-white/70">
              {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Story Content */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={currentStory.media_url}
          alt="Story"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Navigation Areas (click left/right) */}
      <div className="absolute inset-0 z-0 flex">
        <button
          onClick={handlePrevious}
          className="flex-1 cursor-pointer"
          aria-label="Story anterior"
        />
        <button
          onClick={handleNext}
          className="flex-1 cursor-pointer"
          aria-label="Próximo story"
        />
      </div>
    </div>
  );
};