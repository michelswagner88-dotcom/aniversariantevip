import { Wallet, Download, Share2, Gift, FileText, Calendar, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface CupomAniversarioProps {
  estabelecimentoNome: string;
  estabelecimentoLogo?: string;
  aniversarianteNome: string;
  dataNascimento: string;
  descricaoBeneficio: string;
  regrasUtilizacao?: string;
  codigoCupom: string;
  dataEmissao: string;
  periodoValidade?: string;
}

export const CupomAniversario = ({
  estabelecimentoNome,
  estabelecimentoLogo,
  aniversarianteNome,
  dataNascimento,
  descricaoBeneficio,
  regrasUtilizacao,
  codigoCupom,
  dataEmissao,
  periodoValidade,
}: CupomAniversarioProps) => {
  
  const handleSaveImage = () => {
    toast.info("Salvamento em breve!");
  };

  const handleAddToWallet = () => {
    toast.info("Google Wallet em breve!");
  };

  const handleShare = () => {
    const text = `🎂 Meu benefício de aniversário!\n\n🎁 ${descricaoBeneficio}\n\nDescubra mais em: aniversariantevip.com.br`;
    
    if (navigator.share) {
      navigator.share({ title: 'Meu Cupom VIP', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copiado!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <Card className="max-w-lg w-full bg-slate-950 border border-white/10 overflow-hidden shadow-[0_0_60px_-15px_rgba(139,92,246,0.6)] animate-scale-in">
        
        {/* Header VIP Premium */}
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs uppercase tracking-widest font-bold">
                Cupom Ativo
              </span>
            </div>
            <h1 className="font-bold text-2xl text-white tracking-tight">
              ANIVERSARIANTE VIP
            </h1>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-8 space-y-6">
          
          {/* Nome do Estabelecimento com Logo */}
          <div className="text-center pb-4 border-b border-white/10">
            {estabelecimentoLogo && (
              <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
                <img 
                  src={estabelecimentoLogo} 
                  alt={estabelecimentoNome}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h4 className="text-white text-xl font-bold">
              {estabelecimentoNome}
            </h4>
          </div>

          {/* Cliente */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              Aniversariante
            </p>
            <p className="text-base text-white font-medium">
              {aniversarianteNome}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Emitido em {format(new Date(dataEmissao), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>

          {/* BENEFÍCIO */}
          <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-violet-300 text-xs uppercase tracking-wider mb-1 font-semibold">
                  Seu Benefício
                </p>
                <p className="text-white font-medium leading-relaxed">
                  {descricaoBeneficio}
                </p>
              </div>
            </div>
          </div>

          {/* Validade */}
          {periodoValidade && (
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm bg-white/5 rounded-lg py-2.5 px-4 border border-white/10">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span>Válido: {periodoValidade}</span>
            </div>
          )}

          {/* Regras Colapsáveis */}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-center gap-2 text-white/60 hover:text-white/80 text-sm py-2 transition-colors">
                <FileText className="w-4 h-4" />
                <span>Ver regras de utilização</span>
                <span className="text-xs">▼</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 space-y-3">
                {/* Regras do Estabelecimento */}
                {regrasUtilizacao && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-2 font-semibold">
                      Regras do Estabelecimento
                    </p>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {regrasUtilizacao}
                    </p>
                  </div>
                )}
                
                {/* Regras Gerais */}
                <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-amber-300 text-xs uppercase tracking-wider mb-2 font-semibold">
                        Regras Gerais
                      </p>
                      <ul className="text-white/70 text-xs space-y-1.5">
                        <li>• Obrigatório apresentação de documento com foto.</li>
                        <li>• Cortesia válida quando há consumo no local.</li>
                        <li>• Informações podem sofrer alteração sem aviso prévio.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Área de Validação (QR Code + Código) */}
          <div className="space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider text-center">
              Área de Validação
            </p>
            
            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white rounded-2xl">
              <QRCodeSVG 
                value={codigoCupom}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Código Alfanumérico */}
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Código
              </p>
              <p className="font-mono text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 text-transparent bg-clip-text">
                {codigoCupom}
              </p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-white/30 text-[10px]">
              aniversariantevip.com.br
            </p>
          </div>

          {/* Ações Premium */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleShare}
              className="bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 border-violet-500/30 flex flex-col items-center justify-center gap-1.5 h-auto py-3 shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-[10px] font-medium">Compartilhar</span>
            </Button>
            
            <Button
              onClick={handleSaveImage}
              className="bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 border-fuchsia-500/30 flex flex-col items-center justify-center gap-1.5 h-auto py-3 shadow-lg hover:shadow-fuchsia-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="text-[10px] font-medium">Salvar</span>
            </Button>

            <Button
              onClick={handleAddToWallet}
              className="bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 border-pink-500/30 flex flex-col items-center justify-center gap-1.5 h-auto py-3 shadow-lg hover:shadow-pink-500/25 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-medium">Carteira</span>
            </Button>
          </div>

        </div>

        {/* Footer decorativo com gradiente */}
        <div className="h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />
      </Card>
    </div>
  );
};
