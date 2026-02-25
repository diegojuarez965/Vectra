"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { revalidatePath } from "next/cache";
import { ExerciseFeedback, UserState } from "@/app/lib/definitions";
import {
  CreateUserSchema,
  SubmitFeedbacksSchema,
  SubmitRepetitionsSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "./schemas";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Registro de usuario
export async function registerUser(
  prevState: UserState,
  formData: FormData,
): Promise<UserState> {
  // Validamos los campos usando zod
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
      },
      message: "Faltan campos o hay errores de validación.",
    };
  }

  const { name, email, password, confirmPassword } = validatedFields.data;

  // Enviamos la solicitud
  try {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      return {
        message: data?.error || "Error al registrar usuario.",
      };
    }
  } catch (error) {
    console.error("Error en el servidor o red:", error);
    return {
      message: "Error de red o servidor.",
    };
  }
  redirect("/login");
}

// Autenticación con credenciales
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciales inválidas.";
        default:
          return "Algo salió mal.";
      }
    }
    throw error;
  }
}

// Enviar correo de restablecimiento de contraseña
export async function sendPasswordResetEmail(email: string) {
  // Validación de los campos
  const validatedFields = ForgotPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.flatten().fieldErrors.email?.[0];
    return {
      success: false,
      message: errorMessage,
    };
  }

  const { email: safeEmail } = validatedFields.data;

  //  Enviamos la solicitud
  try {
    const res = await fetch(`${baseUrl}/api/send-mail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: safeEmail }),
    });

    if (!res.ok) {
      const data = await res.json();
      return {
        success: false,
        message: data?.error || "Error al enviar el correo.",
      };
    }

    return { success: true, message: "Correo enviado exitosamente." };
  } catch (error) {
    console.error("Error en el servidor o red:", error);
    return { success: false, message: "Error de red o servidor." };
  }
}

// Restablecimiento de contraseña
export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
) {
  // Validación de los campos
  const validatedFields = ResetPasswordSchema.safeParse({
    token,
    password,
    confirmPassword,
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;

    const errorMessage =
      Object.values(fieldErrors).flat()[0] ||
      "Error de validación desconocido.";

    return {
      success: false,
      message: errorMessage,
    };
  }

  const {
    token: safeToken,
    password: safePassword,
    confirmPassword: safeConfirmPassword,
  } = validatedFields.data;

  // Enviamos la solicitud
  try {
    const res = await fetch(`${baseUrl}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: safeToken,
        password: safePassword,
        confirmPassword: safeConfirmPassword,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return {
        success: false,
        message: data?.error || "Error al restablecer la contraseña.",
      };
    }

    return { success: true, message: "Contraseña restablecida exitosamente." };
  } catch (error) {
    console.error("Error en el servidor o red:", error);
    return { success: false, message: "Error de red o servidor." };
  }
}

// Actualizamos modo mantenimiento
export async function updateMaintenanceMode(formData: FormData) {
  const rawValue = formData.get("maintenance_mode") as string;

  // Validación y conversión del valor del formulario
  const booleanValue = rawValue === "on";

  // Enviamos la solicitud
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/maintenance_mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: booleanValue }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data?.error || "Error al actualizar." };
    }

    revalidatePath("/", "layout");

    return { success: true, message: "Configuración guardada exitosamente." };
  } catch (error) {
    console.error("Error en updateMaintenanceMode:", error);
    return { success: false, message: "Error de conexión con la API." };
  }
}

// Actualizamos modo no registro
export async function updateNoRegisterMode(formData: FormData) {
  const rawValue = formData.get("no_register_mode") as string;

  // Validación y conversión del valor del formulario
  const booleanValue = rawValue === "on";

  // Enviamos la solicitud
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/no_register_mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: booleanValue }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data?.error || "Error al actualizar." };
    }

    revalidatePath("/register", "layout");

    return { success: true, message: "Configuración guardada exitosamente." };
  } catch (error) {
    console.error("Error en updateNoRegisterMode:", error);
    return { success: false, message: "Error de conexión con la API." };
  }
}

// Actualizamos el umbral de confianza
export async function updateConfidenceThreshold(formData: FormData) {
  const rawValue = formData.get("confidence_threshold") as string;
  const numericValue = parseFloat(rawValue);

  // Validamos que sea un número válido y que esté en el rango [0, 1]
  if (isNaN(numericValue) || numericValue < 0 || numericValue > 1) {
    return {
      success: false,
      message: "El valor debe ser un número entre 0 y 1.",
    };
  }

  // Enviamos la solicitud
  try {
    const res = await fetch(
      `${baseUrl}/api/system-settings/confidence_threshold`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: numericValue }),
      },
    );

    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data?.error || "Error al actualizar." };
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Umbral de confianza guardado exitosamente.",
    };
  } catch (error) {
    console.error("Error en updateConfidenceThreshold:", error);
    return { success: false, message: "Error de conexión con la API." };
  }
}

// Actualizamos factor de suavizado
export async function updateSmoothingFactor(formData: FormData) {
  const value = formData.get("smoothing_factor") as string;
  const numericValue = parseFloat(value);

  // Validamos que el valor sea un número y que sea 0.2, 0.5 o 0.8
  if (
    isNaN(numericValue) ||
    (numericValue !== 0.2 && numericValue !== 0.5 && numericValue !== 0.8)
  ) {
    return { success: false, message: "El valor debe ser 0.2, 0.5 o 0.8." };
  }

  // Enviamos la solicitud
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/smoothing_factor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: numericValue }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, message: data?.error || "Error al actualizar." };
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Factor de suavizado guardado exitosamente.",
    };
  } catch (error) {
    console.error("Error en updateSmoothingFactor:", error);
    return { success: false, message: "Error de conexión con la API." };
  }
}

// Enviamos los feedbacks
export async function submitFeedbacks(
  feedbacks: ExerciseFeedback[],
  userID: string,
) {
  // Validamos los parámetros
  const validatedData = SubmitFeedbacksSchema.safeParse({
    userID: userID,
    feedbacks: feedbacks,
  });

  if (!validatedData.success) {
    console.error(
      "Intento de inyección o datos corruptos:",
      validatedData.error.flatten(),
    );
    return { success: false, message: "Formato de datos inválido." };
  }

  const { feedbacks: safeFeedbacks, userID: safeUserID } = validatedData.data;

  // Enviamos la solicitud
  try {
    const res = await fetch(`${baseUrl}/api/feedbacks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbacks: safeFeedbacks, userID: safeUserID }),
    });

    if (!res.ok) {
      const data = await res.json();
      return {
        success: false,
        message: data?.error || "Error al enviar el feedback",
      };
    }

    return { success: true, message: "Feedback enviado correctamente" };
  } catch (error) {
    console.error("Error de red en submitFeedbacks:", error);
    return { success: false, message: "Error de conexión con la API." };
  }
}

// Enviamos las repeticiones
export async function submitRepetitions(
  count: number,
  userID: string,
  exercise: string,
) {
  // Validamos los parámetros
  const validatedData = SubmitRepetitionsSchema.safeParse({
    userID,
    exercise,
    count,
  });

  if (!validatedData.success) {
    console.error(
      "Datos inválidos en submitRepetitions:",
      validatedData.error.flatten(),
    );
    return { success: false, message: "Parámetros inválidos o corruptos." };
  }

  const {
    userID: safeUserID,
    exercise: safeExercise,
    count: safeCount,
  } = validatedData.data;

  // Enviamos la solicitud
  try {
    const res = await fetch(`${baseUrl}/api/repetitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        count: safeCount,
        userID: safeUserID,
        exercise: safeExercise,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return {
        success: false,
        message: data?.error || "Error al enviar las repeticiones",
      };
    }

    return { success: true, message: "Repeticiones enviadas correctamente" };
  } catch (error) {
    console.error("Error en submitRepetitions:", error);
    return { success: false, message: "Error de conexión con la API." };
  }
}
