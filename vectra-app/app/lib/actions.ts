"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { unstable_noStore as noStore } from "next/cache";
import { revalidatePath } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Validación de registro de usuario
const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Por favor ingrese un nombre"),
  email: z.string().email("Por favor ingrese un correo electrónico válido"),
  password: z
    .string()
    .min(6, "Por favor ingrese una contraseña de al menos 6 caracteres"),
  rol: z.enum(["admin", "user"]),
});

const CreateUser = UserSchema.omit({ id: true, rol: true });

export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
};

// Registro de usuario
export async function registerUser(
  prevState: UserState,
  formData: FormData,
): Promise<UserState> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  // Validamos los campos usando zod
  const validatedFields = CreateUser.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password,
  });

  if (!validatedFields.success) {
    return {
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
      },
      message: "Faltan campos o hay errores de validación.",
    };
  }

  if (password !== confirmPassword) {
    return {
      errors: {
        confirmPassword: ["Las contraseñas no coinciden"],
      },
      message: "Faltan campos o hay errores de validación.",
    };
  }

  const { name, email } = validatedFields.data;

  try {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
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

// Actualizar modo mantenimiento
export async function updateMaintenanceMode(formData: FormData) {
  const rawValue = formData.get("maintenance_mode") as string;

  const booleanValue = rawValue === "on";

  try {
    const res = await fetch(`${baseUrl}/api/system-settings/maintenance_mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: booleanValue }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { message: data?.error || "Error al actualizar." };
    }

    revalidatePath("/", "layout");

    return { message: "Configuración guardada exitosamente." };
  } catch (error) {
    console.error("Error en updateMaintenanceMode:", error);
    return { message: "Error de conexión con la API." };
  }
}

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

// Actualizar modo no registro
export async function updateNoRegisterMode(formData: FormData) {
  const rawValue = formData.get("no_register_mode") as string;

  const booleanValue = rawValue === "on";

  try {
    const res = await fetch(`${baseUrl}/api/system-settings/no_register_mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: booleanValue }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { message: data?.error || "Error al actualizar." };
    }

    revalidatePath("/register", "layout");

    return { message: "Configuración guardada exitosamente." };
  } catch (error) {
    console.error("Error en updateNoRegisterMode:", error);
    return { message: "Error de conexión con la API." };
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

// Actualizar umbral de confianza
export async function updateConfidenceThreshold(formData: FormData) {
  const rawValue = formData.get("confidence_threshold") as string;
  const numericValue = parseFloat(rawValue);
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
      return { message: data?.error || "Error al actualizar." };
    }

    revalidatePath("/", "layout");

    return { message: "Umbral de confianza guardado exitosamente." };
  } catch (error) {
    console.error("Error en updateConfidenceThreshold:", error);
    return { message: "Error de conexión con la API." };
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

// Actualizar factor de suavizado
export async function updateSmoothingFactor(formData: FormData) {
  const value = formData.get("smoothing_factor") as string;
  const numericValue = parseFloat(value);
  try {
    const res = await fetch(`${baseUrl}/api/system-settings/smoothing_factor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: numericValue }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { message: data?.error || "Error al actualizar." };
    }

    revalidatePath("/", "layout");

    return { message: "Factor de suavizado guardado exitosamente." };
  } catch (error) {
    console.error("Error en updateSmoothingFactor:", error);
    return { message: "Error de conexión con la API." };
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
