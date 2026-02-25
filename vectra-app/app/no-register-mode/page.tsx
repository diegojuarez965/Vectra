import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import Image from "next/image";

export default function NoRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <Link href="/" className="inline-block group">
        <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
          <Image
            src="/images/vectra-logo.png"
            alt="Vectra Logo"
            width={40}
            height={40}
          />
        </div>
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-3">
        Inscripciones Cerradas
      </h1>

      <p className="max-w-md text-foreground/80 mb-8 text-sm leading-relaxed">
        Lo sentimos, el administrador ha deshabilitado temporalmente la creación
        de nuevas cuentas en Vectra.
        <br />
        <br />
        Si crees que esto es un error, por favor contacta directamente con tu
        entrenador.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Link
          href="/login"
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-foreground/5 border border-foreground/10 px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/10 hover:border-foreground/20 transition-all"
        >
          <LogIn className="w-4 h-4" />
          Ya tengo cuenta
        </Link>

        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-transparent px-4 py-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>
    </div>
  );
}
