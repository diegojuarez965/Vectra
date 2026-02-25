import { NextResponse } from "next/server";
import postgres from "postgres";
import { SubmitFeedbacksSchema } from "@/app/lib/schemas";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos el historial de feedbacks
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const exercise = searchParams.get("exercise");
  const date = searchParams.get("date");

  if (!user_id || !exercise) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  // Filtro de fecha
  const dateCondition = date
    ? sql`AND date::DATE >= ${date}`
    : sql`AND date >= NOW() - INTERVAL '7 days'`;

  try {
    const [totalResult, dateGroupResult, errorGroupResult] = await Promise.all([
      // Consulta total de feedbacks
      sql`
        SELECT COUNT(*) as total FROM feedbacks
        WHERE user_id = ${user_id} AND exercise = ${exercise} ${dateCondition}
      `,
      // Agrupamos los feedbacks por fecha
      sql`
        SELECT TO_CHAR(date, 'YYYY-MM-DD') as date_str, COUNT(*) as count
        FROM feedbacks
        WHERE user_id = ${user_id} AND exercise = ${exercise} ${dateCondition}
        GROUP BY date_str
        ORDER BY date_str ASC
      `,
      // Agrupamos los feedbacks por error
      sql`
        SELECT error, COUNT(*) as count
        FROM feedbacks
        WHERE user_id = ${user_id} AND exercise = ${exercise} ${dateCondition}
        GROUP BY error
      `,
    ]);

    // Procesamiento
    const total = Number(totalResult[0]?.total) || 0;

    const historyDate = dateGroupResult.reduce(
      (acc, row) => {
        acc[row.date_str] = { count: Number(row.count), date: row.date_str };
        return acc;
      },
      {} as Record<string, { count: number; date: string }>,
    );

    const historyError = errorGroupResult.reduce(
      (acc, row) => {
        const key = row.error || "UNKNOWN";
        acc[key] = { count: Number(row.count), error: key };
        return acc;
      },
      {} as Record<string, { count: number; error: string }>,
    );

    return NextResponse.json({
      total,
      historyDate,
      historyError,
    });
  } catch (error) {
    console.error("Error API Feedbacks:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Insertamos los feedbacks en la base de datos
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validamos los parámetros
    const validatedData = SubmitFeedbacksSchema.safeParse(body);

    if (!validatedData.success) {
      const fieldErrors = validatedData.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0];
      return NextResponse.json(
        {
          error: firstError,
        },
        { status: 400 },
      );
    }

    const { userID, feedbacks } = validatedData.data;

    // Si el array está vacío, no hacemos nada
    if (feedbacks.length === 0) {
      return NextResponse.json({ message: "No hay feedbacks para guardar" });
    }

    // Formateamos los datos para la DB
    const rowsToInsert = feedbacks.map((feedback) => ({
      user_id: userID,
      exercise: feedback.exercise,
      error: feedback.error,
      date: new Date(),
    }));

    // Insertamos los feedbacks en la base de datos
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
    console.error("Error en submitFeedbacks API:", error);
    return NextResponse.json(
      { error: "Error al guardar en base de datos" },
      { status: 500 },
    );
  }
}
