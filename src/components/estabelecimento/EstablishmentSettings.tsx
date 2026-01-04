// =============================================================================
// ESTABLISHMENT SETTINGS - Configurações LIGHT
// Tema Light Premium estilo Stripe/Linear
// =============================================================================

import { Shield, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PanelSection } from "@/components/panel/PanelSection";
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Configurações</h1>
        <p className="text-[#6B7280] mt-1">Gerencie suas preferências</p>
      </div>

      {/* Conta */}
      <PanelSection title="Conta" icon={<Shield className="w-5 h-5 text-blue-500" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#111827]">E-mail</p>
              <p className="text-sm text-[#6B7280]">{estabelecimento?.email || "-"}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#E7E7EA] text-[#111827] hover:bg-[#F7F7F8]"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Alterar
            </Button>
          </div>
          <Separator className="bg-[#E7E7EA]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#111827]">Senha</p>
              <p className="text-sm text-[#6B7280]">••••••••</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#E7E7EA] text-[#111827] hover:bg-[#F7F7F8]"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Alterar
            </Button>
          </div>
        </div>
      </PanelSection>

      {/* Zona de Perigo */}
      <div className="bg-white border border-red-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-red-100">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-red-700">Zona de Perigo</h3>
            <p className="text-sm text-[#6B7280] mt-0.5">Ações irreversíveis</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#111827]">Sair da conta</p>
              <p className="text-sm text-[#6B7280]">Encerrar sessão atual</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[#E7E7EA] text-[#111827] hover:bg-[#F7F7F8]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
          <Separator className="bg-red-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#111827]">Excluir conta</p>
              <p className="text-sm text-[#6B7280]">Remover permanentemente sua conta e dados</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border-[#E7E7EA]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[#111827]">Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#6B7280]">
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de
                    nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#E7E7EA] text-[#111827] hover:bg-[#F7F7F8]">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteAccount}>
                    Excluir conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstablishmentSettings;
