import { getMaintenanceMode, getNoRegisterMode  } from "@/app/lib/actions"; 
import SettingsEditor from "@/app/components/admin/SettingsEditor";


export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const isMaintenanceActive = await getMaintenanceMode();
  const isNoRegisterActive = await getNoRegisterMode();

  return <SettingsEditor initialMaintenanceMode={isMaintenanceActive} initialNoRegisterMode={isNoRegisterActive} />;
}
