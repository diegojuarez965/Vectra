import {
  Users,
  AlertTriangle,
  Activity,
  UserPlus,
  Database,
  Calendar,
  Dumbbell,
  Globe,
} from "lucide-react";

interface AdminStatsKPIsProps {
  totalUsers: number;
  loadingUsers: boolean;
  errorUsers: string;

  totalAnalysis: number;
  loadingAnalysis: boolean;
  errorAnalysis: string;

  totalUsersAnalysis: number;

  dataVolume: number;
  loadingDataVolume: boolean;
  errorDataVolume: string;
}

export default function AdminStatsKPIs({
  totalUsers,
  loadingUsers,
  errorUsers,

  totalAnalysis,
  loadingAnalysis,
  errorAnalysis,

  totalUsersAnalysis,

  dataVolume,
  loadingDataVolume,
  errorDataVolume,
}: AdminStatsKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* TOTAL REGISTROS */}
      <div className="h-full bg-linear-to-br from-primary/20 to-black/40 border border-primary/20 rounded-2xl p-4 md:p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div
          className="flex items-center gap-1 text-[9px] md:text-[10px] uppercase tracking-wider bg-foreground/10 text-foreground/60 px-2 py-0.5 rounded-md border border-foreground/5 mb-3"
          title="Filtro de Fecha"
        >
          <Calendar className="w-3 h-3" /> Fecha
        </div>
        <h3
          className="text-foreground/80 text-[10px] md:text-xs font-medium uppercase tracking-widest mb-2 w-full truncate px-2"
          title="Registros"
        >
          Registros
        </h3>
        <div className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tighter mt-2">
          {loadingUsers ? (
            <span className="animate-pulse text-foreground/80">--</span>
          ) : errorUsers ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-xl">Error</span>
            </div>
          ) : (
            totalUsers
          )}
        </div>
        {!errorUsers && (
          <UserPlus className="absolute bottom-4 right-4 w-8 h-8 text-primary/10" />
        )}
      </div>

      {/* TOTAL ANÁLISIS REALIZADOS */}
      <div className="h-full bg-linear-to-br from-primary/20 to-black/40 border border-primary/20 rounded-2xl p-4 md:p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div
          className="flex items-center gap-1 text-[9px] md:text-[10px] uppercase tracking-wider bg-foreground/10 text-foreground/60 px-2 py-0.5 rounded-md border border-foreground/5 mb-3"
          title="Filtro de Fecha y Ejercicio"
        >
          <Calendar className="w-3 h-3" />
          <Dumbbell className="w-3 h-3" />
        </div>
        <h3
          className="text-foreground/80 text-[10px] md:text-xs font-medium uppercase tracking-widest mb-2 w-full truncate px-2"
          title="Análisis Realizados"
        >
          Análisis Realizados
        </h3>
        <div className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tighter mt-2">
          {loadingAnalysis ? (
            <span className="animate-pulse text-foreground/80">--</span>
          ) : errorAnalysis ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-xl">Error</span>
            </div>
          ) : (
            totalAnalysis
          )}
        </div>
        {!errorAnalysis && (
          <Activity className="absolute bottom-4 right-4 w-8 h-8 text-primary/10" />
        )}
      </div>

      {/* USUARIOS analizados */}
      <div className="h-full bg-linear-to-br from-primary/20 to-black/40 border border-primary/20 rounded-2xl p-4 md:p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div
          className="flex items-center gap-1 text-[9px] md:text-[10px] uppercase tracking-wider bg-foreground/10 text-foreground/60 px-2 py-0.5 rounded-md border border-foreground/5 mb-3"
          title="Filtro de Fecha y Ejercicio"
        >
          <Calendar className="w-3 h-3" />
          <Dumbbell className="w-3 h-3" />
        </div>
        <h3
          className="text-foreground/80 text-[10px] md:text-xs font-medium uppercase tracking-widest mb-2 w-full truncate px-2"
          title="Usuarios Analizados"
        >
          Usuarios Analizados
        </h3>
        <div className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tighter mt-2">
          {loadingAnalysis ? (
            <span className="animate-pulse text-foreground/80">--</span>
          ) : errorAnalysis ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-xl">Error</span>
            </div>
          ) : (
            totalUsersAnalysis
          )}
        </div>
        {!errorAnalysis && (
          <Users className="absolute bottom-4 right-4 w-8 h-8 text-primary/10" />
        )}
      </div>

      {/* VOLUMEN DE DATOS */}
      <div className="h-full bg-linear-to-br from-primary/20 to-black/40 border border-primary/20 rounded-2xl p-4 md:p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div
          className="flex items-center gap-1 text-[9px] md:text-[10px] uppercase tracking-wider bg-foreground/10 text-foreground/60 px-2 py-0.5 rounded-md border border-foreground/5 mb-3"
          title="Datos Globales"
        >
          <Globe className="w-3 h-3" /> Global
        </div>
        <h3
          className="text-foreground/80 text-[10px] md:text-xs font-medium uppercase tracking-widest mb-2 w-full truncate px-2"
          title="Volumen de Datos"
        >
          Volumen de Datos
        </h3>
        <div className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tighter mt-2">
          {loadingDataVolume ? (
            <span className="animate-pulse text-foreground/80">--</span>
          ) : errorDataVolume ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-xl">Error</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[10px] md:text-xs font-normal text-foreground/80 tracking-normal mt-1 leading-tight">
                Feedbacks + Repeticiones
              </span>
              <span>{dataVolume}</span>
            </div>
          )}
        </div>
        {!errorDataVolume && (
          <Database className="absolute bottom-4 right-4 w-8 h-8 text-primary/10" />
        )}
      </div>
    </div>
  );
}
