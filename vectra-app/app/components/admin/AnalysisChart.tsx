"use client";
import { Activity, AlertTriangle, Calendar, Dumbbell } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import FunctionChartSkeleton from "../FunctionChartSkeleton";

// Interface de gráfica de análisis
interface AnalysisChartProps {
  data: { date: string; count: number }[];
  loading: boolean;
  error: string;
}

export default function AnalysisChart({
  data,
  loading,
  error,
}: AnalysisChartProps) {
  return (
    <div className="lg:col-span-1 bg-foreground/5 border border-foreground/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 mb-6">
        <h3 className="text-foreground font-bold flex items-center gap-2 m-0">
          <Activity className="w-4 h-4 text-primary shrink-0" />
          Evolución de Análisis
        </h3>
        <div
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider bg-foreground/10 text-foreground/60 px-2 py-1 rounded-md shrink-0 border border-foreground/5 w-fit"
          title="Filtro de Fecha y Ejercicio"
        >
          <Calendar className="w-3 h-3" />
          <Dumbbell className="w-3 h-3" />
        </div>
      </div>
      <div className="h-64 w-full grow">
        {loading ? ( // Cargando
          <FunctionChartSkeleton />
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
                <linearGradient id="colorAnalysis" x1="0" y1="0" x2="0" y2="1">
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
                allowDecimals={false}
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
                dataKey="count"
                stroke="#ff5722"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAnalysis)"
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
