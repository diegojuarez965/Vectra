import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos el volumen de datos global
export async function GET() {
  try {
    const [feedbacksResult, repetitionsResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM feedbacks`,
      sql`SELECT COUNT(*) as count FROM repetitions`,
    ]);

    const feedbacksVolume = Number(feedbacksResult[0]?.count) || 0;
    const repetitionsVolume = Number(repetitionsResult[0]?.count) || 0;
    const totalVolume = feedbacksVolume + repetitionsVolume;

    return NextResponse.json({
      totalVolume,
      feedbacksVolume,
      repetitionsVolume,
    });
  } catch (error) {
    console.error("Error API data-volume:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
