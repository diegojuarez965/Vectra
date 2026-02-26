"use client";

import { Calendar, Dumbbell, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  DailySession,
  EXERCISE_LABELS,
  ERROR_LABELS,
} from "@/app/lib/definitions";

interface HistoryCardProps {
  session: DailySession;
}

export default function HistoryCard({ session }: HistoryCardProps) {
  // Ajuste de zona horaria seguro para fechas YYYY-MM-DD
  const dateObj = parseISO(session.date);
  const formattedDate = format(
    new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000),
    "dd 'de' MMMM, yyyy",
    { locale: es },
  );

  return (
    <div className="bg-background/40 border border-foreground/10 rounded-2xl p-5 flex flex-col hover:border-primary/50 transition-colors duration-300 shadow-sm">
      {/* HEADER: Fecha */}
      <div className="flex items-center gap-2 text-foreground/80 border-b border-foreground/10 pb-4 mb-4">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold capitalize">{formattedDate}</span>
      </div>

      {/* BODY: Ejercicio y Repeticiones */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="font-bold text-foreground">
              {EXERCISE_LABELS[session.exercise]}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-3xl font-black text-foreground leading-none">
              {session.repetitions}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-foreground/80 font-bold">
              Reps Totales
            </span>
          </div>
        </div>

        {/* FOOTER: Feedbacks del Día */}
        <div className="pt-4 border-t border-foreground/5 mt-auto">
          <span className="text-xs text-foreground/80 font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            Correcciones del día
          </span>

          {session.feedbacks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {session.feedbacks.map((fb, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 bg-red-400/5 border border-red-400/20 px-2.5 py-1.5 rounded-lg"
                >
                  <span className="text-red-400 text-xs font-bold bg-red-400/5 px-1.5 py-0.5 rounded-md">
                    {fb.count}x
                  </span>
                  <span
                    className="text-xs text-foreground/80"
                    title={ERROR_LABELS[fb.error]}
                  >
                    {ERROR_LABELS[fb.error] || fb.error}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-400/80 bg-green-400/5 border border-green-400/10 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">
                Técnica perfecta. Sin errores.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
