import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos el valor actual de los días de retención del historial
export async function GET() {
  try {
    const result =
      await sql`SELECT value FROM system_settings WHERE key = 'retention_days'`;

    // Si no hay configuración previa, por defecto es 30 días
    const data = result[0] || { value: "30" };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error API GET retention_days:", error);
    return NextResponse.json(
      { error: "Error interno de base de datos" },
      { status: 500 },
    );
  }
}

// Actualizamos los días de retención del historial
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { value } = body;

    // Validamos que el valor sea un número y que sea 30, 60 o 90
    if (
      typeof value !== "number" ||
      (value !== 30 && value !== 60 && value !== 90)
    ) {
      return NextResponse.json(
        { error: "El valor debe ser 30, 60 o 90" },
        { status: 400 },
      );
    }

    const stringValue = value.toString();

    await sql`
      INSERT INTO system_settings (key, value)
      VALUES ('retention_days', ${stringValue})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${stringValue}, updated_at = NOW()
    `;
    console.log("Días de retención actualizados a:", stringValue);
    return NextResponse.json({ message: "Días de retención actualizados" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
