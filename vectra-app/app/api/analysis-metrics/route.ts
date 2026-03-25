import { NextResponse } from "next/server";
import postgres from "postgres";
import { ERROR_LABELS } from "@/app/lib/definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos métricas de análisis de la base de datos
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const exercise = searchParams.get("exercise");
  const date = searchParams.get("date");

  if (!exercise) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  // Filtro de fecha
  const dateCondition = date
    ? sql`AND date::DATE >= ${date}`
    : sql`AND date >= NOW() - INTERVAL '7 days'`;

  try {
    const [
      totalAnalysisResult,
      totalUsersAnalysisResult,
      analysisHistoryResult,
      usersAnalysisHistoryResult,
      technicalErrorsResult,
    ] = await Promise.all([
      // Consulta total de analisis
      sql`
        SELECT COUNT(*) as total_analysis
        FROM repetitions
        WHERE exercise = ${exercise}
        ${dateCondition}
      `,
      // Consulta total de usuarios distintos
      sql`
        SELECT COUNT(DISTINCT user_id) as total_users_analysis
        FROM repetitions
        WHERE exercise = ${exercise}
        ${dateCondition}
      `,
      // Historial de análisis
      sql`
        SELECT
          date::DATE as date,
          COUNT(*) as count
        FROM repetitions
        WHERE exercise = ${exercise}
        ${dateCondition}
        GROUP BY date::DATE
        ORDER BY date::DATE ASC
      `,
      // Historial de usuarios distintos
      sql`
        SELECT
          date::DATE as date,
          COUNT(DISTINCT user_id) as count
        FROM repetitions
        WHERE exercise = ${exercise}
        ${dateCondition}
        GROUP BY date::DATE
        ORDER BY date::DATE ASC
      `,
      // Errores técnicos globales para el ejercicio
      sql`
        SELECT
          error,
          COUNT(*) as count
        FROM feedbacks
        WHERE exercise = ${exercise}
        ${dateCondition}
        GROUP BY error
        ORDER BY count DESC
      `,
    ]);

    const totalAnalysis = Number(totalAnalysisResult[0]?.total_analysis) || 0;
    const totalUsersAnalysis =
      Number(totalUsersAnalysisResult[0]?.total_users_analysis) || 0;

    const analysisHistory = analysisHistoryResult.map((row) => ({
      date: new Date(row.date).toISOString(),
      count: Number(row.count),
    }));

    const usersAnalysisHistory = usersAnalysisHistoryResult.map((row) => ({
      date: new Date(row.date).toISOString(),
      count: Number(row.count),
    }));

    const technicalErrors = technicalErrorsResult.map((row) => ({
      name: ERROR_LABELS[row.error as keyof typeof ERROR_LABELS] || row.error,
      count: Number(row.count),
    }));

    return NextResponse.json({
      totalAnalysis,
      totalUsersAnalysis,
      analysisHistory,
      usersAnalysisHistory,
      technicalErrors,
    });
  } catch (error) {
    console.error("Error API analysis-metrics:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
