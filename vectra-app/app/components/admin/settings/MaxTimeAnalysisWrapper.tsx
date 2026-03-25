import { getMaxTimeAnalysis } from "@/app/lib/data";
import MaxTimeAnalysisSetting from "./MaxTimeAnalysisSetting";

export default async function MaxTimeAnalysisWrapper() {
  const maxTimeAnalysis = await getMaxTimeAnalysis();

  return <MaxTimeAnalysisSetting initialValue={maxTimeAnalysis} />;
}
