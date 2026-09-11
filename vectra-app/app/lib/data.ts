import { unstable_noStore as noStore } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Obtener estado de modo mantenimiento
export async function getMaintenanceMode() {
  noStore();
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/maintenance_mode`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = await res.json();

    return data.value === "true";
  } catch (error) {
    console.error("Error obteniendo modo mantenimiento:", error);
    return false;
  }
}

// Obtener estado de modo sin registro
export async function getNoRegisterMode() {
  noStore();
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/no_register_mode`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = await res.json();

    return data.value === "true";
  } catch (error) {
    console.error("Error obteniendo modo sin registro:", error);
    return false;
  }
}

// Obtener umbral de confianza
export async function getConfidenceThreshold() {
  noStore();
  try {
    const res = await fetch(
      `${baseUrl}/api/system-settings/confidence_threshold`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!res.ok) return 0.5;

    const data = await res.json();

    return parseFloat(data.value);
  } catch (error) {
    console.error("Error obteniendo umbral de confianza:", error);
    return 0.5;
  }
}

// Obtener días de retención del historial
export async function getRetentionDays() {
  noStore();
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/retention_days`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return 30;

    const data = await res.json();

    return parseInt(data.value);
  } catch (error) {
    console.error("Error obteniendo días de retención:", error);
    return 30;
  }
}

// Obtener tiempo máximo de análisis
export async function getMaxTimeAnalysis() {
  noStore();
  try {
    const res = await fetch(
      `${baseUrl}/api/system-settings/max_time_analysis`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!res.ok) return 2;

    const data = await res.json();

    return parseInt(data.value);
  } catch (error) {
    console.error("Error obteniendo tiempo máximo de análisis:", error);
    return 2;
  }
}

// Obtener factor de suavizado
export async function getSmoothingFactor() {
  noStore();
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/smoothing_factor`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return 0.5;
    const data = await res.json();

    return parseFloat(data.value);
  } catch (error) {
    console.error("Error obteniendo factor de suavizado:", error);
    return 0.5;
  }
}

// Obtener la última vez que se ejecutó la limpieza
export async function getLastCleanup() {
  noStore();
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/last_cleanup`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();

    return data.value ? new Date(data.value) : null;
  } catch (error) {
    console.error("Error obteniendo última limpieza:", error);
    return null;
  }
}

// Obtenemos datos de repeticiones de un ejercicio para un usuario
export async function getUserExerciseRepetitions(
  userID: string,
  exerciseID: string,
  date?: string,
) {
  try {
    const params = new URLSearchParams({
      user_id: userID,
      exercise: exerciseID,
    });

    if (date) params.append("date", date);

    const res = await fetch(`${baseUrl}/api/repetitions?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error obteniendo repeticiones:", error);
    return null;
  }
}

// Obtenemos métricas de analisis
export async function getAnalysisMetrics(exerciseID: string, date?: string) {
  try {
    const params = new URLSearchParams({
      exercise: exerciseID,
    });

    if (date) params.append("date", date);

    const res = await fetch(
      `${baseUrl}/api/analysis-metrics?${params.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error obteniendo métricas de análisis:", error);
    return null;
  }
}

// Obtenemos distribución de ejercicios
export async function getExercisesDistribution(date?: string) {
  try {
    const params = new URLSearchParams();

    if (date) params.append("date", date);

    const res = await fetch(
      `${baseUrl}/api/exercises-distribution?${params.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error obteniendo distribución de ejercicios:", error);
    return null;
  }
}

// Obtenemos volumen de datos global
export async function getDataVolume() {
  try {
    const res = await fetch(`${baseUrl}/api/data-volume`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error obteniendo volumen de datos:", error);
    return null;
  }
}

// Obtener los últimos usuarios registrados
export async function getLatestUsers() {
  noStore();
  try {
    const res = await fetch(`${baseUrl}/api/latest-users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error obteniendo últimos usuarios:", error);
    return null;
  }
}

// Obtenemos feedbacks de un ejercicio para un usuario
export async function getExerciseFeedbacks(
  userID: string,
  exerciseID: string,
  date?: string,
) {
  try {
    const params = new URLSearchParams({
      user_id: userID,
      exercise: exerciseID,
    });

    if (date) params.append("date", date);

    const res = await fetch(`${baseUrl}/api/feedbacks?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error obteniendo feedbacks:", error);
    return null;
  }
}

export async function getPaginatedHistory(
  userID: string,
  exerciseID: string,
  page: number = 1,
  limit: number = 3,
  date?: string,
) {
  try {
    const params = new URLSearchParams({
      user_id: userID,
      exercise: exerciseID,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (date) params.append("date", date);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/history?${params.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error("Error obteniendo historial paginado:", error);
    return null;
  }
}

// Obtener usuarios con paginación y búsqueda
export async function getUsers(
  page: number = 1,
  query: string = "",
  rol: string = "all",
  status: string = "all",
  date?: string,
) {
  noStore();
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (query) {
      params.append("query", query);
    }
    if (rol !== "all") {
      params.append("rol", rol);
    }
    if (status !== "all") {
      params.append("status", status);
    }
    if (date) {
      params.append("date", date);
    }
    const res = await fetch(`${baseUrl}/api/users?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return null;
  }
}

// Obtener métricas de usuarios
export async function getUsersMetrics(date?: string) {
  noStore();
  try {
    const params = new URLSearchParams();
    if (date) params.append("date", date);

    const res = await fetch(
      `${baseUrl}/api/users-metrics?${params.toString()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error("Error obteniendo métricas de usuarios:", error);
    return null;
  }
}

// Verificar si el usuario actual es el dueño del token en este navegador
export async function verifyNotificationSubscription(
  token: string,
  userID: string,
) {
  if (!token || !userID) return { isSubscribed: false };

  try {
    const res = await fetch(
      `${baseUrl}/api/notifications/verify?token=${encodeURIComponent(token)}&userID=${encodeURIComponent(userID)}`,
      { method: "GET" },
    );

    if (!res.ok) return { isSubscribed: false };

    const data = await res.json();
    return { isSubscribed: data.isSubscribed };
  } catch (error) {
    console.error("Error en verifyNotificationSubscription:", error);
    return { isSubscribed: false };
  }
}
