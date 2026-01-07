import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface RoleRedirectProps {
  type: "perfil" | "favoritos";
}

/**
 * Componente que redireciona baseado na role do usuário.
 * - /perfil → área específica da role
 * - /favoritos → meus-favoritos (aniversariante) ou home (outras roles)
 */
export const RoleRedirect = ({ type }: RoleRedirectProps) => {
  const navigate = useNavigate();
  const { user, role, loading } = useUserRole();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (type === "perfil") {
      switch (role) {
        case "estabelecimento":
          navigate("/area-estabelecimento", { replace: true });
          break;
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "colaborador":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "aniversariante":
          navigate("/area-aniversariante", { replace: true });
          break;
        default:
          // Sem role definida - ir para seleção de perfil
          navigate("/selecionar-perfil", { replace: true });
          break;
      }
    } else if (type === "favoritos") {
      if (role === "aniversariante") {
        navigate("/meus-favoritos", { replace: true });
      } else if (role === "estabelecimento") {
        navigate("/area-estabelecimento", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [loading, user, role, type, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default RoleRedirect;
