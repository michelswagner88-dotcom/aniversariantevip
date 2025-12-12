import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Loader2, Search, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditUserModal } from "@/components/admin/EditUserModal";

type Aniversariante = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
  data_nascimento: string;
  cidade: string;
  estado: string;
  bairro: string;
  logradouro: string;
  numero: string | null;
  complemento: string | null;
  cep: string;
  created_at: string;
};

export function GerenciarAniversariantes() {
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editando, setEditando] = useState<Aniversariante | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarAniversariantes();
  }, []);

  const carregarAniversariantes = async () => {
    try {
      setLoading(true);

      // Buscar IDs dos aniversariantes
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "aniversariante");

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        setAniversariantes([]);
        return;
      }

      const userIds = roles.map((r) => r.user_id);

      // Buscar profiles
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", userIds);

      if (profilesError) throw profilesError;

      // Buscar dados específicos de aniversariantes
      const { data: anivData, error: anivError } = await supabase.from("aniversariantes").select("*").in("id", userIds);

      if (anivError) throw anivError;

      // Combinar dados
      const combined =
        profiles?.map((profile) => {
          const aniv = anivData?.find((a) => a.id === profile.id);
          return {
            id: profile.id,
            nome: profile.nome || "Sem nome",
            email: profile.email,
            cpf: aniv?.cpf || "",
            telefone: aniv?.telefone,
            data_nascimento: aniv?.data_nascimento || "",
            cidade: aniv?.cidade || "",
            estado: aniv?.estado || "",
            bairro: aniv?.bairro || "",
            logradouro: aniv?.logradouro || "",
            numero: aniv?.numero,
            complemento: aniv?.complemento,
            cep: aniv?.cep || "",
            created_at: profile.created_at || "",
          };
        }) || [];

      setAniversariantes(combined);
    } catch {
      toast.error("Erro ao carregar aniversariantes");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string) => {
    try {
      setExcluindo(true);

      // Chamar Edge Function que faz hard delete completo
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId: id },
      });

      if (error) {
        throw new Error(error.message || "Erro ao excluir usuário");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Erro ao excluir usuário");
      }

      toast.success("Usuário removido completamente do sistema!");
      await carregarAniversariantes();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao excluir aniversariante. Tente novamente.");
      } else {
        toast.error("Erro ao excluir aniversariante. Tente novamente.");
      }
    } finally {
      setExcluindo(false);
    }
  };

  const aniversariantesFiltrados = aniversariantes.filter(
    (a) =>
      a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cpf.includes(searchTerm),
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Carregando aniversariantes...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Aniversariantes</CardTitle>
          <CardDescription>Total de {aniversariantes.length} aniversariante(s) cadastrado(s)</CardDescription>

          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 min-h-[44px]"
              aria-label="Buscar aniversariantes"
            />
          </div>
        </CardHeader>
        <CardContent>
          {aniversariantesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
              <p>Nenhum aniversariante encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Data Nasc.</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aniversariantesFiltrados.map((aniv) => (
                    <TableRow key={aniv.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{aniv.nome}</p>
                          <p className="text-sm text-muted-foreground">{aniv.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{aniv.cpf}</TableCell>
                      <TableCell>{aniv.telefone || "-"}</TableCell>
                      <TableCell>{aniv.cidade && aniv.estado ? `${aniv.cidade}, ${aniv.estado}` : "-"}</TableCell>
                      <TableCell>
                        {aniv.data_nascimento ? new Date(aniv.data_nascimento).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell>
                        {aniv.created_at ? new Date(aniv.created_at).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditando(aniv);
                              setModalOpen(true);
                            }}
                            className="min-h-[44px] min-w-[44px]"
                            aria-label={`Editar ${aniv.nome}`}
                          >
                            <Edit className="h-4 w-4" aria-hidden="true" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]"
                                aria-label={`Excluir ${aniv.nome}`}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>⚠️ Confirmar Exclusão Permanente</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div>
                                    <p className="text-destructive font-semibold">ATENÇÃO: Esta ação é irreversível!</p>
                                    <p className="mt-2">
                                      Ao confirmar, o usuário <strong>{aniv.nome}</strong> será completamente removido
                                      do sistema:
                                    </p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                      <li>Todos os cupons emitidos serão excluídos</li>
                                      <li>Favoritos e interações serão apagados</li>
                                      <li>CPF, telefone e email ficarão livres para novo cadastro</li>
                                      <li>Conta de acesso será removida permanentemente</li>
                                    </ul>
                                    <p className="mt-4 font-semibold">Tem certeza que deseja prosseguir?</p>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleExcluir(aniv.id)}
                                  disabled={excluindo}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]"
                                >
                                  {excluindo ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                      Excluindo...
                                    </>
                                  ) : (
                                    "Excluir Permanentemente"
                                  )}
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

      <EditUserModal user={editando} open={modalOpen} onOpenChange={setModalOpen} onSuccess={carregarAniversariantes} />
    </>
  );
}
