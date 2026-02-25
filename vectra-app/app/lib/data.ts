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
 
// Obtenemos repeticiones de un ejercicio para un usuario
export async function getExerciseRepetitions(
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
