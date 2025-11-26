import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Loader2, Edit2 } from "lucide-react";
import { z } from "zod";

const colaboradorSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100, "Senha muito longa"),
  nome: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
});

export const GerenciarColaboradores = () => {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'colaborador'>('colaborador');
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    carregarColaboradores();
  }, []);

  const carregarColaboradores = async () => {
    try {
      setLoading(true);
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            nome
          )
        `)
        .in('role', ['admin', 'colaborador']);

      if (error) throw error;
      setColaboradores(roles || []);
    } catch (error: any) {
      toast.error("Erro ao carregar colaboradores");
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = colaboradorSchema.parse({ email, senha, nome });
      setLoading(true);

      const redirectUrl = `${window.location.origin}/area-colaborador`;

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.senha,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: validatedData.nome,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: selectedRole
          });

        if (roleError) throw roleError;

        toast.success("Colaborador adicionado com sucesso!");
        setDialogOpen(false);
        setEmail("");
        setSenha("");
        setNome("");
        setSelectedRole('colaborador');
        carregarColaboradores();
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error(error.message || "Erro ao adicionar colaborador");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverColaborador = async (userId: string, role: string) => {
    if (!confirm("Tem certeza que deseja remover este colaborador?")) return;

    try {
      setLoading(true);
      
      // Remover role específica
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;

      toast.success("Colaborador removido com sucesso!");
      carregarColaboradores();
    } catch (error: any) {
      toast.error("Erro ao remover colaborador");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: any) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_roles')
        .update({ role: selectedRole as any })
        .eq('user_id', editingUser.user_id)
        .eq('role', editingUser.role as any);

      if (error) throw error;

      toast.success("Permissões atualizadas com sucesso!");
      setEditDialogOpen(false);
      setEditingUser(null);
      carregarColaboradores();
    } catch (error: any) {
      toast.error("Erro ao atualizar permissões");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Colaboradores</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Colaborador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdicionarColaborador} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nome" className="text-sm font-medium">
                  Nome Completo
                </label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Nome do colaborador"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  placeholder="colaborador@email.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="senha" className="text-sm font-medium">
                  Senha (mínimo 6 caracteres)
                </label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                  maxLength={100}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Tipo de Permissão
                </label>
                <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Colaborador: Pode gerenciar estabelecimentos e aniversariantes.<br/>
                  Administrador: Acesso total ao sistema.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Permissões</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Usuário</p>
                <p className="text-sm text-muted-foreground">{editingUser?.profiles?.nome}</p>
                <p className="text-xs text-muted-foreground">{editingUser?.profiles?.email}</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-role" className="text-sm font-medium">
                  Tipo de Permissão
                </label>
                <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateRole} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        {loading && colaboradores.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores.map((colab) => (
                <TableRow key={colab.id}>
                  <TableCell>{colab.profiles?.nome || "N/A"}</TableCell>
                  <TableCell>{colab.profiles?.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={colab.role === 'admin' ? 'default' : 'secondary'}>
                      {colab.role === 'admin' ? 'Administrador' : 'Colaborador'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(colab.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(colab)}
                        disabled={loading}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverColaborador(colab.user_id, colab.role)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {colaboradores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum colaborador cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
