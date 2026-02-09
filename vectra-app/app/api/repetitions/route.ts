import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Insertamos las repeticiones en la base de datos
export async function POST(req: Request) {
  try {
    const { userID, exercise, count } = await req.json();

    if (!userID || !exercise || !count) {
      return NextResponse.json(
        {
          error: "Parámetros inválidos. Se requiere userID, exercise y count.",
        },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO repetitions (user_id, exercise, count)
      VALUES (${userID}, ${exercise}, ${count});
    `;

    return NextResponse.json({
      message: "Repeticiones enviadas correctamente",
    });
  } catch (error) {
    console.error("Error en submitRepetitions:", error);
    return NextResponse.json(
      { error: "Error de conexión con la API." },
      { status: 500 },
    );
  }
}
