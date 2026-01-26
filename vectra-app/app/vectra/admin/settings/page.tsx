import {
  getMaintenanceMode,
  getNoRegisterMode,
  getConfidenceThreshold,
  getSmoothingFactor
} from "@/app/lib/actions";
import SettingsEditor from "@/app/components/admin/SettingsEditor";

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
