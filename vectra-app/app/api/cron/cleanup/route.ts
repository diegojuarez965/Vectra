import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(req: Request) {
  // 1. Verificar Seguridad del Cron (CRON_SECRET)
  // Vercel envía el header 'Authorization: Bearer <CRON_SECRET>'
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid CRON_SECRET." },
      { status: 401 },
    );
  }

  try {
    // 2. Obtener Retention Days
    const resultSettings = await sql`
      SELECT value 
      FROM system_settings 
      WHERE key = 'retention_days'
    `;
    const retentionDays = parseInt(resultSettings[0]?.value || "30");

    // 3. Ejecutar Borrado Masivo Directamente
    // Restamos el intervalo correspondiente y borramos
    const deleteFeedbacks = sql`
      DELETE FROM feedbacks 
      WHERE date::DATE < NOW() - ${retentionDays + " days"}::INTERVAL
      RETURNING id
    `;

    const deleteRepetitions = sql`
      DELETE FROM repetitions 
      WHERE date::DATE < NOW() - ${retentionDays + " days"}::INTERVAL
      RETURNING id
    `;

    // Ejecutamos ambas consultas en paralelo y contamos las eliminadas
    const [deletedFeedbacksResult, deletedRepsResult] = await Promise.all([
      deleteFeedbacks,
      deleteRepetitions,
    ]);

    const deletedFeedbacksCount = deletedFeedbacksResult.length;
    const deletedRepsCount = deletedRepsResult.length;

    // Actualizamos el registro de última limpieza
    await sql`
      INSERT INTO system_settings (key, value)
      VALUES ('last_cleanup', NOW()::text)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `;

    console.log(
      `Cron ejecutado: ${deletedFeedbacksCount} feedbacks y ${deletedRepsCount} rutinas borradas (>${retentionDays} días viejas).`,
    );

    // 4. Reportar
    return NextResponse.json({
      success: true,
      message: `Limpieza completada exitosamente. Límite de retención: ${retentionDays} días.`,
      deleted_records: {
        feedbacks: deletedFeedbacksCount,
        repetitions: deletedRepsCount,
      },
    });
  } catch (error) {
    console.error("Error en cron cleanup:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
