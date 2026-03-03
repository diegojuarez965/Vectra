"use client";
import { AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ErrorDistributionChartSkeleton from "./ErrorDistributionChartSkeleton";

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
];

// Interface de gráfica de errores del dashboard de usuario
interface ErrorDistributionChartProps {
  data: { name: string; value: number }[];
  loading: boolean;
  error: string;
}

export default function ErrorDistributionChart({
  data,
  loading,
  error,
}: ErrorDistributionChartProps) {
  return (
    <div className="lg:col-span-1 bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex flex-col h-auto min-h-87.5">
      <h3 className="text-foreground font-bold mb-4 flex items-center gap-2 shrink-0">
        <AlertTriangle className="w-4 h-4 text-primary" />
        Tipos de Error
      </h3>

      <div className="flex-1 w-full flex flex-col">
        {
          // Cargando
          loading ? (
            <ErrorDistributionChartSkeleton />
          ) : // Error obteniendo datos
          error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-2 min-h-50">
              <AlertTriangle className="w-8 h-8 opacity-50" />
              <p className="text-sm text-center">{error}</p>
            </div>
          ) : // Hay datos
          data.length > 0 ? (
            <>
              <div className="w-full h-55 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="rgba(0,0,0,0.5)"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#424242",
                        border: "1px solid #ff5722",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "#ededed" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {data.map((entry, index) => (
                  <div
                    key={`legend-${index}`}
                    className="flex items-center gap-2 bg-foreground/5 px-2 py-1 rounded-md border border-foreground/5"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span
                      className="text-xs text-foreground/80 font-medium"
                      title={entry.name}
                    >
                      {entry.name}{" "}
                      <span className="text-foreground/80 ml-1">
                        ({entry.value})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Sin errores
            <div className="flex-1 flex flex-col items-center justify-center text-foreground/80 min-h-50">
              <p className="text-2xl text-center">¡Técnica perfecta!</p>
              <p className="text-2xl mt-1 opacity-50 text-center">
                No hay errores registrados.
              </p>
            </div>
          )
        }
      </div>
    </div>
  );
}
