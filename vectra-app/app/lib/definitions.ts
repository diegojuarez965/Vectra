// Ejercicios
export const EXERCISE_LABELS = {
  BICEP_CURL: "Curl de Bíceps",
  SQUAT: "Sentadilla",
  DEADLIFT: "Peso Muerto",
} as const;

export const ERROR_LABELS = {
  // Errores generales
  NO_ROM_ECCENTRIC: "Fase excéntrica incompleta",
  NO_ROM_CONCENTRIC: "Fase concéntrica incompleta",
  FORWARD_FRONT: "Inclinación hacia adelante",
  FORWARD_BACK: "Inclinación hacia atrás",
  // Errores de Peso Muerto
  BAR_DRIFT: "Barra alejada del cuerpo",
  KNEE_OVERFLEXION: "Rodillas sobre-flexionadas",
  LUMBAR_HYPEREXTENSION: "Hiperextensión lumbar",
  // Errores de Curl
  ELBOW_BACK: "Codo atrasado",
  ELBOW_FRONT: "Codo adelantado",
  // Errores de Sentadilla
  KNEE_LOCKED: "Rodillas bloqueadas",
} as const;

// Interface de Usuario
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  rol: "admin" | "user";
  active: boolean;
  date?: string;
  image_url?: string;
}

// Métricas de Usuarios
export interface UserMetrics {
  total: number;
  history: { date: string; count: number }[];
}

// Interface de respuesta de usuarios
export interface UsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    usersPerPage: number;
  };
}

// Feedback para el usuario
export interface ExerciseFeedback {
  errorType: "TECHNICAL" | "POSITIONING" | "SYSTEM" | "OK";
  exercise?: Exercise;
  error?: ExerciseError;
  message: string;
}

// Historial de repeticiones
export interface RepetitionHistory {
  total: number;
  history: Record<string, { count: number; date: string }>;
}

export interface AnalysisMetrics {
  totalAnalysis: number;
  totalUsersAnalysis: number;
  analysisHistory?: { date: string; count: number }[];
  usersAnalysisHistory?: { date: string; count: number }[];
  technicalErrors?: { name: string; count: number }[];
}

// Historial de feedbacks
export interface FeedbackHistory {
  total: number;
  historyDate: Record<string, { count: number; date: string }>;
  historyError: Record<string, { count: number; error: ExerciseError }>;
}

// Sesión diaria
export interface DailySession {
  date: string;
  exercise: Exercise;
  repetitions: number;
  feedbacks: { error: ExerciseError; count: number }[];
}

// Interface de estado de usuario para crear
export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

// Interface de estado de usuario para editar
export type EditUserState = {
  errors?: {
    id?: string[];
    name?: string[];
    email?: string[];
    rol?: string[];
    active?: string[];
    imageDelete?: string[];
    resetPassword?: string[];
  };
  message?: string | null;
};

export type EditProfileState = {
  errors?: {
    id?: string[];
    name?: string[];
    email?: string[];
    image?: string[];
  };
  message?: string | null;
};

// Tipos de ejercicios
export type Exercise = keyof typeof EXERCISE_LABELS;

// Fases del ejercicio
export type Phase = "CONCENTRIC" | "ECCENTRIC" | "NEUTRAL";

// Tipos de errores
export type ExerciseError = keyof typeof ERROR_LABELS;
