import Link from "next/link";
import Image from "next/image";
import ResetPasswordForm from "@/app/components/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vectra | Nueva Contraseña",
  description: "Establece una nueva contraseña segura para tu cuenta.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-start py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
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
          Nueva Contraseña
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Asegura tu cuenta con una clave robusta
        </p>
      </div>

      {/* TARJETA */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#4a4a4a] py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-white/5 backdrop-blur-sm">
          {/* Formulario */}
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
