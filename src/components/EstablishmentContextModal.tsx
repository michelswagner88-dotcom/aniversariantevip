import { Building2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EstablishmentContextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  establishmentSlug?: string;
}

/**
 * Modal exibido quando um usuário logado como estabelecimento
 * tenta acessar funcionalidades exclusivas de aniversariantes.
 */
export const EstablishmentContextModal = ({
  open,
  onOpenChange,
  establishmentSlug,
}: EstablishmentContextModalProps) => {
  const navigate = useNavigate();

  const handleOpenPanel = () => {
    onOpenChange(false);
    navigate("/area-estabelecimento");
  };

  const handleViewPublicPage = () => {
    if (establishmentSlug) {
      onOpenChange(false);
      navigate(`/estabelecimento/${establishmentSlug}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            Você está logado como Estabelecimento
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Esta funcionalidade é exclusiva para aniversariantes. Para gerenciar
            seu benefício e sua página, acesse seu painel de controle.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleOpenPanel} className="w-full" size="lg">
            <Building2 className="w-4 h-4 mr-2" />
            Abrir meu painel
          </Button>

          {establishmentSlug && (
            <Button
              variant="outline"
              onClick={handleViewPublicPage}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver minha página pública
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Continuar navegando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstablishmentContextModal;
