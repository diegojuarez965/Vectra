"use client";
import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Calendar, Dumbbell } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import HorizontalBarChartSkeleton from "../HorizontalBarChartSkeleton";

// Interface para grabar errores técnicos globales
interface TechnicalErrorsChartProps {
  data: { name: string; count: number }[];
  loading: boolean;
  error: string;
}

export default function TechnicalErrorsChart({
  data,
  loading,
  error,
}: TechnicalErrorsChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="lg:col-span-2 bg-foreground/5 border border-foreground/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 mb-6">
        <h3 className="text-foreground font-bold flex items-center gap-2 m-0">
          <AlertCircle className="w-4 h-4 text-primary shrink-0" />
          Errores Técnicos Globales
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
          <HorizontalBarChartSkeleton />
        ) : // Error obteniendo datos
        error ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-red-400 gap-2">
            <AlertTriangle className="w-8 h-8 opacity-50" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : // Hay datos
        data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorTechnicalErrors"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="5%" stopColor="#ff5722" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff5722" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ededed"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="#ededed"
                tick={{ fill: "#ededed", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#ededed"
                tick={{ fill: "#ededed", fontSize: isMobile ? 10 : 12 }}
                tickLine={false}
                axisLine={false}
                width={isMobile ? 100 : 150} // Adjust width according to your labels
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{
                  backgroundColor: "#424242",
                  border: "1px solid #ff5722",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#ededed" }}
              />
              <Bar
                dataKey="count"
                fill="url(#colorTechnicalErrors)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          // Sin datos o errores
          <div className="h-full w-full flex items-center justify-center text-foreground/80 text-2xl">
            Técnica perfecta
          </div>
        )}
      </div>
    </div>
  );
}
