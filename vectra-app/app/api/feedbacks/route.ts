import { NextResponse } from "next/server";
import postgres from "postgres";
import { ExerciseFeedback } from "@/app/utils/ExerciseAnalyzer";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(req: Request) {
  try {
    const { userID, feedbacks } = await req.json();

    // Validaciones
    if (!userID || !feedbacks || !Array.isArray(feedbacks)) {
      return NextResponse.json(
        { error: "Parámetros inválidos." },
        { status: 400 },
      );
    }

    // Si el array está vacío, no hacemos nada
    if (feedbacks.length === 0) {
      return NextResponse.json({ message: "No hay feedbacks para guardar" });
    }

    // Formatear los datos para la DB
    const rowsToInsert = feedbacks.map((feedback: ExerciseFeedback) => ({
      user_id: userID,
      exercise: feedback.exercise,
      error: feedback.error,
      date: new Date(),
    }));

    // Insertar en la base de datos
    await sql`
      INSERT INTO feedbacks ${sql(
        rowsToInsert,
        "user_id",
        "exercise",
        "error",
        "date",
      )}
    `;

    return NextResponse.json({ message: "Feedbacks guardados correctamente" });
  } catch (error) {
    console.error("Error en submitFeedbacks:", error);
    return NextResponse.json(
      { error: "Error al guardar en base de datos", details: String(error) },
      { status: 500 },
    );
  }
}
