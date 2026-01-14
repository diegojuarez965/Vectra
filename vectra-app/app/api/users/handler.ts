import { NextResponse } from "next/server";
import postgres from "postgres";
import { User } from "../../lib/definitions";
import bcrypt from "bcryptjs";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function handlerCreateUser(req: Request) {
  try {
    const body = await req.json();
    const { nombre, email, password } = body;

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un usuario con ese email
    const existingUsers = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email ya registrado" },
        { status: 409 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    // Inserta usuario
    const result = await sql<User[]>`
      INSERT INTO users (name, email, password)
      VALUES (${nombre}, ${email}, ${hashedPassword})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}
