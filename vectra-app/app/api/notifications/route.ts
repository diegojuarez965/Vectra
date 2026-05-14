import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(req: NextRequest) {
  try {
    const { token, userID } = await req.json();

    if (!token || !userID) {
      return NextResponse.json(
        { error: "El token y el ID de usuario son requeridos" },
        { status: 400 },
      );
    }

    // Insertamos el token en la base de datos
    // Si el token ya existe actualizamos a quién le pertenece. Ej: si cambia de cuenta en el mismo dispositivo
    await sql`
      INSERT INTO fcm_tokens (user_id, token)
      VALUES (${userID}, ${token})
      ON CONFLICT (token) DO UPDATE 
      SET user_id = EXCLUDED.user_id,
          created_at = NOW()
    `;

    return NextResponse.json(
      { message: "Token registrado exitosamente" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error guardando el token FCM:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { token, userID } = await req.json();

    if (!token || !userID) {
      return NextResponse.json(
        { error: "El token y el ID de usuario son requeridos" },
        { status: 400 },
      );
    }

    // Eliminamos el token de la base de datos
    await sql`
      DELETE FROM fcm_tokens 
      WHERE token = ${token} AND user_id = ${userID}
    `;

    return NextResponse.json(
      { message: "Token eliminado exitosamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error eliminando el token FCM:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
