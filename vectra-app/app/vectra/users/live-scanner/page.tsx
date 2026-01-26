import Scanner from '@/app/components/users/Scanner';
import { getConfidenceThreshold } from "@/app/lib/actions";


export default async function LiveScannerPage() {
  const confidence_threshold = await getConfidenceThreshold();
  return(
    <div className="flex flex-col items-center justify-center h-[85%] w-full text-white">
      <Scanner confidence_threshold={confidence_threshold} />
    </div>
  );
}