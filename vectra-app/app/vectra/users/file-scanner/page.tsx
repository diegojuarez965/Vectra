import { getConfidenceThreshold, getSmoothingFactor  } from "@/app/lib/actions"; // Asumiendo que existe

import FileScanner from "@/app/components/users/FileScanner";
import { FileScan } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FileScannerPage() {
  // Usamos Promise.all para cargar todo en paralelo
  const [confidence, smoothing] = await Promise.all([
    getConfidenceThreshold(),
    getSmoothingFactor(), 
  ]);

  return (
    <div className="h-full w-full overflow-y-auto bg-black p-4 md:p-8 text-white">
      
      {/* HEADER DE LA PÁGINA */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <FileScan className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Análisis de Archivo
            </h1>
        </div>
        <p className="text-white/60 max-w-2xl">
          Sube grabaciones previas de entrenamientos para extraer métricas biomecánicas frame a frame.
        </p>
      </div>

      {/* COMPONENTE CLIENTE */}
      <FileScanner 
         confidenceThreshold={confidence} 
         smoothingFactor={smoothing} 
      />

    </div>
  );
}