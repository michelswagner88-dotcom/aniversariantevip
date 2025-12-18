import { memo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderLogoProps {
  isScrolled: boolean;
  isHomePage: boolean;
}

export const HeaderLogo = memo(({ isScrolled, isHomePage }: HeaderLogoProps) => {
  const showDarkLogo = isScrolled || !isHomePage;

  return (
    <Link
      to="/"
      className={cn(
        "font-display font-bold tracking-tight",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg",
        "focus-visible:ring-violet-500",
        isScrolled ? "text-xl" : "text-2xl",
        showDarkLogo ? "text-[#240046]" : "text-white"
      )}
      aria-label="Ir para página inicial"
    >
      Aniversariante
      <span
        className={cn(
          "transition-colors duration-300",
          showDarkLogo ? "text-violet-600" : "text-violet-300"
        )}
      >
        VIP
      </span>
    </Link>
  );
});

HeaderLogo.displayName = "HeaderLogo";
