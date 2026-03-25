import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");

    const filterDate = dateParam
      ? sql`WHERE date >= ${dateParam}::timestamp`
      : sql``;

    const countResult = await sql<{ count: number }[]>`
      SELECT COUNT(*) as count FROM users
      ${filterDate}
    `;

    const totalUsers = countResult[0].count;

    const metricsResult = await sql<{ date: string; count: number }[]>`
      SELECT DATE(date) as date, COUNT(*) as count 
      FROM users
      ${filterDate}
      GROUP BY DATE(date)
      ORDER BY date ASC
    `;

    return NextResponse.json(
      {
        total: totalUsers,
        history: metricsResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fallo al obtener métricas de usuarios:", error);
    return NextResponse.json(
      { error: "Fallo al obtener métricas de usuarios." },
      { status: 500 }
    );
  }
}
