"use client";

import { useState } from "react";
import { Lock, LogIn } from "lucide-react";
import LoginForm from "@/app/components/LoginForm";
import { Suspense } from "react";
import Image from "next/image";

export default function MaintenancePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div
        className={`transition-all duration-500 ${showLogin ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
      >
        <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20 hover:scale-110 transition-transform duration-300">
          <Image
            src="/images/vectra-logo.png"
            alt="Vectra Logo"
            width={40}
            height={40}
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Sistema en Mantenimiento
        </h1>

        <p className="max-w-md text-foreground/80 mb-8 text-lg">
          Estamos realizando mejoras críticas. El acceso está restringido
          temporalmente.
        </p>

        <button
          onClick={() => setShowLogin(true)}
          className="cursor-pointer mt-12 text-xs text-foreground/80 hover:text-foreground flex items-center justify-center gap-2 mx-auto transition-colors"
        >
          <Lock className="w-3 h-3" /> Acceso Administrativo
        </button>
      </div>

      <div
        className={`transition-all duration-500 w-full max-w-sm ${showLogin ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 h-0 overflow-hidden pointer-events-none"}`}
      >
        <div className="bg-foreground/5 border border-foreground/10 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-primary" /> Login Admin
          </h2>
          <Suspense
            fallback={
              <div className="text-foreground/80 text-sm">
                Cargando formulario...
              </div>
            }
          >
            <LoginForm {...{ isMaintenance: true }} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
