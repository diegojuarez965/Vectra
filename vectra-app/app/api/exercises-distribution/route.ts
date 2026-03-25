import { NextResponse } from "next/server";
import postgres from "postgres";
import { EXERCISE_LABELS } from "@/app/lib/definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos distribución global de ejercicios
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  // Filtro de fecha
  const dateCondition = date
    ? sql`date::DATE >= ${date}`
    : sql`date >= NOW() - INTERVAL '7 days'`;

  try {
    const exercisesDistributionResult = await sql`
      SELECT
        exercise,
        COUNT(*) as count
      FROM repetitions
      WHERE
      ${dateCondition}
      GROUP BY exercise
    `;

    const exercisesDistribution = exercisesDistributionResult.map((row) => ({
      name:
        EXERCISE_LABELS[row.exercise as keyof typeof EXERCISE_LABELS] ||
        row.exercise,
      value: Number(row.count),
    }));

    return NextResponse.json(exercisesDistribution);
  } catch (error) {
    console.error("Error API exercises-distribution:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
