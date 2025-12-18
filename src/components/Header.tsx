// =============================================================================
// HEADER.TSX - ANIVERSARIANTE VIP (Unified & Modular)
// =============================================================================

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { hapticFeedback } from "@/lib/hapticFeedback";
import {
  HeaderLogo,
  SearchPill,
  DesktopNav,
  MobileMenuButton,
  MobileMenu,
  HeaderProps,
  SCROLL_THRESHOLD,
  HEADER_HEIGHT_EXPANDED,
  HEADER_HEIGHT_COLLAPSED,
} from "@/components/header";

/**
 * Hook para detectar scroll com IntersectionObserver
 */
const useScrollDetection = (threshold: number = SCROLL_THRESHOLD) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (sentinel && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting);
        },
        { threshold: 0, rootMargin: `-${threshold}px 0px 0px 0px` }
      );

      observer.observe(sentinel);
      return () => observer.disconnect();
    }

    // Fallback: scroll event
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { isScrolled, sentinelRef };
};

export const Header = memo(function Header({
  transparent = true,
  showSearch = true,
  cityName,
  onSearchClick,
}: HeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isScrolled, sentinelRef } = useScrollDetection(SCROLL_THRESHOLD);
  const { user, signOut } = useHeaderAuth();

  const isHomePage = location.pathname === "/";
  const shouldBeTransparent = transparent && isHomePage && !isScrolled;
  const currentHeight = isScrolled ? HEADER_HEIGHT_COLLAPSED : HEADER_HEIGHT_EXPANDED;

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleSearchClick = useCallback(() => {
    hapticFeedback(10);
    if (onSearchClick) {
      onSearchClick();
    } else {
      const searchSection = document.getElementById("search-section");
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [onSearchClick]);

  return (
    <>
      {/* Sentinel para IntersectionObserver */}
      <div
        ref={sentinelRef}
        className="absolute top-0 left-0 w-full h-1"
        aria-hidden="true"
      />

      {/* Header Principal */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "transition-all duration-300 ease-out",
          shouldBeTransparent
            ? "bg-transparent"
            : "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
        )}
        style={{ height: currentHeight }}
        role="banner"
      >
        <div
          className={cn(
            "container h-full mx-auto px-4 lg:px-6",
            "flex items-center justify-between"
          )}
        >
          <HeaderLogo isScrolled={isScrolled} isHomePage={isHomePage} />

          {showSearch && (
            <SearchPill
              isScrolled={isScrolled}
              isHomePage={isHomePage}
              cityName={cityName}
              onClick={handleSearchClick}
            />
          )}

          <DesktopNav
            isScrolled={isScrolled}
            isHomePage={isHomePage}
            user={user}
            onSignOut={signOut}
          />

          <MobileMenuButton
            isOpen={mobileMenuOpen}
            isScrolled={isScrolled}
            isHomePage={isHomePage}
            onClick={toggleMobileMenu}
          />
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        user={user}
        onClose={closeMobileMenu}
        onSignOut={signOut}
      />

      {/* Spacer para compensar header fixed */}
      <div
        style={{ height: currentHeight }}
        className={cn(
          "transition-all duration-300",
          shouldBeTransparent && "hidden"
        )}
        aria-hidden="true"
      />
    </>
  );
});

Header.displayName = "Header";

export default Header;
