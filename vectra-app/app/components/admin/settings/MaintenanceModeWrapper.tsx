import { getMaintenanceMode } from "@/app/lib/data";
import MaintenanceModeSetting from "./MaintenanceModeSetting";

export default async function MaintenanceModeWrapper() {
  const isMaintenanceActive = await getMaintenanceMode();
  return <MaintenanceModeSetting initialValue={isMaintenanceActive} />;
}
