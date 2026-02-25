"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  RepetitionHistory,
  FeedbackHistory,
  ERROR_LABELS,
  Exercise,
} from "@/app/lib/definitions";
import { getExerciseRepetitions, getExerciseFeedbacks } from "@/app/lib/data";

// Importamos los subcomponentes
import FiltersBar from "./FiltersBar";
import StatsKPIs from "./StatsKPIs";
import RepetitionsChart from "./RepetitionsChart";
import ErrorDistributionChart from "./ErrorDistributionChart";
import CorrectionsChart from "./CorrectionsChart";

interface DashboardProps {
  userID: string;
}

export default function UserDashboard({ userID }: DashboardProps) {
  // ESTADOS PRINCIPALES
  const [selectedExercise, setSelectedExercise] =
    useState<Exercise>("BICEP_CURL");
  const [date, setDate] = useState<Date | undefined>(undefined);

  // DATA STATES
  const [repetitionsData, setRepetitionsData] = useState<RepetitionHistory>({
    total: 0,
    history: {},
  });
  const [feedbacksData, setFeedbacksData] = useState<FeedbackHistory>({
    total: 0,
    historyDate: {},
    historyError: {},
  });

  // LOADING, ERROR STATES
  const [repetitionsLoading, setRepetitionsLoading] = useState(true);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [repetitionsError, setRepetitionsError] = useState("");
  const [feedbacksError, setFeedbacksError] = useState("");

  // FETCH DATA: Repetitions
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setRepetitionsLoading(true);
      setRepetitionsError("");

      // Limpieza preventiva
      setRepetitionsData({ total: 0, history: {} });

      const repetitions = await getExerciseRepetitions(
        userID,
        selectedExercise,
        date?.toISOString().split("T")[0],
      );

      if (isMounted) {
        if (repetitions) {
          setRepetitionsData(repetitions);
        } else {
          setRepetitionsError("No se pudieron cargar las repeticiones.");
        }
        setRepetitionsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [userID, selectedExercise, date]);

  // FETCH DATA: Feedbacks
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setFeedbacksLoading(true);
      setFeedbacksError("");

      // Limpieza preventiva
      setFeedbacksData({ total: 0, historyDate: {}, historyError: {} });

      const feedbacks = await getExerciseFeedbacks(
        userID,
        selectedExercise,
        date?.toISOString().split("T")[0],
      );

      if (isMounted) {
        if (feedbacks) {
          setFeedbacksData(feedbacks);
        } else {
          setFeedbacksError("No se pudieron cargar las correcciones.");
        }
        setFeedbacksLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [userID, selectedExercise, date]);

  // PROCESAMIENTO DE DATOS PARA GRÁFICOS
  const repsChartData = Object.values(repetitionsData.history || {}).map(
    (item) => ({
      date: format(new Date(item.date), "dd MMM", { locale: es }),
      reps: item.count,
    }),
  );

  const feedbackTimeData = Object.values(feedbacksData.historyDate || {}).map(
    (item) => ({
      date: format(new Date(item.date), "dd MMM", { locale: es }),
      count: item.count,
    }),
  );

  const feedbackErrorData = Object.values(feedbacksData.historyError || {}).map(
    (item) => ({
      name: ERROR_LABELS[item.error as keyof typeof ERROR_LABELS] || item.error,
      value: item.count,
    }),
  );

  const mostFrequentError = feedbackErrorData.reduce(
    (prev, current) => (prev.value > current.value ? prev : current),
    { name: "Ninguno", value: 0 },
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* BARRA DE FILTROS */}
      <FiltersBar
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
        date={date}
        setDate={setDate}
      />

      {/* KPIs */}
      <StatsKPIs
        repetitionsTotal={repetitionsData.total}
        repetitionsLoading={repetitionsLoading}
        repetitionsError={repetitionsError}
        feedbacksTotal={feedbacksData.total}
        feedbacksLoading={feedbacksLoading}
        feedbacksError={feedbacksError}
        mostFrequentErrorName={mostFrequentError.name}
        mostFrequentErrorValue={mostFrequentError.value}
      />

      {/* GRÁFICOS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO REPETICIONES */}
        <RepetitionsChart
          data={repsChartData}
          loading={repetitionsLoading}
          error={repetitionsError}
        />

        {/* GRÁFICO DISTRIBUCIÓN ERRORES */}
        <ErrorDistributionChart
          data={feedbackErrorData}
          loading={feedbacksLoading}
          error={feedbacksError}
        />
      </div>

      {/* GRÁFICO EVOLUCIÓN FEEDBACKS */}
      <CorrectionsChart
        data={feedbackTimeData}
        loading={feedbacksLoading}
        error={feedbacksError}
      />
    </div>
  );
}
