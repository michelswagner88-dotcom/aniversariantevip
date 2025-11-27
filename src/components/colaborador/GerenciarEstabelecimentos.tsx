import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Loader2, Search, Building2, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import { CadastrarEstabelecimento } from "./CadastrarEstabelecimento";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditEstablishmentModal } from "@/components/admin/EditEstablishmentModal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Estabelecimento = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  categoria: string[] | null;
  logo_url: string | null;
  descricao_beneficio: string | null;
  cep: string | null;
  numero: string | null;
  complemento: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  periodo_validade_beneficio: string | null;
  plan_status: string | null;
  ativo: boolean;
  created_at: string;
};

export function GerenciarEstabelecimentos({ onUpdate }: { onUpdate?: () => void }) {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editando, setEditando] = useState<Estabelecimento | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [bulkFetchingPhotos, setBulkFetchingPhotos] = useState(false);
  const [photoProgress, setPhotoProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    carregarEstabelecimentos();
  }, []);

  const carregarEstabelecimentos = async () => {
    try {
      setLoading(true);
      
      // Buscar TODOS os estabelecimentos (com ou sem conta de acesso)
      const { data: estabData, error: estabError } = await supabase
        .from('estabelecimentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (estabError) throw estabError;

      // Buscar profiles para estabelecimentos que têm conta
      const estabComConta = estabData?.filter(e => e.tem_conta_acesso) || [];
      const userIds = estabComConta.map(e => e.id);

      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        if (profilesError) throw profilesError;
        profiles = profilesData || [];
      }

      // Combinar dados
      const combined = estabData?.map(estab => {
        const profile = profiles.find(p => p.id === estab.id);
        return {
          id: estab.id,
          nome_fantasia: estab.nome_fantasia,
          razao_social: estab.razao_social || 'Sem razão social',
          cnpj: estab.cnpj || '',
          email: profile?.email || 'Sem email (cadastro sem conta)',
          telefone: estab.telefone,
          endereco: estab.endereco,
          cidade: estab.cidade,
          estado: estab.estado,
          categoria: estab.categoria,
          logo_url: estab.logo_url,
          descricao_beneficio: estab.descricao_beneficio,
          cep: estab.cep,
          numero: estab.numero,
          complemento: estab.complemento,
          latitude: estab.latitude,
          longitude: estab.longitude,
          whatsapp: estab.whatsapp,
          instagram: estab.instagram,
          site: estab.site,
          periodo_validade_beneficio: estab.periodo_validade_beneficio,
          plan_status: estab.plan_status,
          ativo: estab.ativo,
          created_at: estab.created_at || ''
        };
      }) || [];

      setEstabelecimentos(combined);
      onUpdate?.();
    } catch (error: any) {
      console.error("Erro ao carregar estabelecimentos:", error);
      toast.error("Erro ao carregar estabelecimentos");
    } finally {
      setLoading(false);
    }
  };


  const handleExcluir = async (id: string) => {
    try {
      setExcluindo(true);

      // Deletar cupons do estabelecimento
      const { error: cuponsError } = await supabase
        .from('cupons')
        .delete()
        .eq('estabelecimento_id', id);

      if (cuponsError) throw cuponsError;

      // Deletar favoritos
      const { error: favoritosError } = await supabase
        .from('favoritos')
        .delete()
        .eq('estabelecimento_id', id);

      if (favoritosError) throw favoritosError;

      // Deletar role se existir
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', id);

      // Deletar estabelecimento
      const { error: estabError } = await supabase
        .from('estabelecimentos')
        .delete()
        .eq('id', id);

      if (estabError) throw estabError;

      // Deletar profile se existir
      await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      // Tentar deletar usuário do auth (pode falhar se não tiver service role)
      await supabase.auth.admin.deleteUser(id).catch(() => {});

      toast.success("Estabelecimento excluído com sucesso!");
      await carregarEstabelecimentos();
    } catch (error: any) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir estabelecimento");
    } finally {
      setExcluindo(false);
    }
  };

  const handleBulkFetchPhotos = async () => {
    try {
      setBulkFetchingPhotos(true);
      
      // Buscar estabelecimentos sem foto
      const { data: establishments, error } = await supabase
        .from('estabelecimentos')
        .select('*')
        .or('logo_url.is.null,logo_url.eq.');

      if (error) throw error;
      if (!establishments || establishments.length === 0) {
        toast.info("Todos os estabelecimentos já possuem fotos!");
        setBulkFetchingPhotos(false);
        return;
      }

      setPhotoProgress({ current: 0, total: establishments.length });
      let updated = 0;

      for (let i = 0; i < establishments.length; i++) {
        const est = establishments[i];
        setPhotoProgress({ current: i + 1, total: establishments.length });

        try {
          const query = `${est.nome_fantasia || est.razao_social} ${est.endereco || est.cidade || ''}`;
          
          const findPlaceResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,photos&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          
          const findPlaceData = await findPlaceResponse.json();
          
          if (findPlaceData.status === 'OK' && findPlaceData.candidates?.[0]) {
            const place = findPlaceData.candidates[0];
            
            if (place.photos && place.photos.length > 0) {
              const photoReference = place.photos[0].photo_reference;
              const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
              
              await supabase
                .from('estabelecimentos')
                .update({ logo_url: photoUrl })
                .eq('id', est.id);
              
              updated++;
            }
          }
          
          // Delay para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          console.error(`Erro ao buscar foto para ${est.nome_fantasia}:`, err);
        }
      }

      toast.success(`${updated} fotos atualizadas de ${establishments.length} estabelecimentos`);
      await carregarEstabelecimentos();
    } catch (error: any) {
      console.error("Erro ao buscar fotos em massa:", error);
      toast.error("Erro ao buscar fotos");
    } finally {
      setBulkFetchingPhotos(false);
      setPhotoProgress({ current: 0, total: 0 });
    }
  };

  const estabelecimentosFiltrados = estabelecimentos.filter(e =>
    (e.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    e.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cnpj.includes(searchTerm)
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Gerenciar Estabelecimentos</CardTitle>
              <CardDescription>
                Total de {estabelecimentos.length} estabelecimento(s) cadastrado(s)
              </CardDescription>
            </div>
            <Button
              onClick={handleBulkFetchPhotos}
              disabled={bulkFetchingPhotos}
              variant="outline"
            >
              {bulkFetchingPhotos ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando Fotos...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  🔄 Buscar Fotos Sem Imagem
                </>
              )}
            </Button>
          </div>

          {bulkFetchingPhotos && photoProgress.total > 0 && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando fotos...</span>
                <span>{photoProgress.current} / {photoProgress.total}</span>
              </div>
              <Progress value={(photoProgress.current / photoProgress.total) * 100} />
            </div>
          )}
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, razão social ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <CadastrarEstabelecimento onSuccess={carregarEstabelecimentos} />
      </CardHeader>
      <CardContent>
        {estabelecimentosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum estabelecimento encontrado</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>Cidade/Estado</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estabelecimentosFiltrados.map((estab) => (
                  <TableRow key={estab.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {estab.logo_url && (
                          <img 
                            src={estab.logo_url} 
                            alt={estab.nome_fantasia || ''}
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <div className="flex flex-col gap-1">
                          <span>{estab.nome_fantasia || '-'}</span>
                          {(!estab.categoria || estab.categoria.length === 0) && (
                            <Badge variant="destructive" className="w-fit text-xs">
                              Sem Categoria
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {estab.cidade && estab.estado ? `${estab.cidade} - ${estab.estado}` : '-'}
                    </TableCell>
                    <TableCell>{estab.cnpj}</TableCell>
                    <TableCell>{estab.email}</TableCell>
                    <TableCell>{estab.telefone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditando(estab);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir <strong>{estab.nome_fantasia || estab.razao_social}</strong>? 
                                Esta ação é irreversível e removerá todos os dados, incluindo cupons e favoritos associados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleExcluir(estab.id)}
                                disabled={excluindo}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {excluindo ? "Excluindo..." : "Excluir"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>

    <EditEstablishmentModal
      establishment={editando}
      open={modalOpen}
      onOpenChange={setModalOpen}
      onSuccess={carregarEstabelecimentos}
    />
    </>
  );
}