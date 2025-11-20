import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowConsent(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-4xl mx-auto p-6 bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">🍪 Cookies e Privacidade</h3>
            <p className="text-sm text-muted-foreground">
              Utilizamos cookies essenciais para garantir o funcionamento adequado do site, 
              melhorar sua experiência de navegação e analisar o uso da plataforma. 
              Ao continuar navegando, você concorda com nossa{" "}
              <a href="/politica-privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </a>
              .
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={rejectCookies}
              className="whitespace-nowrap"
            >
              Rejeitar
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="whitespace-nowrap"
            >
              Aceitar Cookies
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
