import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, LogOut, Edit2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AreaAniversariante() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    email: "",
    telefone: "",
    dataNascimento: "",
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("currentAniversariante");
    if (!currentUser) {
      navigate("/login/aniversariante");
    } else {
      const user = JSON.parse(currentUser);
      setUserData(user);
      setFormData({
        nomeCompleto: user.nomeCompleto,
        cpf: user.cpf,
        email: user.email,
        telefone: user.telefone,
        dataNascimento: user.dataNascimento,
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentAniversariante");
    navigate("/");
  };

  const handleSave = () => {
    const aniversariantes = JSON.parse(localStorage.getItem("aniversariantes") || "[]");
    const updatedAniversariantes = aniversariantes.map((a: any) => 
      a.id === userData.id ? { ...a, ...formData, dataNascimento: userData.dataNascimento } : a
    );
    
    localStorage.setItem("aniversariantes", JSON.stringify(updatedAniversariantes));
    localStorage.setItem("currentAniversariante", JSON.stringify({ ...userData, ...formData, dataNascimento: userData.dataNascimento }));
    
    setUserData({ ...userData, ...formData, dataNascimento: userData.dataNascimento });
    setIsEditing(false);
    
    toast({
      title: "Sucesso!",
      description: "Dados atualizados com sucesso",
    });
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
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Meus Dados</CardTitle>
            <CardDescription>Gerencie suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">Nome Completo</Label>
              <Input
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">O CPF não pode ser alterado</p>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">Data de Nascimento</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={userData.dataNascimento}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">A data de nascimento não pode ser alterada após o cadastro</p>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar meus dados
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
