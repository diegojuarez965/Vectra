"use client";
import { Users, AlertTriangle, Globe } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RecentUser {
  id: string;
  name: string;
  email: string;
  date: string;
}

interface RecentUsersTableProps {
  data: RecentUser[];
  loading: boolean;
  error: string;
}

export default function RecentUsersTable({
  data,
  loading,
  error,
}: RecentUsersTableProps) {
  return (
    <div className="lg:col-span-1 bg-foreground/5 border border-foreground/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 mb-6">
        <h3 className="text-foreground font-bold flex items-center gap-2 m-0">
          <Users className="w-4 h-4 text-primary shrink-0" />
          Últimos Registros
        </h3>
        <div
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-foreground/10 text-foreground/60 px-2 py-1 rounded-md shrink-0 border border-foreground/5 w-fit"
          title="Sin Filtros (Datos Globales)"
        >
          <Globe className="w-3 h-3" /> Global
        </div>
      </div>
      <div className="flex-1 w-full overflow-hidden">
        {loading ? ( // Cargando
          <div className="space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-foreground/10 shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-foreground/10 rounded w-1/3"></div>
                  <div className="h-3 bg-foreground/10 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-foreground/10 rounded w-16 shrink-0"></div>
              </div>
            ))}
          </div>
        ) : error ? ( // Error
          <div className="h-full w-full flex flex-col items-center justify-center text-red-400 gap-2 min-h-32">
            <AlertTriangle className="w-8 h-8 opacity-50" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : data.length > 0 ? ( // Hay datos
          <div className="space-y-4">
            {data.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-background/40 border border-foreground/5 hover:bg-background/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-foreground/80 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="text-xs text-foreground/80 whitespace-nowrap shrink-0">
                  {user.date
                    ? format(new Date(user.date), "dd MMM yyyy", { locale: es })
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Sin datos
          <div className="h-full w-full flex items-center justify-center text-foreground/80 text-lg min-h-32">
            No hay registros
          </div>
        )}
      </div>
    </div>
  );
}
