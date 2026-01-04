import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "estabelecimento" | "admin" | "colaborador" | "aniversariante" | null;

interface UseUserRoleReturn {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Hook centralizado para obter o usuário atual e sua role.
 * Prioridade de roles: estabelecimento > admin > colaborador > aniversariante
 */
export const useUserRole = (): UseUserRoleReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error || !roles?.length) return null;

      const roleList = roles.map((r) => r.role);
      
      // Prioridade: estabelecimento > admin > colaborador > aniversariante
      if (roleList.includes("estabelecimento")) return "estabelecimento";
      if (roleList.includes("admin")) return "admin";
      if (roleList.includes("colaborador")) return "colaborador";
      if (roleList.includes("aniversariante")) return "aniversariante";
      
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = async (session: any) => {
      if (!isMounted) return;

      if (!session?.user) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(session.user);

      // Fetch role com delay para evitar deadlock do Supabase
      setTimeout(async () => {
        if (!isMounted) return;
        const userRole = await fetchUserRole(session.user.id);
        if (isMounted) {
          setRole(userRole);
          setLoading(false);
        }
      }, 0);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleAuthChange(session);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  }, []);

  return { user, role, loading, signOut };
};
