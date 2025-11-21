import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2, Search, Building2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { CadastrarEstabelecimento } from "./CadastrarEstabelecimento";

type Estabelecimento = {
  id: string;
  nome_fantasia: string | null;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  logo_url: string | null;
  descricao_beneficio: string | null;
  created_at: string;
};

export function GerenciarEstabelecimentos({ onUpdate }: { onUpdate?: () => void }) {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editando, setEditando] = useState<Estabelecimento | null>(null);
  const [salvando, setSalvando] = useState(false);

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
          logo_url: estab.logo_url,
          descricao_beneficio: estab.descricao_beneficio,
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

  const handleSalvar = async () => {
    if (!editando) return;

    try {
      setSalvando(true);

      // Atualizar estabelecimento
      const { error } = await supabase
        .from('estabelecimentos')
        .update({
          nome_fantasia: editando.nome_fantasia,
          telefone: editando.telefone,
          endereco: editando.endereco,
          descricao_beneficio: editando.descricao_beneficio
        })
        .eq('id', editando.id);

      if (error) throw error;

      toast.success("Estabelecimento atualizado com sucesso!");
      setEditando(null);
      await carregarEstabelecimentos();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setSalvando(false);
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <CardTitle>Gerenciar Estabelecimentos</CardTitle>
          <CardDescription>
            Total de {estabelecimentos.length} estabelecimento(s) cadastrado(s)
          </CardDescription>
          
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
                  <TableHead>Razão Social</TableHead>
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
                        {estab.nome_fantasia || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{estab.razao_social}</TableCell>
                    <TableCell>{estab.cnpj}</TableCell>
                    <TableCell>{estab.email}</TableCell>
                    <TableCell>{estab.telefone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditando(estab)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editar Estabelecimento</DialogTitle>
                            <DialogDescription>
                              Edite as informações do estabelecimento
                            </DialogDescription>
                          </DialogHeader>
                          
                          {editando && (
                            <div className="space-y-4">
                              {editando.logo_url && (
                                <div className="flex justify-center">
                                  <img 
                                    src={editando.logo_url} 
                                    alt="Logo"
                                    className="h-24 w-24 rounded object-cover"
                                  />
                                </div>
                              )}
                              
                              <div>
                                <Label>Nome Fantasia</Label>
                                <Input
                                  value={editando.nome_fantasia || ''}
                                  onChange={(e) => setEditando({...editando, nome_fantasia: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label>Razão Social</Label>
                                <Input value={editando.razao_social} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground mt-1">Razão social não pode ser alterada</p>
                              </div>
                              
                              <div>
                                <Label>CNPJ</Label>
                                <Input value={editando.cnpj} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground mt-1">CNPJ não pode ser alterado</p>
                              </div>
                              
                              <div>
                                <Label>Email</Label>
                                <Input value={editando.email} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground mt-1">Email não pode ser alterado</p>
                              </div>
                              
                              <div>
                                <Label>Telefone</Label>
                                <Input
                                  value={editando.telefone || ''}
                                  onChange={(e) => setEditando({...editando, telefone: e.target.value})}
                                  placeholder="(00) 00000-0000"
                                />
                              </div>
                              
                              <div>
                                <Label>Endereço</Label>
                                <Input
                                  value={editando.endereco || ''}
                                  onChange={(e) => setEditando({...editando, endereco: e.target.value})}
                                  placeholder="Rua, número, bairro, cidade - UF"
                                />
                              </div>
                              
                              <div>
                                <Label>Descrição do Benefício</Label>
                                <Textarea
                                  value={editando.descricao_beneficio || ''}
                                  onChange={(e) => setEditando({...editando, descricao_beneficio: e.target.value})}
                                  placeholder="Ex: 10% de desconto para aniversariantes"
                                  rows={3}
                                />
                              </div>
                              
                              <Button 
                                onClick={handleSalvar} 
                                disabled={salvando}
                                className="w-full"
                              >
                                {salvando ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                  </>
                                ) : (
                                  'Salvar Alterações'
                                )}
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}