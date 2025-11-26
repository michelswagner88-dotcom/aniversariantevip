import { ReactNode } from "react";

interface FeatureGuardProps {
  requiredPlan: 'active' | 'gold' | 'premium';
  userPlan: string | null;
  children: ReactNode;
  fallback: ReactNode;
}

export const FeatureGuard = ({ 
  requiredPlan, 
  userPlan, 
  children, 
  fallback 
}: FeatureGuardProps) => {
  // Lógica de verificação de plano
  const hasAccess = () => {
    if (!userPlan || userPlan === 'pending') return false;
    
    // Qualquer plano ativo/pago tem acesso (exceto pending)
    if (requiredPlan === 'active') {
      return userPlan !== 'pending';
    }
    
    // Para funcionalidades gold/premium específicas, verificar planos específicos
    if (requiredPlan === 'gold' || requiredPlan === 'premium') {
      return userPlan === 'active' || userPlan === 'trialing';
    }
    
    return false;
  };

  return hasAccess() ? <>{children}</> : <>{fallback}</>;
};