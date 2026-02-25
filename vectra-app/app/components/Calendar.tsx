"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VectraCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  onClose?: () => void;
}

export default function Calendar({
  selected,
  onSelect,
  onClose,
}: VectraCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Mes actual
  const today = new Date(); // Fecha actual

  // Generar los días a mostrar
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }), // Lunes como primer día
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  // Nombres de días de la semana (Lu, Ma, Mi...)
  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  return (
    <div className="p-4 w-75">
      {/* HEADER: Mes y Navegación */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-foreground/10 rounded-md text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-foreground font-bold capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </span>

        <button
          onClick={() => {
            // Evitar navegar a meses futuros
            if (!isSameMonth(currentMonth, today)) {
              setCurrentMonth(addMonths(currentMonth, 1));
            }
          }}
          disabled={isSameMonth(currentMonth, today)} // Deshabilita flecha derecha si es el mes actual
          className="p-1 hover:bg-foreground/10 rounded-md text-foreground transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* GRILLA: Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-bold text-foreground/80"
          >
            {day}
          </div>
        ))}
      </div>

      {/* GRILLA: Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDisabled = isAfter(day, today); // Deshabilitar futuro
          const isDayToday = isToday(day);

          return (
            <button
              key={day.toString()}
              disabled={isDisabled}
              onClick={() => {
                onSelect(day);
                if (onClose) onClose();
              }}
              className={`
                h-9 w-9 flex items-center justify-center rounded-lg text-sm transition-all relative
                ${!isCurrentMonth ? "text-foreground/80" : "text-foreground"}
                ${isDisabled ? "opacity-20 cursor-not-allowed line-through" : "hover:bg-foreground/10 cursor-pointer"}
                ${isSelected ? "bg-primary! text-foreground font-bold shadow-[0_0_15px_rgba(var(--primary),0.6)] z-10" : ""}
                ${isDayToday && !isSelected ? "bg-foreground/5 border border-foreground/20 text-primary" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
