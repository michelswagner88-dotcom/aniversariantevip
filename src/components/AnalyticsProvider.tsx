import { useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-6YZWYCLN8T', {
        page_path: location.pathname,
      });
    }
  }, [location.pathname]);

  return <>{children}</>;
};
