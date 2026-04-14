import { z } from "zod";
import { EXERCISE_LABELS, ERROR_LABELS } from "./definitions";

// ESQUEMAS DE USUARIO

const BaseUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Por favor ingrese un nombre"),
  email: z.string().email("Por favor ingrese un correo electrónico válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres\n")
    .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula\n")
    .regex(/[a-z]/, "Debe contener al menos una letra minúscula\n")
    .regex(/[0-9]/, "Debe contener al menos un número\n"),
  confirmPassword: z.string().min(1, "La confirmación es obligatoria"),
  rol: z.enum(["admin", "user"]),
});

export const CreateUserSchema = BaseUserSchema.omit({
  id: true,
  rol: true,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const EditUserSchema = z.object({
  id: z.string().min(1, "El ID del usuario es obligatorio"),
  name: z.string().min(1, "Por favor ingrese un nombre"),
  email: z.string().email("Por favor ingrese un correo electrónico válido"),
  rol: z.enum(["admin", "user"], "El rol debe ser Administrador o Usuario"),
  active: z.boolean("El estado de la cuenta debe ser Activo o Inactivo"),
  imageDelete: z.boolean(
    "La eliminación de la imagen debe ser Verdadero o Falso",
  ),
  resetPassword: z.boolean(
    "El reinicio de contraseña debe ser Verdadero o Falso",
  ),
});

export const EditProfileSchema = z.object({
  id: z.string().min(1, "El ID del usuario es obligatorio"),
  name: z.string().min(1, "Por favor ingrese un nombre"),
  email: z.string().email("Por favor ingrese un correo electrónico válido"),
});

const EXERCISES = Object.keys(EXERCISE_LABELS) as [string, ...string[]];
const ERRORS = Object.keys(ERROR_LABELS) as [string, ...string[]];

// Esquema de un feedback individual
export const FeedbackSchema = z.object({
  errorType: z.enum(["TECHNICAL"]),
  exercise: z.enum(EXERCISES),
  error: z.enum(ERRORS),
  message: z.string().min(1, "El mensaje no puede estar vacío"),
});

// Esquema de envío de múltiples feedbacks
export const SubmitFeedbacksSchema = z.object({
  userID: z.string().min(1, "El ID de usuario es obligatorio"),
  feedbacks: z.array(FeedbackSchema),
});

// Esquema de repeticiones
export const SubmitRepetitionsSchema = z.object({
  userID: z.string().min(1, "El ID de usuario es obligatorio"),
  exercise: z.enum(EXERCISES),
  count: z.number().int().positive("Las repeticiones deben ser mayores a cero"),
});

// Esquema de envío de correo de restablecimiento de contraseña
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Por favor ingrese un correo electrónico válido"),
});

// Esquema de restablecimiento de contraseña
export const ResetPasswordSchema = z
  .object({
    token: z
      .string()
      .length(64, "Token inválido o corrupto")
      .regex(/^[0-9a-f]+$/i, "Formato de token inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "La confirmación es obligatoria"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Esquema de envío de mensaje al chatbot
export const SubmitChatbotMessageSchema = z.object({
  message: z.string().min(1, "El mensaje no puede estar vacío"),
});
