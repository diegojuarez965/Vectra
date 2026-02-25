import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { ResetPasswordSchema } from "@/app/lib/schemas";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Reseteamos la contraseña
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validamos los parámetros
    const validatedFields = ResetPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorMessage =
        Object.values(fieldErrors).flat()[0] || "Datos inválidos.";

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { token, password } = validatedFields.data;

    // Buscamos si el token existe Y si todavía es válido (expires_at > NOW())
    const result = await sql`
      SELECT email FROM password_reset_tokens
      WHERE token = ${token} AND expires_at > NOW()
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "El enlace es inválido o ha expirado." },
        { status: 400 },
      );
    }

    const resetEntry = result[0];

    // Actualizamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE email = ${resetEntry.email}
    `;

    // Borramos el token para que no pueda volver a usarse
    await sql`
      DELETE FROM password_reset_tokens WHERE token = ${token}
    `;

    return NextResponse.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error API reset-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
