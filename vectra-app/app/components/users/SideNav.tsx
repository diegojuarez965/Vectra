import Link from "next/link";
import NavLinks from "@/app/components/users/NavLinks";
import Image from "next/image";
import { PowerIcon } from "lucide-react";
import { signOut, auth } from "@/auth";
import ProfileAvatar from "@/app/components/ProfileAvatar";

export default async function SideNav() {
  const session = await auth();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-4 md:py-6 bg-black md:border-r border-foreground/10">
      {/* Logo Section */}
      <Link
        className="mb-4 flex h-20 items-center justify-center rounded-xl bg-linear-to-br from-foreground/10 to-transparent border border-foreground/5 p-4 md:h-40 group hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
        href="/"
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src="/images/vectra-logo.png"
            alt="Vectra Logo"
            width={150}
            height={150}
            className="object-contain h-full w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          />
        </div>
      </Link>

      {/* NavLinks Section */}
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md md:block bg-transparent"></div>
        {session?.user && (
          <div className="flex items-center justify-center shrink-0 md:w-full md:border-t border-foreground/10 md:pt-2 md:mb-2">
            <ProfileAvatar
              user={{
                id: session.user.id,
                name: session.user.name || "Usuario",
                email: session.user.email,
                image: session.user.image,
              }}
            />
          </div>
        )}
        <form
          className="shrink-0"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            aria-label="Cerrar sesión"
            className="group flex h-12 w-full grow items-center justify-center gap-3 cursor-pointer rounded-xl border border-foreground/5 bg-foreground/5 p-3 text-sm font-medium text-foreground/80 transition-all duration-300 hover:border-red-400/20 hover:bg-red-400/5 hover:text-red-400 md:flex-none md:justify-start md:px-4 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            <PowerIcon
              className="w-5 h-5 transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <div className="hidden md:block tracking-wide">Cerrar Sesión</div>
          </button>
        </form>
      </div>
    </div>
  );
}
