import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos los últimos 5 usuarios que se registraron
export async function GET() {
  try {
    const latestUsers = await sql`
      SELECT id, name, email, date
      FROM users
      ORDER BY date DESC NULLS LAST
      LIMIT 5
    `;

    return NextResponse.json(latestUsers);
  } catch (error) {
    console.error("Error API latest-users:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
