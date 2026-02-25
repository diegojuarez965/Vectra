"use client";

import { useState, useRef, useEffect } from "react";
import {
  Filter,
  Dumbbell,
  ChevronDown,
  Check,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EXERCISE_LABELS, Exercise } from "@/app/lib/definitions";
import Calendar from "@/app/components/Calendar";

// Interface de barra de filtros del dashboard de usuario
interface FiltersBarProps {
  selectedExercise: Exercise;
  setSelectedExercise: (ex: Exercise) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}
export default function FiltersBar({
  selectedExercise,
  setSelectedExercise,
  date,
  setDate,
}: FiltersBarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State para abrir y cerrar el calendario
  const [isExerciseOpen, setIsExerciseOpen] = useState(false); // State para abrir y cerrar el selector de ejercicios

  const calendarRef = useRef<HTMLDivElement>(null); // Referencia al div del calendario
  const exerciseRef = useRef<HTMLDivElement>(null); // Referencia al div del selector de ejercicios

  // Click outside logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
      if (
        exerciseRef.current &&
        !exerciseRef.current.contains(event.target as Node)
      ) {
        setIsExerciseOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-foreground/5 border border-foreground/10 p-4 rounded-2xl items-center relative z-20">
      <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm mr-auto">
        <Filter className="w-4 h-4" /> Filtros
      </div>

      {/* SELECTOR EJERCICIO */}
      <div className="relative w-full md:w-56" ref={exerciseRef}>
        <button
          onClick={() => setIsExerciseOpen(!isExerciseOpen)}
          className={`cursor-pointer w-full flex items-center justify-between bg-background/40 hover:bg-foreground/10 border text-sm rounded-xl pl-10 pr-4 py-2.5 transition-all ${isExerciseOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-foreground/10"} text-foreground`}
        >
          <Dumbbell
            className={`absolute left-3 w-4 h-4 ${isExerciseOpen ? "text-primary" : "text-foreground/80"}`}
          />
          <span className="truncate font-medium">
            {EXERCISE_LABELS[selectedExercise]}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExerciseOpen ? "rotate-180 text-primary" : "text-foreground/80"}`}
          />
        </button>

        {isExerciseOpen && (
          <div className="absolute top-full mt-2 left-0 w-full bg-black backdrop-blur-xl border border-foreground/10 rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
              {Object.entries(EXERCISE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedExercise(key as Exercise);
                    setIsExerciseOpen(false);
                  }}
                  className={`cursor-pointer flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground  ${selectedExercise === key ? "bg-primary text-foreground font-bold hover:opacity-80" : "text-foreground/80 hover:bg-foreground/10"}`}
                >
                  <span>{label}</span>
                  {selectedExercise === key && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SELECTOR FECHA */}
      <div className="relative w-full md:w-56" ref={calendarRef}>
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={`cursor-pointer w-full flex items-center justify-start text-left bg-background/40 hover:bg-foreground/10 border text-sm rounded-xl pl-10 pr-4 py-2.5 transition-all ${isCalendarOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-foreground/10"} ${!date ? "text-foreground/80" : "text-foreground"}`}
        >
          <CalendarIcon
            className={`absolute left-3 w-4 h-4 ${isCalendarOpen ? "text-primary" : "text-foreground/80"}`}
          />
          <span className="truncate font-medium">
            {date ? format(date, "PPP", { locale: es }) : "Últimos 7 días"}
          </span>
          {date && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setDate(undefined);
              }}
              className="absolute right-3 p-1 hover:bg-foreground/10 rounded-full cursor-pointer group"
            >
              <X className="w-3 h-3 text-foreground/80 group-hover:text-foreground" />
            </div>
          )}
        </button>
        {isCalendarOpen && (
          <div className="absolute top-full mt-2 right-0 z-50 rounded-xl border border-foreground/10 bg-black backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95">
            <Calendar
              selected={date}
              onSelect={setDate}
              onClose={() => setIsCalendarOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
