import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Obtenemos el modo sin registro actual
export async function GET() {
  try {
    const result =
      await sql`SELECT value FROM system_settings WHERE key = 'no_register_mode'`;

    const data = result[0] || { value: "false" };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Error de base de datos" },
      { status: 500 },
    );
  }
}

// Actualizamos el modo sin registro
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { value } = body;

    // Validamos que el valor sea un booleano
    if (typeof value !== "boolean") {
      return NextResponse.json(
        { error: "El valor debe ser booleano" },
        { status: 400 },
      );
    }

    const stringValue = value ? "true" : "false";

    await sql`
      INSERT INTO system_settings (key, value)
      VALUES ('no_register_mode', ${stringValue})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${stringValue}, updated_at = NOW()
    `;
    return NextResponse.json({ message: "Modo sin registro actualizado" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
