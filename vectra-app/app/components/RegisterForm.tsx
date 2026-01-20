"use client";

import { registerUser, UserState } from "@/app/lib/actions";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useActionState } from "react";

export default function RegisterForm() {
  const initialState: UserState = { message: "", errors: {} };

  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* --- CAMPO NOMBRE --- */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="name" className="text-sm font-medium text-white/80">
            Nombre Completo
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-white/40" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Juan Pérez"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        {state.errors?.name && (
          <p className="text-sm text-red-400 mt-1">{state.errors.name}</p>
        )}
      </div>

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
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        {state.errors?.email && (
          <p className="text-sm text-red-400 mt-1">{state.errors.email}</p>
        )}
      </div>

      {/* --- CAMPO PASSWORD --- */}
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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-white/40" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        {state.errors?.password && (
          <p className="text-sm text-red-400 mt-1">{state.errors.password}</p>
        )}
      </div>

      {/* --- CAMPO REPETIR PASSWORD --- */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="confirm-password"
            className="text-sm font-medium text-white/80"
          >
            Repetir Contraseña
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-white/40" />
          </div>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        {state.errors?.confirmPassword && (
          <p className="text-sm text-red-400 mt-1">
            {state.errors.confirmPassword}
          </p>
        )}
      </div>

      {/* --- BOTÓN SUBMIT --- */}
      <button
        type="submit"
        disabled={isPending}
        className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg mt-4 ${
          isPending
            ? "bg-primary/50 cursor-not-allowed opacity-70"
            : "bg-primary hover:bg-orange-600 shadow-orange-900/20 hover:shadow-orange-900/40 transform hover:-translate-y-0.5 cursor-pointer"
        }`}
      >
        {isPending ? "Creando cuenta..." : "Crear Cuenta"}
        {!isPending && <ArrowRight className="w-5 h-5" />}
      </button>

      {/* MENSAJE GENERAL DE ERROR */}
      {state.message && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
          <p className="text-sm text-red-400 font-medium">{state.message}</p>
        </div>
      )}
    </form>
  );
}
