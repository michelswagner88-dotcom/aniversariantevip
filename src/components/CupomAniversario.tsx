import { CakeIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  return (
    <Card className="max-w-2xl mx-auto bg-gradient-to-br from-vip-black via-vip-dark to-vip-black border-2 border-primary overflow-hidden animate-scale-in">
      {/* Header com logo Aniversariante VIP */}
      <div className="bg-gradient-to-r from-primary via-vip-gold-light to-primary p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <CakeIcon className="h-8 w-8 text-vip-black" />
          <h1 className="font-display text-3xl font-bold text-vip-black">
            Aniversariante VIP
          </h1>
          <CakeIcon className="h-8 w-8 text-vip-black" />
        </div>
        <p className="text-vip-black font-semibold text-lg">Cupom de Aniversário</p>
      </div>

      {/* Conteúdo principal */}
      <div className="p-8 space-y-6">
        {/* Logo e nome do estabelecimento */}
        <div className="text-center border-b border-primary/30 pb-6">
          {estabelecimentoLogo && (
            <img
              src={estabelecimentoLogo}
              alt={estabelecimentoNome}
              className="h-20 w-20 object-contain mx-auto mb-4 rounded-lg"
            />
          )}
          <h2 className="font-display text-2xl font-bold text-primary mb-2">
            {estabelecimentoNome}
          </h2>
        </div>

        {/* Dados do aniversariante */}
        <div className="space-y-3 border-b border-primary/30 pb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Aniversariante
            </p>
            <p className="text-lg font-semibold text-foreground">{aniversarianteNome}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Data de Nascimento
            </p>
            <p className="text-base text-foreground">
              {format(new Date(dataNascimento), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        {/* Benefício */}
        <div className="space-y-3 border-b border-primary/30 pb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Seu Benefício
            </p>
            <p className="text-base text-foreground leading-relaxed">
              {descricaoBeneficio}
            </p>
          </div>
          {periodoValidade && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Período de Validade
              </p>
              <p className="text-sm text-foreground">
                {periodoValidade === "dia_aniversario" && "Dia do aniversário"}
                {periodoValidade === "semana_aniversario" && "Semana do aniversário"}
                {periodoValidade === "mes_aniversario" && "Mês do aniversário"}
              </p>
            </div>
          )}
        </div>

        {/* Regras de utilização */}
        {regrasUtilizacao && (
          <div className="space-y-2 border-b border-primary/30 pb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Regras de Utilização
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {regrasUtilizacao}
            </p>
          </div>
        )}

        {/* Código do cupom */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-lg p-6 text-center border border-primary/30">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Código do Cupom
          </p>
          <p className="font-mono text-3xl font-bold text-primary tracking-wider mb-3">
            {codigoCupom}
          </p>
          <p className="text-xs text-muted-foreground">
            Emitido em {format(new Date(dataEmissao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>

        {/* Aviso importante */}
        <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
          <p className="text-xs text-foreground/80 leading-relaxed">
            <strong className="text-primary">Importante:</strong> Apresente este cupom no
            estabelecimento junto com um documento com foto. Válido conforme regras descritas acima.
          </p>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className="h-2 bg-gradient-to-r from-primary via-vip-gold-light to-primary" />
    </Card>
  );
};
