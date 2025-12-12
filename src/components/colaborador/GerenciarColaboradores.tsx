import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { UserPlus, Trash2, Loader2, Edit2, Users, Search } from "lucide-react";
import { z } from "zod";

// Tipos
type RoleType = "admin" | "colaborador";

interface Colaborador {
  id: string;
  user_id: string;
  role: RoleType;
  created_at: string;
  email: string | null;
  nome: string | null;
}

const colaboradorSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100, "Senha muito longa"),
  nome: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
});

// Skeleton da tabela para loading inicial
const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-6 w-[100px] rounded-full" />
        <Skeleton className="h-4 w-[100px]" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

// Empty state bonito
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <Users className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-semibold mb-1">Nenhum colaborador</h3>
    <p className="text-sm text-muted-foreground mb-4 max-w-sm">
      Adicione colaboradores para ajudar a gerenciar o sistema. Você pode definir diferentes níveis de permissão.
    </p>
    <Button onClick={onAdd} className="min-h-[44px]">
      <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
      Adicionar Primeiro Colaborador
    </Button>
  </div>
);

export const GerenciarColaboradores = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("colaborador");
  const [editingUser, setEditingUser] = useState<Colaborador | null>(null);

  useEffect(() => {
    carregarColaboradores();
  }, []);

  const carregarColaboradores = async () => {
    try {
      // 1. Buscar roles de admin e colaborador
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .in("role", ["admin", "colaborador"])
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) {
        setColaboradores([]);
        return;
      }

      // 2. Buscar profiles dos usuários
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, nome")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // 3. Combinar dados
      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const colaboradoresData: Colaborador[] = roles
        .filter((r): r is typeof r & { role: RoleType } => r.role === "admin" || r.role === "colaborador")
        .map((r) => {
          const profile = profilesMap.get(r.user_id);
          return {
            id: r.id,
            user_id: r.user_id,
            role: r.role,
            created_at: r.created_at,
            email: profile?.email || null,
            nome: profile?.nome || null,
          };
        });

      setColaboradores(colaboradoresData);
    } catch {
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setSenha("");
    setNome("");
    setSelectedRole("colaborador");
  };

  const handleAdicionarColaborador = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = colaboradorSchema.parse({ email, senha, nome });
      setSaving(true);

      const redirectUrl = `${window.location.origin}/area-colaborador`;

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.senha,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: validatedData.nome,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: selectedRole,
        });

        if (roleError) throw roleError;

        toast.success("Colaborador adicionado com sucesso!", {
          description: `${validatedData.nome} foi adicionado como ${selectedRole === "admin" ? "Administrador" : "Colaborador"}`,
        });
        setDialogOpen(false);
        resetForm();
        carregarColaboradores();
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else if (error instanceof Error) {
        toast.error(error.message || "Erro ao adicionar colaborador");
      } else {
        toast.error("Erro ao adicionar colaborador");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverColaborador = async (userId: string, role: RoleType, nome: string) => {
    try {
      setRemovingId(userId);

      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);

      if (error) throw error;

      toast.success("Colaborador removido", {
        description: `${nome} foi removido da equipe`,
      });
      carregarColaboradores();
    } catch {
      toast.error("Erro ao remover colaborador");
    } finally {
      setRemovingId(null);
    }
  };

  const handleEditRole = (user: Colaborador) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("user_roles")
        .update({ role: selectedRole })
        .eq("user_id", editingUser.user_id)
        .eq("role", editingUser.role);

      if (error) throw error;

      toast.success("Permissões atualizadas!", {
        description: `${editingUser.nome || "Usuário"} agora é ${selectedRole === "admin" ? "Administrador" : "Colaborador"}`,
      });
      setEditDialogOpen(false);
      setEditingUser(null);
      carregarColaboradores();
    } catch {
      toast.error("Erro ao atualizar permissões");
    } finally {
      setSaving(false);
    }
  };

  // Filtro de busca
  const colaboradoresFiltrados = colaboradores.filter((c) => {
    if (!searchTerm) return true;
    const termo = searchTerm.toLowerCase();
    return c.nome?.toLowerCase().includes(termo) || c.email?.toLowerCase().includes(termo);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Gerenciar Colaboradores</CardTitle>
            <CardDescription>
              {colaboradores.length} colaborador{colaboradores.length !== 1 ? "es" : ""} na equipe
            </CardDescription>
          </div>

          {/* Dialog Adicionar */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-[44px]">
                <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Colaborador</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdicionarColaborador} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    maxLength={100}
                    placeholder="Nome do colaborador"
                    className="min-h-[44px]"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={255}
                    placeholder="colaborador@email.com"
                    className="min-h-[44px]"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha (mínimo 6 caracteres)</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    placeholder="••••••••"
                    className="min-h-[44px]"
                    disabled={saving}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Permissão</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value: RoleType) => setSelectedRole(value)}
                    disabled={saving}
                  >
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder="Selecione a permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    <strong>Colaborador:</strong> Gerencia estabelecimentos e aniversariantes.
                    <br />
                    <strong>Administrador:</strong> Acesso total ao sistema.
                  </p>
                </div>
                <Button type="submit" className="w-full min-h-[44px]" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar Colaborador"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Busca - aparece se tiver mais de 5 colaboradores */}
        {colaboradores.length > 5 && (
          <div className="relative mt-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 min-h-[44px]"
              aria-label="Buscar colaboradores"
            />
          </div>
        )}

        {/* Dialog Editar */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Permissões</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{editingUser?.nome || "Sem nome"}</p>
                <p className="text-sm text-muted-foreground">{editingUser?.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Tipo de Permissão</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: RoleType) => setSelectedRole(value)}
                  disabled={saving}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Selecione a permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateRole} className="w-full min-h-[44px]" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {/* Loading inicial - Skeleton */}
        {loading && <TableSkeleton />}

        {/* Lista vazia - Empty State */}
        {!loading && colaboradores.length === 0 && <EmptyState onAdd={() => setDialogOpen(true)} />}

        {/* Tabela de colaboradores */}
        {!loading && colaboradores.length > 0 && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradoresFiltrados.map((colab) => {
                  const isRemoving = removingId === colab.user_id;
                  const nomeExibicao = colab.nome || "Sem nome";

                  return (
                    <TableRow key={colab.id} className={isRemoving ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{nomeExibicao}</TableCell>
                      <TableCell className="text-muted-foreground">{colab.email || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={colab.role === "admin" ? "default" : "secondary"}>
                          {colab.role === "admin" ? "Admin" : "Colaborador"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(colab.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(colab)}
                            disabled={isRemoving}
                            className="min-h-[44px] min-w-[44px]"
                            aria-label={`Editar permissões de ${nomeExibicao}`}
                          >
                            <Edit2 className="h-4 w-4" aria-hidden="true" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isRemoving}
                                className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive"
                                aria-label={`Remover ${nomeExibicao}`}
                              >
                                {isRemoving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover {nomeExibicao}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação irá remover a permissão de{" "}
                                  <strong>{colab.role === "admin" ? "Administrador" : "Colaborador"}</strong> deste
                                  usuário.
                                  <br />
                                  <br />A conta continuará existindo, apenas o acesso ao painel será removido.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoverColaborador(colab.user_id, colab.role, nomeExibicao)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Busca sem resultados */}
                {colaboradoresFiltrados.length === 0 && searchTerm && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum colaborador encontrado para "{searchTerm}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
