"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

import { sendPasswordResetEmail } from "@/app/lib/actions";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Manejo del envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await sendPasswordResetEmail(email);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Revisa tu internet e inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  {
    /* Vista de Éxito */
  }
  if (success) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">
            ¡Correo enviado!
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Hemos enviado un enlace a{" "}
            <strong className="text-foreground">{email}</strong> para
            restablecer tu contraseña.
          </p>
        </div>

        <Link
          href="/login"
          className="w-full flex justify-center py-3 px-4 rounded-lg shadow-lg bg-foreground/10 hover:bg-foreground/20 text-foreground font-medium transition-all border border-foreground/5"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  {
    /* Vista de Formulario */
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Email */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground/80"
          >
            Correo Electrónico
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-foreground/80" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ejemplo@correo.com"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-foreground/5 border border-foreground/10 text-foreground placeholder:text-foreground/30 transition-all"
          />
        </div>
      </div>

      {/* Mensaje de Error */}
      <div className="h-3">
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm animate-pulse">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 text-foreground font-bold py-3 px-4 rounded-lg transition-all shadow-lg ${
          loading
            ? "bg-primary/50 cursor-not-allowed opacity-70"
            : "bg-primary hover:bg-primary/80 shadow-primary-900/20 hover:shadow-primary-900/40 transform hover:-translate-y-0.5 cursor-pointer"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar enlace"
        )}
      </button>

      {/* Link para volver */}
      <div className="flex justify-center mt-4">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancelar y volver
        </Link>
      </div>
    </form>
  );
}
