"use client";
import { Activity, AlertTriangle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import RepetitionsChartSkeleton from "./RepetitionsChartSkeleton";

// Interface de gráfica de repeticiones del dashboard de usuario
interface RepetitionsChartProps {
  data: { date: string; reps: number }[];
  loading: boolean;
  error: string;
}

export default function RepetitionsChart({
  data,
  loading,
  error,
}: RepetitionsChartProps) {
  return (
    <div className="lg:col-span-2 bg-foreground/5 border border-foreground/10 rounded-2xl p-6">
      <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        Progreso de Carga
      </h3>
      <div className="h-62.5 w-full">
        {loading ? ( // Cargando
          <RepetitionsChartSkeleton />
        ) : // Error obteniendo datos
        error ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-red-400 gap-2">
            <AlertTriangle className="w-8 h-8 opacity-50" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : // Hay datos
        data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorReps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5722" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff5722" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ededed"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#ededed"
                tick={{ fill: "#ededed", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#ededed"
                tick={{ fill: "#ededed", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#424242",
                  border: "1px solid #ff5722",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#ededed" }}
              />
              <Area
                type="monotone"
                dataKey="reps"
                stroke="#ff5722"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorReps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          // Sin datos
          <div className="h-full w-full flex items-center justify-center text-foreground/80 text-2xl">
            Sin datos
          </div>
        )}
      </div>
    </div>
  );
}
