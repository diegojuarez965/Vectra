import Link from "next/link";
import { UserX, ArrowLeft, LogIn } from "lucide-react";

export default function NoRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="mb-8 relative flex justify-center">
        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
        <UserX className="relative h-20 w-20 text-red-500" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-3">
        Inscripciones Cerradas
      </h1>

      <p className="max-w-md text-white/60 mb-8 text-sm leading-relaxed">
        Lo sentimos, el administrador ha deshabilitado temporalmente la creación
        de nuevas cuentas en Vectra.
        <br />
        <br />
        Si crees que esto es un error, por
        favor contacta directamente con tu entrenador.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Link
          href="/login"
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm font-medium text-foreground hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <LogIn className="w-4 h-4" />
          Ya tengo cuenta
        </Link>

        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-transparent px-4 py-3 text-sm font-medium text-white/40 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>
    </div>
  );
}
