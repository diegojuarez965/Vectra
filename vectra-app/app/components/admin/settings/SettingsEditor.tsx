import {
  Sliders,
  ShieldAlert,
  HardDrive,
  Bell,
  ChevronDown,
} from "lucide-react";
import SettingCard from "@/app/components/admin/settings/SettingCard";
import { Suspense } from "react";
import { SingleSettingSkeleton } from "./SingleSettingSkeleton";
import ConfidenceThresholdWrapper from "./ConfidenceThresholdWrapper";
import SmoothingFactorWrapper from "./SmoothingFactorWrapper";
import MaintenanceModeWrapper from "./MaintenanceModeWrapper";
import NoRegisterModeWrapper from "./NoRegisterModeWrapper";
import RetentionDaysWrapper from "./RetentionDaysWrapper";

export default function SettingsEditor() {
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
            <Suspense fallback={<SingleSettingSkeleton />}>
              <ConfidenceThresholdWrapper />
            </Suspense>
            {/* Configurar el factor de suavizado */}
            <Suspense fallback={<SingleSettingSkeleton />}>
              <SmoothingFactorWrapper />
            </Suspense>
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
            <Suspense fallback={<SingleSettingSkeleton />}>
              <MaintenanceModeWrapper />
            </Suspense>

            {/* Modo Sin Registro */}
            <Suspense fallback={<SingleSettingSkeleton />}>
              <NoRegisterModeWrapper />
            </Suspense>
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
            {/* Configurar los días de retención del historial */}
            <Suspense fallback={<SingleSettingSkeleton />}>
              <RetentionDaysWrapper />
            </Suspense>

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
