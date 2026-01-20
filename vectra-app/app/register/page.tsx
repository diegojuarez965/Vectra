import Link from "next/link";
import Image from "next/image";
import RegisterForm from "@/app/components/RegisterForm"; // Asegúrate de la ruta correcta
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vectra | Registro",
  description: "Crea tu cuenta para comenzar el análisis biomecánico con IA.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-start py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Fondo decorativo (Glow) - Igual que en Login */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Encabezado */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
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

        <h2 className="text-3xl font-bold text-white tracking-tight">
          Únete a Vectra
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Comienza tu análisis biomecánico hoy mismo
        </p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#4a4a4a] py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-white/5 backdrop-blur-sm">
          <RegisterForm />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                {/* IMPORTANTE: bg-[#4a4a4a] debe coincidir con el fondo de la tarjeta */}
                <span className="px-2 bg-[#4a4a4a] text-white/50">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-bold text-primary hover:text-orange-400 transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
