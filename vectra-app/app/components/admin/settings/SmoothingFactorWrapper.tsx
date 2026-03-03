import { getSmoothingFactor } from "@/app/lib/data";
import SmoothingFactorSetting from "./SmoothingFactorSetting";

export default async function SmoothingFactorWrapper() {
  const smoothingFactor = await getSmoothingFactor();
  return <SmoothingFactorSetting initialValue={smoothingFactor} />;
}
