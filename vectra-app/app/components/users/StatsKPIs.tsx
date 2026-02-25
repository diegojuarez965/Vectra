import { Activity, AlertTriangle } from "lucide-react";

// Interface de KPIs del dashboard de usuario
interface StatsKPIsProps {
  repetitionsTotal: number;
  repetitionsLoading: boolean;
  repetitionsError: string;
  feedbacksTotal: number;
  feedbacksLoading: boolean;
  feedbacksError: string;
  mostFrequentErrorName: string;
  mostFrequentErrorValue: number;
}

export default function StatsKPIs({
  repetitionsTotal,
  repetitionsLoading,
  repetitionsError,
  feedbacksTotal,
  feedbacksLoading,
  feedbacksError,
  mostFrequentErrorName,
  mostFrequentErrorValue,
}: StatsKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* TOTAL REPETICIONES */}
      <div className="bg-linear-to-br from-primary/20 to-black/40 border border-primary/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <h3 className="text-foreground/80 text-xs font-medium uppercase tracking-widest mb-2">
          Repeticiones Totales
        </h3>
        <div className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter">
          {repetitionsLoading ? (
            <span className="animate-pulse text-foreground/80">--</span>
          ) : repetitionsError ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-xl">Error</span>
            </div>
          ) : (
            repetitionsTotal
          )}
        </div>
        {!repetitionsError && (
          <Activity className="absolute bottom-4 right-4 w-8 h-8 text-primary/10" />
        )}
      </div>

      {/* TOTAL FEEDBACKS */}
      <div className="bg-linear-to-br from-red-400/20 to-black/40 border border-red-400/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <h3 className="text-foreground/80 text-xs font-medium uppercase tracking-widest mb-2">
          Correcciones Totales
        </h3>
        <div className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter">
          {feedbacksLoading ? (
            <span className="animate-pulse text-foreground/80">--</span>
          ) : feedbacksError ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-xl">Error</span>
            </div>
          ) : (
            feedbacksTotal
          )}
        </div>
        {!feedbacksError && (
          <AlertTriangle className="absolute bottom-4 right-4 w-8 h-8 text-red-400" />
        )}
      </div>

      {/* ERROR MÁS FRECUENTE */}
      <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
        <h3 className="text-foreground/80 text-xs font-medium uppercase tracking-widest mb-2">
          Error Recurrente
        </h3>
        <div className="text-lg font-bold text-red-400 uppercase wrap-break-word w-full">
          {feedbacksLoading ? (
            <span className="animate-pulse text-foreground/80">--</span>
          ) : feedbacksError ? (
            <span className="text-red-400 flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Sin datos
            </span>
          ) : (
            mostFrequentErrorName
          )}
        </div>
        <p className="text-xs text-foreground/80 mt-1">
          {!feedbacksError && !feedbacksLoading
            ? `${mostFrequentErrorValue} ocurrencias`
            : "—"}
        </p>
      </div>
    </div>
  );
}
