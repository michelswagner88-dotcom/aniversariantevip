import { ExternalLink, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EstablishmentPreviewProps {
  estabelecimento: any;
}

export function EstablishmentPreview({ estabelecimento }: EstablishmentPreviewProps) {
  const slug = estabelecimento?.slug;
  const previewUrl = slug ? `/${slug}` : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pré-visualização</h2>
          <p className="text-muted-foreground">Veja como os clientes veem sua página</p>
        </div>
        {previewUrl && (
          <Button
            onClick={() => window.open(previewUrl, "_blank")}
            className="bg-primary hover:bg-primary/90"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Página
          </Button>
        )}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {previewUrl ? (
            <div className="aspect-[16/10] w-full rounded-lg overflow-hidden bg-muted">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Preview do estabelecimento"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Preview não disponível</p>
              <p className="text-sm text-muted-foreground">Seu estabelecimento ainda não tem uma página pública</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EstablishmentPreview;
