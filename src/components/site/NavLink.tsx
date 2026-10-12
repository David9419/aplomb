"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Lien de navigation : sur l'accueil, « /#section » devient « #section »
 * pour profiter du défilement animé ; ailleurs, c'est un vrai changement de page.
 */
export function NavLink({
  href,
  children,
  className,
  onClick,
  ...rest
}: { href: string; children: React.ReactNode; className?: string; onClick?: () => void } & Omit<
  React.ComponentProps<"a">,
  "href"
>) {
  const pathname = usePathname();
  if (href.startsWith("/#") && pathname === "/") {
    return (
      <a href={href.slice(1)} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}

export function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));
}
