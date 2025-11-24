import { Wallet, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";

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
    // TODO: Implementar captura de screenshot do cupom
    console.log("Salvando imagem...");
  };

  const handleAddToWallet = () => {
    // TODO: Implementar integração com Google Wallet
    console.log("Adicionando à carteira...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-lg w-full bg-slate-950 border border-white/10 overflow-hidden shadow-[0_0_50px_-12px_rgba(139,92,246,0.5)] animate-scale-in">
        
        {/* Cabeçalho do Ticket */}
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 p-6 text-center">
          <h1 className="font-bold text-2xl text-white mb-2 tracking-tight">
            Aniversariante VIP
          </h1>
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-100">Cupom Ativo</span>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-8 space-y-6">
          
          {/* Dados do Benefício */}
          <div className="space-y-4 border-b border-white/10 pb-6">
            {/* Nome do Estabelecimento */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Local
              </p>
              <p className="text-xl font-bold text-white">
                {estabelecimentoNome}
              </p>
            </div>

            {/* Cliente */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Cliente
              </p>
              <p className="text-base text-slate-300">
                {aniversarianteNome}
              </p>
              <p className="text-sm text-slate-500">
                Emitido em {format(new Date(dataEmissao), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>

            {/* Benefício */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Benefício
              </p>
              <p className="text-base text-slate-300 leading-relaxed">
                {descricaoBeneficio}
              </p>
            </div>

            {/* Regras */}
            {regrasUtilizacao && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Regras
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {regrasUtilizacao}
                </p>
              </div>
            )}
          </div>

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

          {/* Aviso Legal */}
          <div className="bg-slate-900/50 border border-white/5 rounded-lg p-4">
            <p className="text-xs text-slate-400 leading-relaxed text-center">
              Benefício sujeito a alterações. Recomendamos confirmar com o estabelecimento antes de ir.
            </p>
          </div>

          {/* Ações (Botões) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={handleAddToWallet}
              variant="outline"
              className="bg-slate-900 border-white/10 hover:bg-slate-800 hover:border-white/20 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              <span className="text-sm">Carteira</span>
            </Button>
            
            <Button
              onClick={handleSaveImage}
              variant="outline"
              className="bg-slate-900 border-white/10 hover:bg-slate-800 hover:border-white/20 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="text-sm">Salvar</span>
            </Button>
          </div>

        </div>

        {/* Footer decorativo com gradiente */}
        <div className="h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />
      </Card>
    </div>
  );
};
