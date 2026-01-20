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

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(
          data.error || "No pudimos procesar tu solicitud. Verifica el correo."
        );
      }
    } catch {
      setError("Error de conexión. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // VISTA DE ÉXITO
  if (success) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">¡Correo enviado!</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            ¡Hemos enviado un enlace a{" "}
            <strong className="text-white">{email}</strong> para restablecer tu
            contraseña!
          </p>
        </div>

        <Link
          href="/login"
          className="w-full flex justify-center py-3 px-4 rounded-lg shadow-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/5"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  // VISTA DEL FORMULARIO
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Email */}
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ejemplo@correo.com"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
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
        className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg ${
          loading
            ? "bg-primary/50 cursor-not-allowed opacity-70"
            : "bg-primary hover:bg-orange-600 shadow-orange-900/20 hover:shadow-orange-900/40 transform hover:-translate-y-0.5 cursor-pointer"
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
          className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancelar y volver
        </Link>
      </div>
    </form>
  );
}
