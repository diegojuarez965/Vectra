import { getConfidenceThreshold, getSmoothingFactor } from "@/app/lib/actions";

import LiveScanner from "@/app/components/users/LiveScanner";
import { FileScan } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analizar En Vivo",
};

export const dynamic = "force-dynamic";

export default async function LiveScannerPage() {
  const [confidence, smoothing] = await Promise.all([
    getConfidenceThreshold(),
    getSmoothingFactor(),
  ]);

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <FileScan className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Análisis en Vivo
          </h1>
        </div>
        <p className="text-white/60 max-w-2xl">
          Graba en vivo tu entrenamiento para analizarlo.
        </p>
      </div>

      {/* LIVE SCANNER */}
      <LiveScanner
        confidenceThreshold={confidence}
        smoothingFactor={smoothing}
      />
    </div>
  );
}
