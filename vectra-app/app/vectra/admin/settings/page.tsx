import {
  getMaintenanceMode,
  getNoRegisterMode,
  getConfidenceThreshold,
  getSmoothingFactor
} from "@/app/lib/actions";
import SettingsEditor from "@/app/components/admin/SettingsEditor";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configuración',
  description: 'Ajusta las configuraciones de Vectra desde el panel de administración.',
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const isMaintenanceActive = await getMaintenanceMode();
  const isNoRegisterActive = await getNoRegisterMode();
  const confidenceThreshold = await getConfidenceThreshold();
  const smoothingFactor = await getSmoothingFactor();

  return (
    <SettingsEditor
      initialMaintenanceMode={isMaintenanceActive}
      initialNoRegisterMode={isNoRegisterActive}
      initialConfidenceThreshold={confidenceThreshold}
      initialSmoothingFactor={smoothingFactor}
    />
  );
}
