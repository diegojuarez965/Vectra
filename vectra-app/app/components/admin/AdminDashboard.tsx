"use client";

import { useState, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";
import { Exercise, UserMetrics, AnalysisMetrics } from "@/app/lib/definitions";
import {
  getUsersMetrics,
  getAnalysisMetrics,
  getExercisesDistribution,
  getDataVolume,
  getLastCleanup,
  getLatestUsers,
} from "@/app/lib/data";

// Importamos los subcomponentes
import FiltersBar from "../FiltersBar";
import AdminStatsKPIs from "./AdminStatsKPIs";
import RegisteredUsersChart from "./RegisteredUsersChart";
import AnalysisChart from "./AnalysisChart";
import UsersAnalysisChart from "./UsersAnalysisChart";
import ExerciseDistributionChart from "./ExerciseDistributionChart";
import TechnicalErrorsChart from "./TechnicalErrorsChart";
import RecentUsersTable from "./RecentUsersTable";

export default function AdminDashboard() {
  // ESTADOS PRINCIPALES
  const [selectedExercise, setSelectedExercise] =
    useState<Exercise>("BICEP_CURL");
  const [date, setDate] = useState<Date | undefined>(undefined);

  // DATA STATES
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    total: 0,
    history: [],
  });
  const [analysisMetrics, setAnalysisMetrics] = useState<AnalysisMetrics>({
    totalAnalysis: 0,
    totalUsersAnalysis: 0,
    analysisHistory: [],
    usersAnalysisHistory: [],
    technicalErrors: [],
  });
  const [exercisesDistribution, setExercisesDistribution] = useState<
    { name: string; value: number }[]
  >([]);

  // LOADING, ERROR STATES
  const [usersMetricsLoading, setUsersMetricsLoading] = useState(true);
  const [usersMetricsError, setUsersMetricsError] = useState("");
  const [analysisMetricsLoading, setAnalysisMetricsLoading] = useState(true);
  const [analysisMetricsError, setAnalysisMetricsError] = useState("");
  const [exercisesDistLoading, setExercisesDistLoading] = useState(true);
  const [exercisesDistError, setExercisesDistError] = useState("");
  const [dataVolumeLoading, setDataVolumeLoading] = useState(true);
  const [dataVolumeError, setDataVolumeError] = useState("");
  const [dataVolume, setDataVolume] = useState<number>(0);

  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);

  const [latestUsersLoading, setLatestUsersLoading] = useState(true);
  const [latestUsersError, setLatestUsersError] = useState("");
  const [latestUsers, setLatestUsers] = useState<
    { id: string; name: string; email: string; date: string }[]
  >([]);

  // FETCH DATA: Métricas de usuario
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setUsersMetricsLoading(true);
      setUsersMetricsError("");

      // Limpieza preventiva
      setUserMetrics({ total: 0, history: [] });

      const dateStr = date ? date.toISOString().split("T")[0] : undefined;
      const res = await getUsersMetrics(dateStr);

      if (isMounted) {
        if (res) {
          setUserMetrics(res);
        } else {
          setUsersMetricsError(
            "No se pudieron cargar las métricas de usuarios.",
          );
        }
        setUsersMetricsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [date]);

  // FETCH DATA: Métricas de análisis
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setAnalysisMetricsLoading(true);
      setAnalysisMetricsError("");

      setAnalysisMetrics({
        totalAnalysis: 0,
        totalUsersAnalysis: 0,
        analysisHistory: [],
        usersAnalysisHistory: [],
        technicalErrors: [],
      });

      const dateStr = date ? date.toISOString().split("T")[0] : undefined;
      const res = await getAnalysisMetrics(selectedExercise, dateStr);

      if (isMounted) {
        if (res) {
          setAnalysisMetrics(res);
        } else {
          setAnalysisMetricsError(
            "No se pudieron cargar las métricas de análisis.",
          );
        }
        setAnalysisMetricsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedExercise, date]);

  // FETCH DATA: Distribución de Ejercicios
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setExercisesDistLoading(true);
      setExercisesDistError("");

      setExercisesDistribution([]);

      const dateStr = date ? date.toISOString().split("T")[0] : undefined;
      const res = await getExercisesDistribution(dateStr);

      if (isMounted) {
        if (res) {
          setExercisesDistribution(res);
        } else {
          setExercisesDistError(
            "No se pudieron cargar la distribución de ejercicios.",
          );
        }
        setExercisesDistLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [date]);

  // FETCH DATA: Volumen de Datos
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setDataVolumeLoading(true);
      setDataVolumeError("");

      const res = await getDataVolume();

      if (isMounted) {
        if (res) {
          setDataVolume(res.totalVolume);
        } else {
          setDataVolumeError("Error al cargar el volumen de datos.");
        }
        setDataVolumeLoading(false);
      }
    };
    fetchData();

    // También hacemos fetch de la última limpieza
    const fetchLastCleanup = async () => {
      const res = await getLastCleanup();
      if (isMounted && res) {
        setLastCleanup(res);
      }
    };
    fetchLastCleanup();

    // También hacemos fetch de los últimos usuarios
    const fetchLatestUsers = async () => {
      setLatestUsersLoading(true);
      const res = await getLatestUsers();
      if (isMounted) {
        if (res) {
          setLatestUsers(res);
        } else {
          setLatestUsersError("Error al cargar los últimos usuarios.");
        }
        setLatestUsersLoading(false);
      }
    };
    fetchLatestUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // PROCESAMIENTO DE DATOS PARA GRÁFICOS
  const userChartData = userMetrics.history.map((item) => ({
    date: format(new Date(item.date), "dd MMM", { locale: es }),
    count: item.count,
  }));

  const analysisChartData = (analysisMetrics.analysisHistory || []).map(
    (item) => ({
      date: format(new Date(item.date), "dd MMM", { locale: es }),
      count: item.count,
    }),
  );

  const usersAnalysisChartData = (
    analysisMetrics.usersAnalysisHistory || []
  ).map((item) => ({
    date: format(new Date(item.date), "dd MMM", { locale: es }),
    count: item.count,
  }));

  // Helper para mostrar la fecha de limpieza
  const formatCleanupDate = (date: Date | null) => {
    if (!date) return "Nunca";
    const time = format(date, "hh:mm a");
    if (isToday(date)) return `Hoy, ${time}`;
    if (isYesterday(date)) return `Ayer, ${time}`;
    return format(date, "dd MMM yyyy, hh:mm a", { locale: es });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* BARRA DE FILTROS */}
      <FiltersBar
        date={date}
        setDate={setDate}
        selectedExercise={selectedExercise}
        setSelectedExercise={setSelectedExercise}
      />

      {/* KPIs */}
      <AdminStatsKPIs
        totalUsers={userMetrics.total}
        loadingUsers={usersMetricsLoading}
        errorUsers={usersMetricsError}
        totalAnalysis={analysisMetrics.totalAnalysis}
        loadingAnalysis={analysisMetricsLoading}
        errorAnalysis={analysisMetricsError}
        totalUsersAnalysis={analysisMetrics.totalUsersAnalysis}
        dataVolume={dataVolume}
        loadingDataVolume={dataVolumeLoading}
        errorDataVolume={dataVolumeError}
      />

      <div className="flex justify-end mt-2 mb-2 pr-2">
        <div className="flex items-center gap-1.5 text-xs text-foreground/80 font-medium bg-foreground/5 px-3 py-1.5 rounded-full border border-foreground/10">
          <Clock className="w-3.5 h-3.5" />
          <span>Última limpieza automática: </span>
          <span className="text-foreground">
            {formatCleanupDate(lastCleanup)}
          </span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground border-b border-foreground/10 pb-2 mt-8">
        Comunidad
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO EVOLUCIÓN REGISTROS */}
        <RegisteredUsersChart
          data={userChartData}
          loading={usersMetricsLoading}
          error={usersMetricsError}
        />

        {/* TABLA ÚLTIMOS USUARIOS REGISTRADOS */}
        <RecentUsersTable
          data={latestUsers}
          loading={latestUsersLoading}
          error={latestUsersError}
        />
      </div>

      <h2 className="text-xl font-bold text-foreground border-b border-foreground/10 pb-2 mt-8">
        Análisis y Feedbacks
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO EVOLUCIÓN ANÁLISIS */}
        <AnalysisChart
          data={analysisChartData}
          loading={analysisMetricsLoading}
          error={analysisMetricsError}
        />

        {/* GRÁFICO DISTRIBUCIÓN DE EJERCICIOS */}
        <ExerciseDistributionChart
          data={exercisesDistribution}
          loading={exercisesDistLoading}
          error={exercisesDistError}
        />

        {/* GRÁFICO EVOLUCIÓN USUARIOS */}
        <UsersAnalysisChart
          data={usersAnalysisChartData}
          loading={analysisMetricsLoading}
          error={analysisMetricsError}
        />

        {/* GRÁFICO ERRORES TÉCNICOS GLOBALES */}
        <TechnicalErrorsChart
          data={analysisMetrics.technicalErrors || []}
          loading={analysisMetricsLoading}
          error={analysisMetricsError}
        />
      </div>
    </div>
  );
}
