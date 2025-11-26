import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";
import { z } from "zod";

const cadastroSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100, "Senha muito longa"),
  nome: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
});

const SetupAdmin = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingAdmins();
  }, []);

  const checkExistingAdmins = async () => {
    try {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (count && count > 0) {
        toast.info("Já existem administradores cadastrados");
        navigate("/login/colaborador");
      }
    } catch (error) {
      console.error("Erro ao verificar admins:", error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm("ATENÇÃO: Isso vai remover TODOS os usuários do sistema. Deseja continuar?")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('cleanup-orphan-users');
      
      if (error) {
        throw error;
      }

      toast.success("Todos os usuários foram removidos. Você pode criar o primeiro admin agora.");
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao limpar usuários:", error);
      toast.error("Erro ao limpar usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = cadastroSchema.parse({ email, senha, nome });
      setLoading(true);

      // Usar Edge Function para criar admin com permissões elevadas
      const { data, error } = await supabase.functions.invoke('setup-first-admin', {
        body: {
          email: validatedData.email,
          password: validatedData.senha,
          nome: validatedData.nome
        }
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        throw new Error(error.message || "Erro ao criar administrador");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success("Primeiro administrador cadastrado com sucesso!");
      navigate("/admin");
      
    } catch (error: any) {
      console.error("Erro completo:", error);
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        const errorMessage = error.message || "Erro ao cadastrar administrador";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Setup Inicial</CardTitle>
          <CardDescription>Cadastre o primeiro administrador do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCadastro} className="space-y-4">
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
                placeholder="João Silva"
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
                placeholder="admin@sistema.com"
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Criar Administrador"
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full mt-2" 
              onClick={handleCleanup}
              disabled={loading}
            >
              Limpar Todos os Usuários (Reset)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAdmin;
