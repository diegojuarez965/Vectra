// Ejercicios
export const EXERCISE_LABELS = {
  BICEP_CURL: "Curl de Bíceps",
  SQUAT: "Sentadilla",
} as const;

export const ERROR_LABELS = {
  // Errores de Curl
  ELBOW_BACK: "Codo atrasado",
  ELBOW_FRONT: "Codo adelantado",
  FORWARD_BACK: "Inclinación hacia atrás",
  FORWARD_FRONT: "Inclinación hacia adelante",
  NO_ROM_ECCENTRIC: "Fase excéntrica incompleta",
  NO_ROM_CONCENTRIC: "Fase concéntrica incompleta",
  // Errores de Sentadilla
  KNEES_INWARD: "Pies hacia adentro",
  HEELS_LIFT: "Pies hacia arriba",
  DEPTH_INSUFFICIENT: "Profundidad insuficiente",
} as const;

// Interface de Usuario
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  rol: "admin" | "user";
  active: boolean;
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
  errorType: "TECHNICAL" | "POSITIONING" | "SYSTEM";
  exercise?: Exercise;
  error?: ExerciseError;
  message: string;
}

// Historial de repeticiones
export interface RepetitionHistory {
  total: number;
  history: Record<string, { count: number; date: string }>;
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
  };
  message?: string | null;
};

// Tipos de ejercicios
export type Exercise = keyof typeof EXERCISE_LABELS;

// Fases del ejercicio
export type Phase = "CONCENTRIC" | "ECCENTRIC" | "NEUTRAL";

// Tipos de errores
export type ExerciseError = keyof typeof ERROR_LABELS;
