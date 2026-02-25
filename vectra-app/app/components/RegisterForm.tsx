"use client";

import { registerUser } from "@/app/lib/actions";
import { UserState } from "@/app/lib/definitions";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";

export default function RegisterForm() {
  // Estado inicial del formulario
  const initialState: UserState = { message: "", errors: {} };

  // Estados de visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado de acción del formulario
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* CAMPO NOMBRE */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="name" className="text-sm font-medium text-foreground/80">
            Nombre Completo
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-foreground/80" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Juan Pérez"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 transition-all"
          />
        </div>
        {state.errors?.name && (
          <p className="text-sm text-red-400 mt-1">{state.errors.name}</p>
        )}
      </div>

      {/* CAMPO EMAIL */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="email" className="text-sm font-medium text-foreground/80">
            Correo Electrónico
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-foreground/80" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 transition-all"
          />
        </div>
        {state.errors?.email && (
          <p className="text-sm text-red-400 mt-1">{state.errors.email}</p>
        )}
      </div>

      {/* CAMPO PASSWORD */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground/80"
          >
            Contraseña
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-foreground/80" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-3 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 transition-all"
          />

          {/* Botón Toggle Password */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center cursor-pointer text-primary hover:text-primary/80 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {state.errors?.password && (
          <p className="text-sm text-red-400 mt-1">{state.errors.password}</p>
        )}
      </div>

      {/* CAMPO REPETIR PASSWORD */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground/80"
          >
            Repetir Contraseña
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-foreground/80" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-3 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 transition-all"
          />

          {/* Botón Toggle Confirm Password */}
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center cursor-pointer text-primary hover:text-primary/80 transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {state.errors?.confirmPassword && (
          <p className="text-sm text-red-400 mt-1">
            {state.errors.confirmPassword}
          </p>
        )}
      </div>

      {/* BOTÓN SUBMIT */}
      <button
        type="submit"
        disabled={isPending}
        className={`w-full flex items-center justify-center gap-2 text-foreground font-bold py-3 px-4 rounded-lg transition-all shadow-lg mt-4 ${
          isPending
            ? "bg-primary/50 cursor-not-allowed opacity-70"
            : "bg-primary hover:bg-primary/80 shadow-primary-900/20 hover:shadow-primary-900/40 transform hover:-translate-y-0.5 cursor-pointer"
        }`}
      >
        {isPending ? "Creando cuenta..." : "Crear Cuenta"}
        {!isPending && <ArrowRight className="w-5 h-5" />}
      </button>

      {/* MENSAJE GENERAL DE ERROR */}
      {state.message && (
        <div className="mt-4 p-3 bg-red-400/5 border border-red-400/20 rounded-lg text-center">
          <p className="text-sm text-red-400 font-medium">{state.message}</p>
        </div>
      )}
    </form>
  );
}
