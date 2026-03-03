import { ArrowLeft } from "lucide-react";
import { signOut } from "@/auth";
import Image from "next/image";

export default function SuspendidoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="transition-all duration-500 opacity-100">
        <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 hover:scale-110 transition-transform duration-300">
          <Image
            src="/images/vectra-logo.png"
            alt="Vectra Logo"
            width={40}
            height={40}
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Cuenta Suspendida
        </h1>

        <p className="max-w-md text-foreground/80 mb-8 text-lg">
          Su acceso a la plataforma ha sido revocado temporal o permanentemente
          por un administrador.
        </p>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="cursor-pointer mx-auto flex items-center justify-center gap-2 bg-foreground/10 hover:bg-foreground/20 text-foreground border border-foreground/20 px-6 py-3 rounded-xl transition-all font-semibold hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );
}
