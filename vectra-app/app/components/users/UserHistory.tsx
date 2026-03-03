"use client";

import { useState, useEffect } from "react";
import { Exercise, DailySession } from "@/app/lib/definitions";
import { getPaginatedHistory } from "@/app/lib/data";
import { AlertTriangle } from "lucide-react";
import FiltersBar from "./FiltersBar";
import HistoryCard from "./HistoryCard";
import Pagination from "../Pagination";
import UserHistorySkeleton from "./UserHistorySkeleton";

interface HistoryDashboardProps {
  userID: string;
}

export default function HistoryDashboard({ userID }: HistoryDashboardProps) {
  // Filtros
  const [selectedExercise, setSelectedExercise] =
    useState<Exercise>("BICEP_CURL");
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 3;

  // Datos
  const [historyData, setHistoryData] = useState<DailySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch desde el Servidor
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      const dateStr = date?.toISOString().split("T")[0];

      const result = await getPaginatedHistory(
        userID,
        selectedExercise,
        currentPage,
        ITEMS_PER_PAGE,
        dateStr,
      );

      if (isMounted) {
        if (result && !result.error) {
          setHistoryData(result.data);
          setTotalPages(result.pagination.totalPages);
        } else {
          setError(result?.error || "Error al cargar el historial.");
          setHistoryData([]);
        }
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userID, selectedExercise, date, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <FiltersBar
        selectedExercise={selectedExercise}
        setSelectedExercise={(ex) => {
          setSelectedExercise(ex);
          setCurrentPage(1); // Resetea la página al cambiar el ejercicio
        }}
        date={date}
        setDate={(newDate) => {
          setDate(newDate);
          setCurrentPage(1); // Resetea la página al cambiar la fecha
        }}
      />

      <div className="w-full">
        {isLoading ? (
          <UserHistorySkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400 bg-red-400/5 rounded-2xl border border-red-400/20">
            <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
            <p>{error}</p>
          </div>
        ) : historyData.length > 0 ? (
          <div className="space-y-8">
            {/* GRILLA DE TARJETAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyData.map((session) => (
                <HistoryCard
                  key={`${session.date}-${session.exercise}`}
                  session={session}
                />
              ))}
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-foreground/80 bg-foreground/5 rounded-2xl border border-foreground/10">
            <p>No hay registros para los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
