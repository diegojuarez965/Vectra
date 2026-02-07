"use client";

import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { authenticate } from "@/app/lib/actions";

interface LoginFormProps {
  isMaintenance?: boolean;
}

export default function LoginForm({ isMaintenance = false }: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/login-success";

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* --- CAMPO EMAIL --- */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Correo Electrónico
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-white/40" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
          />
        </div>
      </div>

      {/* --- CAMPO PASSWORD */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="password"
            className="text-sm font-medium text-white/80"
          >
            Contraseña
          </label>
        </div>
        <div className="relative">
          {/* Icono Candado (Izquierda) */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-white/40" />
          </div>

          {/* Input con tipo dinámico */}
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
          />

          {/* Botón Toggle (Derecha) */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center cursor-pointer text-primary hover:text-orange-600 transition-colors"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* --- OLVIDASTE CONTRASEÑA --- */}
      {!isMaintenance && (
        <div className="flex justify-end">
          <Link
            href="/reset-password"
            className="text-sm font-medium text-white/60 hover:text-primary transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      )}

      {/* --- BOTÓN SUBMIT --- */}
      <input type="hidden" name="redirectTo" value={callbackUrl} />
      <button
        type="submit"
        disabled={isPending}
        aria-disabled={isPending}
        className={`w-full flex items-center justify-center gap-2 text-foreground font-bold py-3 px-4 rounded-lg transition-all shadow-lg ${
          isPending
            ? "bg-primary/50 cursor-not-allowed opacity-70"
            : "bg-primary cursor-pointer hover:bg-orange-600 shadow-orange-900/20 hover:shadow-orange-900/40 transform hover:-translate-y-0.5"
        }`}
      >
        {isPending ? "Iniciando..." : "Iniciar Sesión"}
        {!isPending && <ArrowRight className="w-5 h-5" />}
      </button>

      {/* MENSAJE DE ERROR */}
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && (
          <div className="flex items-center gap-2 text-red-400 animate-pulse bg-red-500/10 px-3 py-1 rounded-md w-full border border-red-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}
