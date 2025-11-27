import React from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LocationConfirmDialogProps {
  open: boolean;
  cidade: string;
  estado: string;
  onConfirm: () => void;
  onReject: () => void;
}

export const LocationConfirmDialog: React.FC<LocationConfirmDialogProps> = ({
  open,
  cidade,
  estado,
  onConfirm,
  onReject,
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onReject()}>
      <DialogContent className="bg-slate-900 border-violet-500/30 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full p-4">
                <MapPin size={32} className="text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold text-white">
            Você ainda está aqui?
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            Detectamos que você estava em:
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
          <div className="flex items-center justify-center gap-3">
            <Navigation size={20} className="text-violet-400" />
            <span className="text-lg font-bold text-white">
              {cidade}, {estado}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onConfirm}
            className="w-full h-12 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 hover:brightness-110 text-white font-bold text-base shadow-lg shadow-violet-500/30 transition-all"
          >
            ✓ Sim, ainda estou aqui
          </Button>
          
          <Button
            onClick={onReject}
            variant="outline"
            className="w-full h-12 border-white/10 hover:bg-white/5 text-white font-medium"
          >
            <X size={18} className="mr-2" />
            Não, mudei de local
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Esta localização será usada para mostrar benefícios perto de você
        </p>
      </DialogContent>
    </Dialog>
  );
};
