"use client";

import { useState } from "react";
import {
  Sliders,
  ShieldAlert,
  HardDrive,
  Bell,
  Save,
  Info,
} from "lucide-react";
import clsx from "clsx";
import {
  updateMaintenanceMode,
  updateNoRegisterMode,
  updateConfidenceThreshold,
  updateSmoothingFactor,
} from "@/app/lib/actions";

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
  const [loading, setLoading] = useState(false);

  const [maintenanceActive, setMaintenanceActive] = useState(
    initialMaintenanceMode,
  );

  const [noRegisterActive, setNoRegisterActive] = useState(
    initialNoRegisterMode,
  );

  const [confidenceThreshold, setConfidenceThreshold] = useState(
    initialConfidenceThreshold,
  );

  const [smoothingFactor, setSmoothingFactor] = useState(
    initialSmoothingFactor,
  );
  return (
    <div className="h-full w-full overflow-y-auto bg-black p-4 md:p-8 text-white pb-24">
      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Configuración del Sistema
          </h1>
          <p className="mt-1 text-white/60">
            Ajusta los parámetros globales de Vectra.
          </p>
        </div>
        <button
          onClick={() => setLoading(!loading)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-all shadow-[0_0_15px_rgba(255,87,34,0.4)]"
        >
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <Save className="w-4 h-4" /> Guardar Cambios
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 1. TOLERANCIAS Y UMBRALES DE IA */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sliders className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-white">
              1. Motor de IA (Visión)
            </h2>
          </div>

          <div className="space-y-4">
            <SettingCard
              label="Umbral de Confianza (Confidence)"
              valueDisplay={confidenceThreshold.toFixed(2)} // Muestra siempre 2 decimales (ej: 0.60)
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

            <SettingCard
              label="Suavizado (Jitter Filter)"
              // Lógica para mostrar el texto correcto según el valor numérico actual
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
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white",
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
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white",
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
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white",
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
            <h2 className="text-lg font-semibold text-white">
              2. Gestión Operativa
            </h2>
          </div>

          <div className="space-y-4">
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
                      "absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-300 shadow-md",
                      maintenanceActive ? "left-6" : "left-1",
                    )}
                  />
                </button>
              </form>
            </SettingCard>

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
                      "absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-300 shadow-md",
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
            <h2 className="text-lg font-semibold text-white">
              3. Almacenamiento
            </h2>
          </div>

          <div className="space-y-4">
            <SettingCard
              label="Retención de Historial"
              description="Tiempo que se guardan los análisis antes de eliminarse."
            >
              <select className="bg-black border border-white/20 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                <option>90 Días</option>
                <option>1 Año</option>
              </select>
            </SettingCard>

            <SettingCard
              label="Tiempo Máximo de Análisis"
              description="Límite de duración para una sola sesión de escaneo."
            >
              <select className="bg-black border border-white/20 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
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
            <h2 className="text-lg font-semibold text-white">
              4. Mensajería Global
            </h2>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20">
            <textarea
              rows={3}
              placeholder="Escribe un mensaje..."
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white resize-none"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function SettingCard({
  label,
  children,
  description,
  valueDisplay,
  dangerZone = false,
}: {
  label: string;
  children: React.ReactNode;
  description: string;
  valueDisplay?: string;
  dangerZone?: boolean;
}) {
  return (
    <div
      className={clsx(
        "group relative p-4 rounded-xl border transition-all duration-300",
        dangerZone
          ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
          : "bg-white/5 border-white/5 hover:bg-white/[0.07] hover:border-white/10",
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <span
          className={clsx(
            "font-medium text-sm",
            dangerZone ? "text-red-300" : "text-white",
          )}
        >
          {label}
        </span>
        {valueDisplay && (
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
            {valueDisplay}
          </span>
        )}
      </div>
      <div className="relative z-10">{children}</div>
      <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500 ease-in-out">
        <div className="pt-3 mt-3 border-t border-white/5">
          <p className="text-xs text-white/50 leading-relaxed flex items-start gap-2">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-white/30" />
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
