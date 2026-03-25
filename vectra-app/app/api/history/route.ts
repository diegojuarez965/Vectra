import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const exercise = searchParams.get("exercise");
  const date = searchParams.get("date");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 3;

  if (!user_id || !exercise) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  const offset = (page - 1) * limit;

  // Condición de fecha
  const dateCondition = date
    ? sql`AND date::DATE >= ${date}`
    : sql`AND date >= NOW() - INTERVAL '7 days'`;

  try {
    // Obtenemos el total de días únicos para calcular las páginas
    const totalDaysResult = await sql`
      SELECT COUNT(DISTINCT date::DATE) as total
      FROM (
        SELECT date FROM repetitions WHERE user_id = ${user_id} AND exercise = ${exercise} ${dateCondition}
        UNION
        SELECT date FROM feedbacks WHERE user_id = ${user_id} AND exercise = ${exercise} ${dateCondition}
      ) as combined_dates
    `;

    const totalItems = Number(totalDaysResult[0]?.total || 0);
    const totalPages = Math.ceil(totalItems / limit);

    // Obtenemos los datos paginados y fusionados usando SQL
    const paginatedData = await sql`
      WITH PaginatedDates AS (
        -- A. Sacamos solo las fechas únicas de la página actual
        SELECT DISTINCT date::DATE as session_date
        FROM (
          SELECT date FROM repetitions WHERE user_id = ${user_id} AND exercise = ${exercise} ${dateCondition}
          UNION
          SELECT date FROM feedbacks WHERE user_id = ${user_id} AND exercise = ${exercise} ${dateCondition}
        ) all_dates
        ORDER BY session_date DESC
        LIMIT ${limit} OFFSET ${offset}
      ),
      DailyReps AS (
        -- B. Sumamos las repeticiones por día
        SELECT date::DATE as session_date, SUM(count) as reps_count
        FROM repetitions
        WHERE user_id = ${user_id} AND exercise = ${exercise}
        GROUP BY date::DATE
      ),
      DailyFeedbacks AS (
        -- C. Contamos los errores agrupados por día y tipo
        SELECT date::DATE as session_date, error, COUNT(*) as error_count
        FROM feedbacks
        WHERE user_id = ${user_id} AND exercise = ${exercise}
        GROUP BY date::DATE, error
      ),
      AggregatedFeedbacks AS (
        -- D. Convertimos los errores en un array JSON por cada día
        SELECT session_date, json_agg(json_build_object('error', error, 'count', error_count)) as errors
        FROM DailyFeedbacks
        GROUP BY session_date
      )
      -- E. Unimos todo basándonos en las fechas paginadas
      SELECT
        TO_CHAR(pd.session_date, 'YYYY-MM-DD') as date_str,
        COALESCE(dr.reps_count, 0) as repetitions,
        COALESCE(af.errors, '[]'::json) as feedbacks
      FROM PaginatedDates pd
      LEFT JOIN DailyReps dr ON pd.session_date = dr.session_date
      LEFT JOIN AggregatedFeedbacks af ON pd.session_date = af.session_date
      ORDER BY pd.session_date DESC;
    `;

    // Formateamos la respuesta para el cliente
    const sessions = paginatedData.map((row) => ({
      date: row.date_str,
      exercise: exercise,
      repetitions: Number(row.repetitions),
      feedbacks: row.feedbacks,
    }));

    return NextResponse.json({
      data: sessions,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    });
  } catch (error) {
    console.error("Error API Historial Paginado:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
