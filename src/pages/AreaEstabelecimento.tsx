import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, LogOut, Edit2, Save, Ticket, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AreaEstabelecimento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [searchCPF, setSearchCPF] = useState("");
  const [foundAniversariante, setFoundAniversariante] = useState<any>(null);
  const [formData, setFormData] = useState({
    nomeFantasia: "",
    email: "",
    telefone: "",
    categoria: "",
    endereco: "",
    diasHorarioFuncionamento: "",
    linkCardapioDigital: "",
    beneficiosAniversariante: "",
    regrasAniversariante: "",
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("currentEstabelecimento");
    if (!currentUser) {
      navigate("/login/estabelecimento");
    } else {
      const user = JSON.parse(currentUser);
      setUserData(user);
      setFormData({
        nomeFantasia: user.nomeFantasia,
        email: user.email,
        telefone: user.telefone,
        categoria: user.categoria,
        endereco: user.endereco,
        diasHorarioFuncionamento: user.diasHorarioFuncionamento,
        linkCardapioDigital: user.linkCardapioDigital,
        beneficiosAniversariante: user.beneficiosAniversariante,
        regrasAniversariante: user.regrasAniversariante,
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentEstabelecimento");
    navigate("/");
  };

  const handleSave = () => {
    const estabelecimentos = JSON.parse(localStorage.getItem("estabelecimentos") || "[]");
    const updatedEstabelecimentos = estabelecimentos.map((e: any) => 
      e.id === userData.id ? { ...e, ...formData } : e
    );
    
    localStorage.setItem("estabelecimentos", JSON.stringify(updatedEstabelecimentos));
    localStorage.setItem("currentEstabelecimento", JSON.stringify({ ...userData, ...formData }));
    
    setUserData({ ...userData, ...formData });
    setIsEditing(false);
    
    toast({
      title: "Sucesso!",
      description: "Dados atualizados com sucesso",
    });
  };

  const handleSearchAniversariante = () => {
    const aniversariantes = JSON.parse(localStorage.getItem("aniversariantes") || "[]");
    const found = aniversariantes.find((a: any) => a.cpf === searchCPF);
    
    if (found) {
      setFoundAniversariante(found);
    } else {
      toast({
        variant: "destructive",
        title: "Não encontrado",
        description: "Nenhum aniversariante encontrado com este CPF",
      });
      setFoundAniversariante(null);
    }
  };

  const handleEmitirCupom = () => {
    if (!foundAniversariante) return;

    const cupons = JSON.parse(localStorage.getItem("cupons") || "[]");
    const novoCupom = {
      id: Date.now().toString(),
      estabelecimentoId: userData.id,
      estabelecimentoNome: userData.nomeFantasia,
      aniversarianteNome: foundAniversariante.nomeCompleto,
      aniversarianteDataNascimento: foundAniversariante.dataNascimento,
      dataEmissao: new Date().toISOString(),
      usado: false,
    };

    cupons.push(novoCupom);
    localStorage.setItem("cupons", JSON.stringify(cupons));

    toast({
      title: "Cupom Emitido!",
      description: `Cupom emitido para ${foundAniversariante.nomeCompleto}`,
    });

    setSearchCPF("");
    setFoundAniversariante(null);
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">ANIVERSARIANTE VIP</h1>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Ticket className="mr-2 h-4 w-4" />
                  Emitir Cupom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Emitir Cupom de Aniversário</DialogTitle>
                  <DialogDescription>
                    Busque o aniversariante pelo CPF para emitir o cupom
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o CPF"
                      value={searchCPF}
                      onChange={(e) => setSearchCPF(e.target.value)}
                    />
                    <Button onClick={handleSearchAniversariante}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {foundAniversariante && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Aniversariante Encontrado</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Nome:</strong> {foundAniversariante.nomeCompleto}</p>
                        <p><strong>CPF:</strong> {foundAniversariante.cpf}</p>
                        <p><strong>Data de Nascimento:</strong> {new Date(foundAniversariante.dataNascimento).toLocaleDateString('pt-BR')}</p>
                        <Button onClick={handleEmitirCupom} className="w-full mt-4">
                          <Ticket className="mr-2 h-4 w-4" />
                          Emitir Cupom
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Dados do Estabelecimento</CardTitle>
            <CardDescription>Gerencie as informações do seu negócio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="restaurante">Restaurante</SelectItem>
                  <SelectItem value="balada">Balada</SelectItem>
                  <SelectItem value="loja">Loja</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diasHorarioFuncionamento">Dias e Horário de Funcionamento</Label>
              <Textarea
                id="diasHorarioFuncionamento"
                value={formData.diasHorarioFuncionamento}
                onChange={(e) => setFormData({ ...formData, diasHorarioFuncionamento: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkCardapioDigital">Link do Cardápio Digital</Label>
              <Input
                id="linkCardapioDigital"
                value={formData.linkCardapioDigital}
                onChange={(e) => setFormData({ ...formData, linkCardapioDigital: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiosAniversariante">Benefícios para Aniversariantes</Label>
              <Textarea
                id="beneficiosAniversariante"
                value={formData.beneficiosAniversariante}
                onChange={(e) => setFormData({ ...formData, beneficiosAniversariante: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regrasAniversariante">Regras para Aniversariantes</Label>
              <Textarea
                id="regrasAniversariante"
                value={formData.regrasAniversariante}
                onChange={(e) => setFormData({ ...formData, regrasAniversariante: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar dados
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
