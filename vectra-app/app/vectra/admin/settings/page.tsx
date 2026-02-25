import {
  getMaintenanceMode,
  getNoRegisterMode,
  getConfidenceThreshold,
  getSmoothingFactor,
} from "@/app/lib/data";
import SettingsEditor from "@/app/components/admin/SettingsEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const isMaintenanceActive = await getMaintenanceMode(); // Obtener el estado actual del modo mantenimiento
  const isNoRegisterActive = await getNoRegisterMode(); // Obtener el estado actual del modo sin registro
  const confidenceThreshold = await getConfidenceThreshold(); // Obtener el umbral de confianza
  const smoothingFactor = await getSmoothingFactor(); // Obtener el factor de suavizado

  return (
    <SettingsEditor
      initialMaintenanceMode={isMaintenanceActive}
      initialNoRegisterMode={isNoRegisterActive}
      initialConfidenceThreshold={confidenceThreshold}
      initialSmoothingFactor={smoothingFactor}
    />
  );
}
