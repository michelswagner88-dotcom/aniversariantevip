import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Store, Search, Loader2, ToggleLeft, ToggleRight, MapPin, Phone, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

// Tipos
interface Estabelecimento {
  id: string;
  nome_fantasia: string;
  razao_social: string | null;
  cnpj: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  categoria: string[] | null;
  ativo: boolean;
  created_at: string;
  descricao_beneficio: string | null;
}

interface GerenciarEstabelecimentosProps {
  onUpdate?: () => void;
}

// Skeleton da tabela para loading inicial
const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-6 w-[80px] rounded-full" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

// Empty state
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <Store className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
    </div>
    <h3 className="text-lg font-semibold mb-1">Nenhum estabelecimento</h3>
    <p className="text-sm text-muted-foreground mb-4 max-w-sm">Ainda não há estabelecimentos cadastrados no sistema.</p>
  </div>
);

export const GerenciarEstabelecimentos = ({ onUpdate }: GerenciarEstabelecimentosProps) => {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativos" | "inativos">("todos");
  const [filtroCidade, setFiltroCidade] = useState<string>("todas");

  // Lista de cidades únicas para o filtro
  const cidadesUnicas = Array.from(new Set(estabelecimentos.map((e) => e.cidade).filter(Boolean))).sort() as string[];

  useEffect(() => {
    carregarEstabelecimentos();
  }, []);

  const carregarEstabelecimentos = async () => {
    try {
      const { data, error } = await supabase
        .from("estabelecimentos")
        .select(
          "id, nome_fantasia, razao_social, cnpj, telefone, cidade, estado, categoria, ativo, created_at, descricao_beneficio",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEstabelecimentos(data || []);
    } catch {
      toast.error("Erro ao carregar estabelecimentos");
    } finally {
      setLoading(false);
    }
  };

  const toggleAtivo = async (id: string, ativoAtual: boolean, nome: string) => {
    try {
      setTogglingId(id);

      const { error } = await supabase.from("estabelecimentos").update({ ativo: !ativoAtual }).eq("id", id);

      if (error) throw error;

      toast.success(ativoAtual ? "Estabelecimento desativado" : "Estabelecimento ativado", {
        description: nome,
      });

      // Atualiza localmente sem recarregar tudo
      setEstabelecimentos((prev) => prev.map((e) => (e.id === id ? { ...e, ativo: !ativoAtual } : e)));

      // Chama callback para atualizar métricas do pai
      if (onUpdate) {
        onUpdate();
      }
    } catch {
      toast.error("Erro ao atualizar status");
    } finally {
      setTogglingId(null);
    }
  };

  // Filtros combinados
  const estabelecimentosFiltrados = estabelecimentos.filter((e) => {
    // Filtro de busca
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      const matchNome = e.nome_fantasia?.toLowerCase().includes(termo);
      const matchCidade = e.cidade?.toLowerCase().includes(termo);
      const matchCnpj = e.cnpj?.includes(termo);
      if (!matchNome && !matchCidade && !matchCnpj) return false;
    }

    // Filtro de status
    if (filtroStatus === "ativos" && !e.ativo) return false;
    if (filtroStatus === "inativos" && e.ativo) return false;

    // Filtro de cidade
    if (filtroCidade !== "todas" && e.cidade !== filtroCidade) return false;

    return true;
  });

  // Contadores
  const totalAtivos = estabelecimentos.filter((e) => e.ativo).length;
  const totalInativos = estabelecimentos.filter((e) => !e.ativo).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle>Gerenciar Estabelecimentos</CardTitle>
            <CardDescription>
              {estabelecimentos.length} estabelecimento(s) • {totalAtivos} ativo(s) • {totalInativos} inativo(s)
            </CardDescription>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Busca */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Buscar por nome, cidade ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 min-h-[44px]"
                aria-label="Buscar estabelecimentos"
              />
            </div>

            {/* Filtro Status */}
            <Select
              value={filtroStatus}
              onValueChange={(value: "todos" | "ativos" | "inativos") => setFiltroStatus(value)}
            >
              <SelectTrigger className="w-full sm:w-[150px] min-h-[44px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativos">Ativos</SelectItem>
                <SelectItem value="inativos">Inativos</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Cidade */}
            {cidadesUnicas.length > 0 && (
              <Select value={filtroCidade} onValueChange={setFiltroCidade}>
                <SelectTrigger className="w-full sm:w-[180px] min-h-[44px]">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as cidades</SelectItem>
                  {cidadesUnicas.map((cidade) => (
                    <SelectItem key={cidade} value={cidade}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading inicial */}
        {loading && <TableSkeleton />}

        {/* Lista vazia */}
        {!loading && estabelecimentos.length === 0 && <EmptyState />}

        {/* Tabela */}
        {!loading && estabelecimentos.length > 0 && (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estabelecimento</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estabelecimentosFiltrados.map((estab) => {
                  const isToggling = togglingId === estab.id;

                  return (
                    <TableRow key={estab.id} className={isToggling ? "opacity-50" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{estab.nome_fantasia}</p>
                          {estab.telefone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" aria-hidden="true" />
                              {estab.telefone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {estab.cidade && estab.estado ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {estab.cidade}, {estab.estado}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {estab.categoria && estab.categoria.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {estab.categoria.slice(0, 2).map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {estab.categoria.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{estab.categoria.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={estab.ativo ? "default" : "secondary"}>
                          {estab.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(estab.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {/* Ver página */}
                          <Button variant="ghost" size="sm" asChild className="min-h-[44px] min-w-[44px]">
                            <Link
                              to={`/estabelecimento/${estab.id}`}
                              target="_blank"
                              aria-label={`Ver página de ${estab.nome_fantasia}`}
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </Button>

                          {/* Toggle ativo/inativo */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isToggling}
                                className="min-h-[44px] min-w-[44px]"
                                aria-label={
                                  estab.ativo ? `Desativar ${estab.nome_fantasia}` : `Ativar ${estab.nome_fantasia}`
                                }
                              >
                                {isToggling ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : estab.ativo ? (
                                  <ToggleRight className="h-4 w-4 text-green-500" aria-hidden="true" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {estab.ativo ? "Desativar" : "Ativar"} {estab.nome_fantasia}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {estab.ativo
                                    ? "O estabelecimento não aparecerá mais nas buscas dos aniversariantes."
                                    : "O estabelecimento voltará a aparecer nas buscas dos aniversariantes."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="min-h-[44px]">Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => toggleAtivo(estab.id, estab.ativo, estab.nome_fantasia)}
                                  className="min-h-[44px]"
                                >
                                  {estab.ativo ? "Desativar" : "Ativar"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Sem resultados na busca */}
                {estabelecimentosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum estabelecimento encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Contador de resultados */}
        {!loading && estabelecimentosFiltrados.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Mostrando {estabelecimentosFiltrados.length} de {estabelecimentos.length} estabelecimento(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
};
