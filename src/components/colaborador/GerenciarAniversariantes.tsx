import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Loader2, Search, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Aniversariante = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
  data_nascimento: string;
  created_at: string;
};

export function GerenciarAniversariantes() {
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editando, setEditando] = useState<Aniversariante | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarAniversariantes();
  }, []);

  const carregarAniversariantes = async () => {
    try {
      setLoading(true);
      
      // Buscar IDs dos aniversariantes
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'aniversariante');

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        setAniversariantes([]);
        return;
      }

      const userIds = roles.map(r => r.user_id);

      // Buscar profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Buscar dados específicos de aniversariantes
      const { data: anivData, error: anivError } = await supabase
        .from('aniversariantes')
        .select('*')
        .in('id', userIds);

      if (anivError) throw anivError;

      // Combinar dados
      const combined = profiles?.map(profile => {
        const aniv = anivData?.find(a => a.id === profile.id);
        return {
          id: profile.id,
          nome: profile.nome || 'Sem nome',
          email: profile.email,
          cpf: aniv?.cpf || '',
          telefone: aniv?.telefone,
          data_nascimento: aniv?.data_nascimento || '',
          created_at: profile.created_at || ''
        };
      }) || [];

      setAniversariantes(combined);
    } catch (error: any) {
      console.error("Erro ao carregar aniversariantes:", error);
      toast.error("Erro ao carregar aniversariantes");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!editando) return;

    try {
      setSalvando(true);

      // Atualizar profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          nome: editando.nome,
          email: editando.email 
        })
        .eq('id', editando.id);

      if (profileError) throw profileError;

      // Atualizar aniversariante
      const { error: anivError } = await supabase
        .from('aniversariantes')
        .update({
          cpf: editando.cpf,
          telefone: editando.telefone,
          data_nascimento: editando.data_nascimento
        })
        .eq('id', editando.id);

      if (anivError) throw anivError;

      toast.success("Aniversariante atualizado com sucesso!");
      setEditando(null);
      await carregarAniversariantes();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: string) => {
    try {
      setExcluindo(true);

      console.log('🔵 Iniciando exclusão completa do usuário:', id);
      
      // Chamar Edge Function que faz hard delete completo
      // Inclui: cupons, favoritos, followers, interactions, aniversariantes, 
      // user_roles, profiles e Auth
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: id }
      });

      if (error) {
        console.error('❌ Erro ao chamar delete-user:', error);
        throw new Error(error.message || 'Erro ao excluir usuário');
      }

      if (!data?.success) {
        console.error('❌ Edge Function retornou erro:', data);
        throw new Error(data?.error || 'Erro ao excluir usuário');
      }

      console.log('✅ Usuário excluído completamente:', data);
      toast.success("Usuário removido completamente do sistema!");
      await carregarAniversariantes();
    } catch (error: any) {
      console.error("❌ Erro ao excluir:", error);
      toast.error(error.message || "Erro ao excluir aniversariante. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  };

  const aniversariantesFiltrados = aniversariantes.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cpf.includes(searchTerm)
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
      <CardHeader>
        <CardTitle>Gerenciar Aniversariantes</CardTitle>
        <CardDescription>
          Total de {aniversariantes.length} aniversariante(s) cadastrado(s)
        </CardDescription>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {aniversariantesFiltrados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum aniversariante encontrado</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data Nasc.</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aniversariantesFiltrados.map((aniv) => (
                  <TableRow key={aniv.id}>
                    <TableCell className="font-medium">{aniv.nome}</TableCell>
                    <TableCell>{aniv.email}</TableCell>
                    <TableCell>{aniv.cpf}</TableCell>
                    <TableCell>{aniv.telefone || '-'}</TableCell>
                    <TableCell>
                      {aniv.data_nascimento ? new Date(aniv.data_nascimento).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditando(aniv)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Aniversariante</DialogTitle>
                            <DialogDescription>
                              Edite as informações do aniversariante
                            </DialogDescription>
                          </DialogHeader>
                          
                          {editando && (
                            <div className="space-y-4">
                              <div>
                                <Label>Nome</Label>
                                <Input
                                  value={editando.nome}
                                  onChange={(e) => setEditando({...editando, nome: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label>Email</Label>
                                <Input 
                                  type="email"
                                  value={editando.email}
                                  onChange={(e) => setEditando({...editando, email: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label>CPF</Label>
                                <Input 
                                  value={editando.cpf}
                                  onChange={(e) => setEditando({...editando, cpf: e.target.value})}
                                  placeholder="000.000.000-00"
                                />
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
                                <Label>Data de Nascimento</Label>
                                <Input
                                  type="date"
                                  value={editando.data_nascimento}
                                  onChange={(e) => setEditando({...editando, data_nascimento: e.target.value})}
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
                              <AlertDialogTitle>⚠️ Confirmar Exclusão Permanente</AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong className="text-destructive">ATENÇÃO: Esta ação é irreversível!</strong>
                                <br /><br />
                                Ao confirmar, o usuário <strong>{aniv.nome}</strong> será completamente removido do sistema:
                                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                  <li>Todos os cupons emitidos serão excluídos</li>
                                  <li>Favoritos e interações serão apagados</li>
                                  <li>CPF, telefone e email ficarão livres para novo cadastro</li>
                                  <li>Conta de acesso será removida permanentemente</li>
                                </ul>
                                <br />
                                <strong>Tem certeza que deseja prosseguir?</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleExcluir(aniv.id)}
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
  );
}