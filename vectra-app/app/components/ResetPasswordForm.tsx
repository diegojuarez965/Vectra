"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ResetPasswordForm() {
  // Obtenemos el token de la URL
  const { token } = useParams();
  const router = useRouter();

  // Estados
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Estados para visibilidad
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Manejo del envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Validaciones
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // 2. Llamada a la API
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "El enlace ha expirado o no es válido.");
      } else {
        setSuccess("Contraseña restablecida correctamente.");
        // Redirigimos tras 2.5 segundos
        setTimeout(() => router.push("/login"), 2500);
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
      <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 mb-4 border border-green-500/20">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">¡Todo listo!</h3>
        <p className="text-white/60 mb-6 text-sm">
          Tu contraseña ha sido actualizada. <br />
          Redirigiendo al inicio de sesión...
        </p>

        {/* Barra de progreso decorativa */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary animate-[pulse_1s_ease-in-out_infinite]"
            style={{ width: "100%" }}
          ></div>
        </div>
      </div>
    );
  }

  // VISTA DE FORMULARIO
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input: Nueva Contraseña */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Nueva contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-white/40" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Botón Ojo */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center cursor-pointer text-primary hover:text-orange-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Input: Confirmar Contraseña */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Confirmar contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-white/40" />
          </div>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-3 rounded-lg bg-white/5 border border-white/10 text-foreground placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {/* Botón Ojo Confirmación */}
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center cursor-pointer text-primary hover:text-orange-600 transition-colors"
          >
            {showConfirm ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Caja de Error */}
      <div className="h-6">
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm animate-pulse">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Botón Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 text-foreground font-bold py-3 px-4 rounded-lg transition-all shadow-lg ${
          loading
            ? "bg-primary/50 cursor-not-allowed opacity-70"
            : "bg-primary hover:bg-orange-600 shadow-orange-900/20 hover:shadow-orange-900/40 transform hover:-translate-y-0.5 cursor-pointer"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Actualizando...
          </>
        ) : (
          <>
            Restablecer Contraseña
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
