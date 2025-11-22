import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AreaAniversariante = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    dataNascimento: "",
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login/aniversariante");
          return;
        }

        // Verificar se é aniversariante
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'aniversariante')
          .single();

        if (!roles) {
          await supabase.auth.signOut();
          navigate("/login/aniversariante");
          return;
        }

        // Carregar dados do perfil e aniversariante
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const { data: aniversariante } = await supabase
          .from('aniversariantes')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && aniversariante) {
          setFormData({
            nome: profile.nome || "",
            email: profile.email || "",
            cpf: aniversariante.cpf || "",
            telefone: aniversariante.telefone || "",
            dataNascimento: aniversariante.data_nascimento || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nome: formData.nome })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Atualizar dados do aniversariante
      const { error: anivError } = await supabase
        .from('aniversariantes')
        .update({
          telefone: formData.telefone,
        })
        .eq('id', session.user.id);

      if (anivError) throw anivError;

      setIsEditing(false);
      toast.success("Dados atualizados com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar dados");
      console.error("Erro:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
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
                value={formData.dataNascimento}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">A data de nascimento não pode ser alterada</p>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  Editar Meus Dados
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="flex-1">
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
};

export default AreaAniversariante;
