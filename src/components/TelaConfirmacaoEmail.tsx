import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TelaConfirmacaoEmailProps {
  email: string;
  onVoltar: () => void;
}

export const TelaConfirmacaoEmail = ({ email, onVoltar }: TelaConfirmacaoEmailProps) => {
  const [reenviando, setReenviando] = useState(false);

  const handleReenviar = async () => {
    setReenviando(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error('Erro ao reenviar. Tente novamente.');
      } else {
        toast.success('Email reenviado! Verifique sua caixa de entrada.');
      }
    } catch (err) {
      toast.error('Erro ao reenviar email.');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-white/10">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-violet-500" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Verifique seu email
          </h2>
          
          <p className="text-gray-400 mb-2">
            Enviamos um link de confirmação para:
          </p>
          
          <p className="text-white font-medium mb-4">
            {email}
          </p>
          
          <p className="text-gray-500 text-sm mb-6">
            Clique no link do email para ativar sua conta. Não esqueça de verificar a pasta de spam.
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleReenviar}
              disabled={reenviando}
              className="w-full"
            >
              {reenviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                'Reenviar email'
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onVoltar}
              className="w-full text-gray-400"
            >
              Voltar para login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
