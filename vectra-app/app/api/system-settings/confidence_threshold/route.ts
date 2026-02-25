import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos el umbral de confianza actual
export async function GET() {
  try {
    const result =
      await sql`SELECT value FROM system_settings WHERE key = 'confidence_threshold'`;

    // Si no hay configuración previa, por defecto es 0.5
    const data = result[0] || { value: "0.5" };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error API GET confidence_threshold:", error);
    return NextResponse.json(
      { error: "Error interno de base de datos" },
      { status: 500 },
    );
  }
}

// Actualizamos el umbral de confianza
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { value } = body;
    // Validamos que el valor sea un número entre 0 y 1
    if (typeof value !== "number" || value < 0 || value > 1) {
      return NextResponse.json(
        { error: "El valor debe estar entre 0 y 1" },
        { status: 400 },
      );
    }

    const stringValue = value.toString();

    await sql`
      INSERT INTO system_settings (key, value)
      VALUES ('confidence_threshold', ${stringValue})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${stringValue}, updated_at = NOW()
    `;
    console.log("Umbral de confianza actualizado a:", stringValue);
    return NextResponse.json({ message: "Umbral de confianza actualizado" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
