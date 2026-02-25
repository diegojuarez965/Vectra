"use client";

import { useState } from "react";
import {
  Sliders,
  ShieldAlert,
  HardDrive,
  Bell,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import {
  updateMaintenanceMode,
  updateNoRegisterMode,
  updateConfidenceThreshold,
  updateSmoothingFactor,
} from "@/app/lib/actions";
import SettingCard from "@/app/components/admin/SettingCard";

interface SettingsEditorProps {
  initialMaintenanceMode: boolean;
  initialNoRegisterMode: boolean;
  initialConfidenceThreshold: number;
  initialSmoothingFactor?: number;
}

export default function SettingsEditor({
  initialMaintenanceMode,
  initialNoRegisterMode,
  initialConfidenceThreshold,
  initialSmoothingFactor,
}: SettingsEditorProps) {
  const [maintenanceActive, setMaintenanceActive] = useState(
    initialMaintenanceMode, // Estado inicial del modo mantenimiento
  );

  const [noRegisterActive, setNoRegisterActive] = useState(
    initialNoRegisterMode, // Estado inicial del modo sin registro
  );

  const [confidenceThreshold, setConfidenceThreshold] = useState(
    initialConfidenceThreshold, // Estado inicial del umbral de confianza
  );

  const [smoothingFactor, setSmoothingFactor] = useState(
    initialSmoothingFactor, // Estado inicial del factor de suavizado
  );

  const [maintenanceError, setMaintenanceError] = useState(""); // Estado de error para el modo mantenimiento
  const [confidenceThresholdError, setConfidenceThresholdError] = useState(""); // Estado de error para el umbral de confianza
  const [registerModeError, setRegisterModeError] = useState(""); // Estado de error para el modo sin registro
  const [smoothingFactorError, setSmoothingFactorError] = useState(""); // Estado de error para el factor de suavizado

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground pb-24">
      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-foreground/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Configuración del Sistema
          </h1>
          <p className="mt-1 text-foreground/80">
            Ajusta los parámetros globales de Vectra.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* TOLERANCIAS Y UMBRALES DE IA */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sliders className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-foreground">
              1. Motor de IA (Visión)
            </h2>
          </div>

          <div className="space-y-4">
            {/* Configurar el umbral de confianza */}
            <SettingCard
              label="Umbral de Confianza (Confidence)"
              valueDisplay={confidenceThreshold.toFixed(2)}
              description="Define qué tan seguro debe estar el modelo para marcar un punto corporal. Un valor alto (0.8+) es más preciso pero requiere mejor luz."
            >
              <form
                action={async (formData) => {
                  setConfidenceThresholdError("");
                  const res = await updateConfidenceThreshold(formData);
                  if (!res.success) {
                    setConfidenceThresholdError(res.message);
                    setConfidenceThreshold(initialConfidenceThreshold);
                  }
                }}
              >
                <input
                  type="range"
                  name="confidence_threshold"
                  min="0"
                  max="1"
                  step="0.05"
                  defaultValue={initialConfidenceThreshold}
                  onChange={(e) =>
                    setConfidenceThreshold(parseFloat(e.target.value))
                  }
                  onMouseUp={(e) => e.currentTarget.form?.requestSubmit()}
                  onTouchEnd={(e) => e.currentTarget.form?.requestSubmit()}
                  className="w-full accent-primary h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer"
                />
              </form>

              {confidenceThresholdError && (
                <p className="text-red-400 text-sm mt-1">
                  {confidenceThresholdError}
                </p>
              )}
            </SettingCard>
            {/* Configurar el factor de suavizado */}
            <SettingCard
              label="Suavizado (Jitter Filter)"
              valueDisplay={
                smoothingFactor === 0.8
                  ? "Bajo"
                  : smoothingFactor === 0.2
                    ? "Alto"
                    : "Media"
              }
              description="Aplica un filtro para reducir el temblor de los puntos detectados. 'Alto' es más suave pero puede tener un ligero retraso."
            >
              <form
                action={async (formData) => {
                  setSmoothingFactorError("");
                  const res = await updateSmoothingFactor(formData);
                  if (!res.success) {
                    setSmoothingFactorError(res.message);
                    setSmoothingFactor(initialSmoothingFactor);
                  }
                }}
                className="flex gap-2"
              >
                {/* OPCIÓN: BAJO (0.8) */}
                <button
                  type="submit"
                  name="smoothing_factor"
                  value="0.8"
                  onClick={() => setSmoothingFactor(0.8)}
                  className={clsx(
                    "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
                    smoothingFactor === 0.8
                      ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
                      : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
                  )}
                >
                  Bajo
                </button>

                {/* OPCIÓN: MEDIA (0.5) */}
                <button
                  type="submit"
                  name="smoothing_factor"
                  value="0.5"
                  onClick={() => setSmoothingFactor(0.5)}
                  className={clsx(
                    "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
                    smoothingFactor === 0.5
                      ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
                      : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
                  )}
                >
                  Media
                </button>

                {/* OPCIÓN: ALTO (0.2) */}
                <button
                  type="submit"
                  name="smoothing_factor"
                  value="0.2"
                  onClick={() => setSmoothingFactor(0.2)}
                  className={clsx(
                    "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
                    smoothingFactor === 0.2
                      ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
                      : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
                  )}
                >
                  Alto
                </button>
              </form>

              {smoothingFactorError && (
                <p className="text-red-400 text-sm mt-1">
                  {smoothingFactorError}
                </p>
              )}
            </SettingCard>
          </div>
        </section>

        {/* GESTIÓN OPERATIVA */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-foreground">
              2. Gestión Operativa
            </h2>
          </div>

          <div className="space-y-4">
            {/* Modo Mantenimiento */}
            <SettingCard
              label="Modo Mantenimiento"
              description="Bloquea el acceso a todos los usuarios excepto administradores."
              dangerZone={true}
            >
              <form
                action={async (formData) => {
                  const newValue = formData.get("maintenance_mode") === "on";
                  setMaintenanceActive(newValue);
                  setMaintenanceError("");

                  const res = await updateMaintenanceMode(formData);
                  if (!res.success) {
                    setMaintenanceError(res.message);
                    setMaintenanceActive(!newValue);
                  }
                }}
              >
                <input
                  type="hidden"
                  name="maintenance_mode"
                  value={maintenanceActive ? "off" : "on"}
                />

                <button
                  type="submit"
                  className={clsx(
                    "w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer",
                    "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400",
                    maintenanceActive ? "bg-red-400/5" : "bg-foreground/20",
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300",
                      maintenanceActive ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </form>
              {maintenanceError && (
                <p className="text-red-400 text-sm mt-1">{maintenanceError}</p>
              )}
            </SettingCard>

            {/* Modo Sin Registro */}
            <SettingCard
              label="Modo Sin Registro"
              description="Desactiva la capacidad de nuevos usuarios para registrarse en el sistema."
              dangerZone={true}
            >
              <form
                action={async (formData) => {
                  const newValue = formData.get("no_register_mode") === "on";
                  setNoRegisterActive(newValue);
                  setRegisterModeError("");

                  const res = await updateNoRegisterMode(formData);
                  if (!res.success) {
                    setRegisterModeError(res.message);
                    setNoRegisterActive(!newValue);
                  }
                }}
              >
                <input
                  type="hidden"
                  name="no_register_mode"
                  value={noRegisterActive ? "off" : "on"}
                />

                <button
                  type="submit"
                  className={clsx(
                    "w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer",
                    "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400",
                    noRegisterActive ? "bg-red-400/5" : "bg-foreground/20",
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300",
                      noRegisterActive ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </form>
              {registerModeError && (
                <p className="text-red-400 text-sm mt-1">{registerModeError}</p>
              )}
            </SettingCard>
          </div>
        </section>

        {/* ALMACENAMIENTO Y LÍMITES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <HardDrive className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-foreground">
              3. Almacenamiento
            </h2>
          </div>

          <div className="space-y-4">
            <SettingCard
              label="Retención de Historial"
              description="Tiempo que se guardan los análisis antes de eliminarse."
            >
              <div className="relative">
                <select className="appearance-none bg-background border border-foreground/20 text-foreground text-sm rounded-lg block w-full pl-4 pr-10 py-2.5 cursor-pointer">
                  <option>90 Días</option>
                  <option>1 Año</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground pointer-events-none" />
              </div>
            </SettingCard>

            <SettingCard
              label="Tiempo Máximo de Análisis"
              description="Límite de duración para una sola sesión de escaneo."
            >
              <div className="relative">
                <select className="appearance-none bg-background border border-foreground/20 text-foreground text-sm rounded-lg block w-full pl-4 pr-10 py-2.5 cursor-pointer">
                  <option>2 Minutos</option>
                  <option>5 Minutos</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground pointer-events-none" />
              </div>
            </SettingCard>
          </div>
        </section>

        {/* MENSAJERÍA */}
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-foreground">
              4. Mensajería Global
            </h2>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5 p-6 transition-all hover:border-foreground/20">
            <textarea
              rows={3}
              placeholder="Escribe un mensaje..."
              className="w-full bg-background/50 border border-foreground/10 rounded-lg p-3 text-sm text-foreground resize-none"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
