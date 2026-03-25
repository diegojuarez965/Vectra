import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos el valor actual del tiempo máximo de análisis
export async function GET() {
  try {
    const result =
      await sql`SELECT value FROM system_settings WHERE key = 'max_time_analysis'`;

    // Si no hay configuración previa, por defecto es 2 minutos
    const data = result[0] || { value: "2" };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error API GET max_time_analysis:", error);
    return NextResponse.json(
      { error: "Error interno de base de datos" },
      { status: 500 },
    );
  }
}

// Actualizamos el tiempo máximo de análisis
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { value } = body;

    // Validamos que el valor sea un número y que sea 1, 2 o 3
    if (
      typeof value !== "number" ||
      (value !== 1 && value !== 2 && value !== 3)
    ) {
      return NextResponse.json(
        { error: "El valor debe ser 1, 2 o 3" },
        { status: 400 },
      );
    }

    const stringValue = value.toString();

    await sql`
      INSERT INTO system_settings (key, value)
      VALUES ('max_time_analysis', ${stringValue})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${stringValue}, updated_at = NOW()
    `;
    console.log("Tiempo máximo de análisis actualizado a:", stringValue);
    return NextResponse.json({
      message: "Tiempo máximo de análisis actualizado",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
