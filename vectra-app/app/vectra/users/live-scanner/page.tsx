import { getConfidenceThreshold, getSmoothingFactor } from "@/app/lib/data";
import LiveScanner from "@/app/components/users/LiveScanner";
import { FileScan, History, TrendingUp } from "lucide-react";
import { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Analizar En Vivo",
};

export const dynamic = "force-dynamic";

export default async function LiveScannerPage() {
  const [confidence, smoothingFactor] = await Promise.all([
    getConfidenceThreshold(),
    getSmoothingFactor(),
  ]);

  const session = await auth();
  const userID = session?.user?.id || undefined;

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 border-b border-foreground/10 pb-6">
          <div className="p-3 bg-foreground/5 rounded-xl border border-foreground/10 shadow-lg shadow-primary/5">
            <FileScan className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Análisis en Vivo
            </h1>
            <p className="text-sm text-muted-foreground hidden md:block">
              Modo de Entrenamiento Oficial
            </p>
          </div>
        </div>

        {/* EXPLICACIÓN DE VALOR Y GUARDADO */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 w-full">
          <p className="text-foreground/80 text-center mb-3 text-sm md:text-lg leading-relaxed">
            Graba tu entrenamiento en tiempo real. En este modo,{" "}
            <strong className="text-primary font-semibold">
              puedes guardar tu progreso automaticamente.
            </strong>
          </p>

          <div className="flex flex-col justify-center sm:flex-row gap-3">
            {/* Badge 1: Historial */}
            <div className="flex items-center justify-center text-center gap-2 text-sm md:text-lg text-foreground/80 bg-black/20 px-3 py-2 rounded-lg border border-foreground/5">
              <History className="w-4 h-4 text-primary" />
              <span>
                Se guardan tus <strong>repeticiones y errores</strong> en el
                historial.
              </span>
            </div>

            {/* Badge 2: Progreso */}
            <div className="flex items-center justify-center text-center gap-2 text-sm md:text-lg text-foreground/80 bg-black/20 px-3 py-2 rounded-lg border border-foreground/5">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>
                Ideal para medir tu <strong>evolución técnica</strong> y
                constancia.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE SCANNER */}
      <LiveScanner
        confidenceThreshold={confidence}
        smoothingFactor={smoothingFactor}
        userID={userID}
      />
    </div>
  );
}
