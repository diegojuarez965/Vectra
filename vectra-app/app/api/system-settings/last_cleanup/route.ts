import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos la última vez que se ejecutó el cron
export async function GET() {
  try {
    const result = await sql`
      SELECT value FROM system_settings WHERE key = 'last_cleanup'
    `;

    if (result.length === 0) {
      return NextResponse.json({ value: null });
    }

    return NextResponse.json({ value: result[0].value });
  } catch (error) {
    console.error("Error API last_cleanup GET:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
