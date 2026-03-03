import { getConfidenceThreshold } from "@/app/lib/data";
import ConfidenceThresholdSetting from "./ConfidenceThresholdSetting";

export default async function ConfidenceThresholdWrapper() {
  const confidenceThreshold = await getConfidenceThreshold();
  return <ConfidenceThresholdSetting initialValue={confidenceThreshold} />;
}
