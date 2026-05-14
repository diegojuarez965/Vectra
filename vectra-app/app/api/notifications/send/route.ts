import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import admin from "firebase-admin";

// Inicializamos Firebase Admin SDK si no lo hemos hecho en esta ejecución
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(req: NextRequest) {
  try {
    const { title, body, role } = await req.json();

    if (!title || !body || !role) {
      return NextResponse.json(
        { error: "El título, el mensaje y el rol son requeridos" },
        { status: 400 },
      );
    }

    // 1. Obtener los tokens basados en el rol elegido
    let tokensQuery;

    if (role === "all") {
      // Si es para todos, simplemente traemos todos los tokens
      tokensQuery = await sql`SELECT token FROM fcm_tokens`;
    } else {
      // Si hay un filtro, cruzamos fcm_tokens con la tabla users.
      // Ya que id en users es serial (int) y user_id en fcm_tokens es string (varchar),
      // lo comparamos casteando el id de usuario a texto.
      tokensQuery = await sql`
        SELECT t.token 
        FROM fcm_tokens t
        JOIN users u ON t.user_id = u.id::text
        WHERE u.rol = ${role}
      `;
    }

    const tokens = tokensQuery.map((row) => row.token);

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: "No hay usuarios suscritos que coincidan con los criterios." },
        { status: 404 },
      );
    }

    // 2. Preparamos el mensaje para enviar con Firebase Admin
    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    // Enviamos la notificación
    const response = await admin.messaging().sendEachForMulticast(message);

    // Eliminamos los tokens inválidos
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      if (failedTokens.length > 0) {
        await sql`
          DELETE FROM fcm_tokens 
          WHERE token IN ${sql(failedTokens)}
        `;
        console.log(
          `Se eliminaron ${failedTokens.length} tokens inactivos de la base de datos.`,
        );
      }
    }

    return NextResponse.json(
      {
        message: "Proceso completado",
        successCount: response.successCount,
        failureCount: response.failureCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error enviando notificaciones push globales:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al conectar con Firebase" },
      { status: 500 },
    );
  }
}
