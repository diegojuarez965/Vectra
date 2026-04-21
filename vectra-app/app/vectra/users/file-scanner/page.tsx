import { getConfidenceThreshold, getSmoothingFactor } from "@/app/lib/data";
import { EXERCISE_LABELS, type Exercise } from "@/app/lib/definitions";
import Link from "next/link";
import FileScanner from "@/app/components/users/FileScanner";
import FileScannerSkeleton from "@/app/components/users/FileScannerSkeleton";
import { FileVideo, Eye, FlaskConical } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Analizar Archivo",
};

export const dynamic = "force-dynamic";

async function ScannerDataFetcher({ exercise }: { exercise: Exercise }) {
  const [confidence, smoothingFactor] = await Promise.all([
    getConfidenceThreshold(),
    getSmoothingFactor(),
  ]);

  return (
    <div className="w-full flex justify-center mt-6">
      <FileScanner
        confidenceThreshold={confidence}
        smoothingFactor={smoothingFactor}
        exercise={exercise}
      />
    </div>
  );
}

export default async function FileScannerPage(props: {
  searchParams?: Promise<{ exercise?: string }>;
}) {
  const params = await props.searchParams;
  const exerciseQuery = params?.exercise;

  const isValidExercise =
    exerciseQuery &&
    Object.keys(EXERCISE_LABELS).includes(exerciseQuery);
  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 border-b border-foreground/10 pb-6">
          <div className="p-3 bg-foreground/5 rounded-xl border border-foreground/10 shadow-lg shadow-primary/5">
            <FileVideo className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Análisis de Archivo
            </h1>
            <p className="text-sm text-muted-foreground hidden md:block">
              Laboratorio de Diagnóstico Técnico
            </p>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 w-full relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex gap-4 relative z-10">
            <div className="flex-1">
              <p className="text-foreground/80 text-sm md:text-lg text-center mb-4 leading-relaxed">
                Sube tus videos para revisar errores frame a frame. Este modo es
                exclusivamente para <strong>diagnóstico visual</strong>.
              </p>

              <div className="flex flex-col justify-center sm:flex-row gap-3">
                {/* Badge 1: Sin Guardado */}
                <div className="flex items-center text-center gap-2 text-sm md:text-lg text-foreground/80 bg-black/20 px-3 py-2 rounded-lg border border-foreground/5">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  <span>
                    Las métricas <strong>NO se guardan</strong> en tu historial.
                  </span>
                </div>

                {/* Badge 2: Visualización */}
                <div className="flex items-center text-center gap-2 text-sm md:text-lg text-foreground/80 bg-black/20 px-3 py-2 rounded-lg border border-foreground/5">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>
                    Solo para <strong>revisión y aprendizaje</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILE SCANNER DATA LOADER / EXERCISE SELECTOR */}
      {!isValidExercise ? (
        <div className="mt-8 bg-foreground/5 border border-foreground/10 rounded-2xl p-6 w-full max-w-md mx-auto animate-in fade-in zoom-in duration-500">
          <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
            Selecciona un Ejercicio
          </h2>
          <div className="flex flex-col gap-4">
            {Object.entries(EXERCISE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`?exercise=${key}`}
                className="w-full py-4 text-center bg-primary hover:bg-primary/80 text-foreground font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:scale-105"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Suspense fallback={<FileScannerSkeleton />}>
          <ScannerDataFetcher exercise={exerciseQuery as Exercise} />
        </Suspense>
      )}
    </div>
  );
}
