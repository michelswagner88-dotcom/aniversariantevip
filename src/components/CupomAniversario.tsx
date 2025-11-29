import { Wallet, Download, Gift, FileText, Calendar, AlertTriangle } from "lucide-react";
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
          
          {/* Nome do Estabelecimento com Logo */}
          <div className="text-center pb-4 border-b border-white/10">
            {estabelecimentoLogo && (
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden border-2 border-white/30">
                <img 
                  src={estabelecimentoLogo} 
                  alt={estabelecimentoNome}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h4 className="text-white text-lg font-bold">
              {estabelecimentoNome}
            </h4>
          </div>

          {/* Cliente */}
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
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
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                  Benefício
                </p>
                <p className="text-white font-medium leading-relaxed">
                  {descricaoBeneficio}
                </p>
              </div>
            </div>
          </div>

          {/* REGRAS DO ESTABELECIMENTO */}
          {regrasUtilizacao && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
                    Regras do Estabelecimento
                  </p>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {regrasUtilizacao}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validade */}
          {periodoValidade && (
            <div className="flex items-center justify-center gap-2 text-white/80 text-sm bg-white/10 rounded-lg py-2 px-4">
              <Calendar className="w-4 h-4" />
              <span>Válido: {periodoValidade}</span>
            </div>
          )}

          {/* REGRAS GERAIS - FIXO EM TODOS OS CUPONS */}
          <div className="bg-black/20 rounded-xl p-4 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                  Regras Gerais
                </p>
                <ul className="text-white/70 text-xs space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Obrigatório apresentação de documento com foto.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Cortesia válida quando há consumo no local.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Informações podem sofrer alteração sem aviso prévio, confirme com o estabelecimento.</span>
                  </li>
                </ul>
              </div>
            </div>
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

          {/* Rodapé */}
          <div className="text-center pt-4 border-t border-white/20">
            <p className="text-white/40 text-xs">
              Apresente este cupom no estabelecimento
            </p>
            <p className="text-white/30 text-[10px] mt-1">
              aniversariantevip.com.br
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
