"use client";
import { Dumbbell, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import DistributionChartSkeleton from "../DistributionChartSkeleton";

const COLORS = [
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#ef4444", // Red
  "#ec4899", // Pink
];

// Interface de gráfica de distribución de análisis
interface ExerciseDistributionChartProps {
  data: { name: string; value: number }[];
  loading: boolean;
  error: string;
}

export default function ExerciseDistributionChart({
  data,
  loading,
  error,
}: ExerciseDistributionChartProps) {
  return (
    <div className="lg:col-span-1 bg-foreground/5 border border-foreground/10 rounded-2xl p-6 flex flex-col h-auto min-h-87.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 mb-4">
        <h3 className="text-foreground font-bold flex items-center gap-2 m-0 shrink-0">
          <Dumbbell className="w-4 h-4 text-primary shrink-0" />
          Ejercicios Analizados
        </h3>
        <div
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-foreground/10 text-foreground/60 px-2 py-1 rounded-md shrink-0 border border-foreground/5 w-fit"
          title="Filtro de Fecha"
        >
          <Calendar className="w-3 h-3" /> Fecha
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col">
        {
          // Cargando
          loading ? (
            <DistributionChartSkeleton />
          ) : // Error obteniendo datos
          error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-2 min-h-50">
              <Dumbbell className="w-8 h-8 opacity-50" />
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
            // Sin datos
            <div className="flex-1 flex flex-col items-center justify-center text-foreground/80 min-h-50">
              <p className="text-2xl text-center">Sin datos</p>
            </div>
          )
        }
      </div>
    </div>
  );
}
