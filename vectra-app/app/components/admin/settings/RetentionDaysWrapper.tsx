import { getRetentionDays } from "@/app/lib/data";
import RetentionDaysSetting from "./RetentionDaysSetting";

export default async function RetentionDaysWrapper() {
  const retentionDays = await getRetentionDays();

  return <RetentionDaysSetting initialValue={retentionDays} />;
}
