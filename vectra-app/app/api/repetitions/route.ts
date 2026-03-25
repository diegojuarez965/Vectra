import { NextResponse } from "next/server";
import postgres from "postgres";
import { SubmitRepetitionsSchema } from "@/app/lib/schemas";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos repeticiones de la base de datos
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
    const [totalResult, historyResult] = await Promise.all([
      // Consulta total de repeticiones
      sql`
        SELECT SUM(count) as total
        FROM repetitions
        WHERE user_id = ${user_id} 
        AND exercise = ${exercise}
        ${dateCondition}
      `,
      // Agrupamos las repeticiones por fecha
      sql`
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD') as date_str, 
          SUM(count) as daily_total
        FROM repetitions
        WHERE user_id = ${user_id} 
        AND exercise = ${exercise}
        ${dateCondition}
        GROUP BY date_str
        ORDER BY date_str ASC
      `,
    ]);

    const total = Number(totalResult[0]?.total) || 0;

    // Procesamiento
    const history = historyResult.reduce(
      (acc, row) => {
        acc[row.date_str] = {
          count: Number(row.daily_total),
          date: row.date_str,
        };
        return acc;
      },
      {} as Record<string, { count: number; date: string }>,
    );

    return NextResponse.json({ total, history });
  } catch (error) {
    console.error("Error API Repetitions:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Insertamos las repeticiones en la base de datos
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validamos los parámetros
    const validatedData = SubmitRepetitionsSchema.safeParse(body);

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

    const { userID, exercise, count } = validatedData.data;

    // Insertamos las repeticiones en la base de datos
    await sql`
      INSERT INTO repetitions (user_id, exercise, count)
      VALUES (${userID}, ${exercise}, ${count});
    `;

    return NextResponse.json({
      message: "Repeticiones enviadas correctamente",
    });
  } catch (error) {
    console.error("Error insertando repeticiones:", error);
    return NextResponse.json(
      { error: "Error de base de datos" },
      { status: 500 },
    );
  }
}
