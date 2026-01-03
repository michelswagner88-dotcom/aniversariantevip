import { useState } from "react";
import { Shield, Trash2, LogOut, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

interface EstablishmentSettingsProps {
  estabelecimento: any;
  onUpdate: (updates: any) => Promise<boolean>;
  onLogout: () => void;
}

export function EstablishmentSettings({ estabelecimento, onUpdate, onLogout }: EstablishmentSettingsProps) {
  const handleLogout = () => {
    toast.success("Saindo da conta...");
    onLogout();
  };

  const handleDeleteAccount = () => {
    toast.error("Funcionalidade em desenvolvimento. Entre em contato com o suporte.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
          <p className="text-muted-foreground">Gerencie suas preferências</p>
        </div>
      </div>

      {/* Conta */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5" />
            Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">E-mail</p>
              <p className="text-sm text-muted-foreground">{estabelecimento?.email || "-"}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Alterar
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Senha</p>
              <p className="text-sm text-muted-foreground">••••••••</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Alterar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-destructive/50 bg-card">
        <CardHeader>
          <CardTitle className="text-destructive">
            <Trash2 className="w-5 h-5" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Sair da conta</p>
              <p className="text-sm text-muted-foreground">Encerrar sessão atual</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Excluir conta</p>
              <p className="text-sm text-muted-foreground">Remover permanentemente sua conta e dados</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                    e removerá seus dados de nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                  >
                    Excluir conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EstablishmentSettings;
