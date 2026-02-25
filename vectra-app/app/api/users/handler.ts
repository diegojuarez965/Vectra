import { NextResponse } from "next/server";
import postgres from "postgres";
import { User } from "../../lib/definitions";
import bcrypt from "bcryptjs";
import { CreateUserSchema } from "@/app/lib/schemas";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Handler para crear un nuevo usuario
export async function handlerCreateUser(req: Request) {
  try {
    const body = await req.json();

    // VALIDACIÓN CON ZOD
    const validatedData = CreateUserSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos o incompletos",
          details: validatedData.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Extraemos los datos sanitizados y garantizados por Zod
    const { name, email, password } = validatedData.data;

    // Verificar si ya existe un usuario con ese email
    const existingUsers = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email ya registrado" },
        { status: 409 },
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta usuario
    const result = await sql<User[]>`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Fallo en la base de datos:", error);
    return NextResponse.json(
      { error: "Fallo al crear el usuario." },
      { status: 500 },
    );
  }
}
