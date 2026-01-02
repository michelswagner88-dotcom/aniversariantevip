import { Image, Upload, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EstablishmentPhotosProps {
  estabelecimento: any;
  loading: boolean;
  onUpdate: (updates: any) => Promise<void>;
}

export function EstablishmentPhotos({ estabelecimento, loading, onUpdate }: EstablishmentPhotosProps) {
  const fotos = estabelecimento?.fotos || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fotos</h2>
          <p className="text-muted-foreground">Gerencie as fotos do seu estabelecimento</p>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Galeria de Fotos
          </CardTitle>
          <CardDescription>Adicione até 10 fotos para atrair mais clientes</CardDescription>
        </CardHeader>
        <CardContent>
          {fotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhuma foto adicionada</p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Fotos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fotos.map((foto: any, index: number) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={foto.url || foto}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <Button variant="outline" className="aspect-square border-dashed">
                <Plus className="w-6 h-6" />
                Adicionar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EstablishmentPhotos;
