"use client";

import { useState } from "react";
import { Sliders, ShieldAlert, HardDrive, Bell } from "lucide-react";
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
  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground pb-24">
      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Configuración del Sistema
          </h1>
          <p className="mt-1 text-white/60">
            Ajusta los parámetros globales de Vectra.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 1. TOLERANCIAS Y UMBRALES DE IA */}
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
                  await updateConfidenceThreshold(formData);
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
                  className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </form>
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
                  await updateSmoothingFactor(formData);
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
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-foreground",
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
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-foreground",
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
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-foreground",
                  )}
                >
                  Alto
                </button>
              </form>
            </SettingCard>
          </div>
        </section>

        {/* 2. GESTIÓN OPERATIVA */}
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

                  await updateMaintenanceMode(formData);
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
                    "w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-black focus:ring-red-500",
                    maintenanceActive ? "bg-red-500" : "bg-white/20",
                  )}
                >
                  <div
                    className={clsx(
                      "absolute top-1 w-3 h-3 rounded-full bg-foreground transition-transform duration-300 shadow-md",
                      maintenanceActive ? "left-6" : "left-1",
                    )}
                  />
                </button>
              </form>
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

                  await updateNoRegisterMode(formData);
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
                    "w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-black focus:ring-red-500",
                    noRegisterActive ? "bg-red-500" : "bg-white/20",
                  )}
                >
                  <div
                    className={clsx(
                      "absolute top-1 w-3 h-3 rounded-full bg-foreground transition-transform duration-300 shadow-md",
                      noRegisterActive ? "left-6" : "left-1",
                    )}
                  />
                </button>
              </form>
            </SettingCard>
          </div>
        </section>

        {/* 3. ALMACENAMIENTO Y LÍMITES */}
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
              <select className="bg-background border border-white/20 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                <option>90 Días</option>
                <option>1 Año</option>
              </select>
            </SettingCard>

            <SettingCard
              label="Tiempo Máximo de Análisis"
              description="Límite de duración para una sola sesión de escaneo."
            >
              <select className="bg-background border border-white/20 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                <option>2 Minutos</option>
                <option>5 Minutos</option>
              </select>
            </SettingCard>
          </div>
        </section>

        {/* 4. MENSAJERÍA */}
        <section className="space-y-4 lg:col-span-2">
          {/* ... (Se mantiene igual que el diseño anterior) ... */}
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-foreground">
              4. Mensajería Global
            </h2>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20">
            <textarea
              rows={3}
              placeholder="Escribe un mensaje..."
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-foreground resize-none"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
