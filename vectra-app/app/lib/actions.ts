'use server'

import { z } from "zod";
import { redirect } from "next/navigation";
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

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
  formData: FormData
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
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciales inválidas.';
                default:
                    return 'Algo salió mal.';
            }
        }
        throw error;
    }
}