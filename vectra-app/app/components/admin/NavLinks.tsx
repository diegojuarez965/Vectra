"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BarChart3, Users, Settings } from "lucide-react";

export default function NavLinks() {
  const pathname = usePathname(); // Obtiene la ruta actual

  const links = [
    {
      name: "Dashboard Global",
      href: "/vectra/admin",
      icon: BarChart3,
    },
    {
      name: "Gestión Usuarios",
      href: "/vectra/admin/users",
      icon: Users,
    },
    {
      name: "Sistema",
      href: "/vectra/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex flex-row gap-2 grow md:flex-col">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          /* Obtenemos los datos de cada NavLink */
          <Link
            key={link.name}
            href={link.href}
            aria-label={link.name}
            className={clsx(
              "relative flex h-12 grow items-center justify-center gap-3 rounded-xl p-3 text-sm font-medium transition-all duration-300 md:flex-none md:justify-start md:px-4 border",
              {
                "bg-primary/5 text-primary border-primary/20 shadow-[0_0_15px_rgba(255,87,34,0.15)]":
                  isActive,
                "bg-transparent text-foreground/80 border-transparent hover:bg-foreground/5 hover:text-primary hover:border-foreground/10":
                  !isActive,
              },
            )}
          >
            {/* Indicador de NavLink activo */}
            {isActive && (
              <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
            )}

            <LinkIcon className="w-5 h-5 md:w-5" aria-hidden="true" />
            <p className="hidden md:block tracking-wide">{link.name}</p>
          </Link>
        );
      })}
    </div>
  );
}
