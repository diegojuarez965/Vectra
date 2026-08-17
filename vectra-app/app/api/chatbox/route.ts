import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import postgres from "postgres";
import { auth } from "@/auth";
import { EXERCISE_LABELS, ERROR_LABELS } from "@/app/lib/definitions";

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Obtener la sesión del usuario
    const session = await auth();
    const userID = session?.user?.id;
    const userName = session?.user?.name || "Atleta";

    let userContext = "";

    if (userID) {
      try {
        // 1. Obtener repeticiones del usuario agrupadas por ejercicio y fecha (día)
        const repetitions = await sql`
          SELECT exercise, TO_CHAR(date, 'YYYY-MM-DD') as date_str, SUM(count) as reps_count
          FROM repetitions
          WHERE user_id = ${userID}
          GROUP BY exercise, date_str
          ORDER BY date_str DESC
        `;

        // 2. Obtener feedbacks (errores) del usuario agrupados por ejercicio, error y fecha (día)
        const feedbacks = await sql`
          SELECT exercise, error, TO_CHAR(date, 'YYYY-MM-DD') as date_str, COUNT(*) as error_count
          FROM feedbacks
          WHERE user_id = ${userID}
          GROUP BY exercise, error, date_str
          ORDER BY date_str DESC
        `;

        // Agrupación estructurada por día
        type DayData = {
          reps: { [exercise: string]: number };
          errors: { [exercise: string]: { [error: string]: number } };
        };
        const historyMap: { [date: string]: DayData } = {};

        repetitions.forEach((r) => {
          const date = r.date_str;
          if (!historyMap[date]) {
            historyMap[date] = { reps: {}, errors: {} };
          }
          historyMap[date].reps[r.exercise] = Number(r.reps_count);
        });

        feedbacks.forEach((f) => {
          const date = f.date_str;
          if (!historyMap[date]) {
            historyMap[date] = { reps: {}, errors: {} };
          }
          if (!historyMap[date].errors[f.exercise]) {
            historyMap[date].errors[f.exercise] = {};
          }
          historyMap[date].errors[f.exercise][f.error] = Number(f.error_count);
        });

        userContext = `Información de progreso del usuario actual (Nombre: ${userName}):\n`;
        const dates = Object.keys(historyMap).sort((a, b) => b.localeCompare(a));

        if (dates.length === 0) {
          userContext += "- No hay registros de entrenamientos o ejercicios en ningún día todavía.\n";
        } else {
          userContext += "Historial de actividades y rendimiento día a día:\n";
          dates.forEach((date) => {
            const dayInfo = historyMap[date];
            userContext += `- **Día ${date}**:\n`;

            // Obtener todos los ejercicios registrados para este día
            const exercises = new Set([
              ...Object.keys(dayInfo.reps),
              ...Object.keys(dayInfo.errors),
            ]);

            exercises.forEach((ex) => {
              const exerciseName = EXERCISE_LABELS[ex as keyof typeof EXERCISE_LABELS] || ex;
              const repCount = dayInfo.reps[ex] || 0;
              userContext += `  * ${exerciseName}: ${repCount} repeticiones.`;

              const errs = dayInfo.errors[ex];
              if (errs && Object.keys(errs).length > 0) {
                const errList = Object.entries(errs)
                  .map(([errKey, count]) => {
                    const errorName = ERROR_LABELS[errKey as keyof typeof ERROR_LABELS] || errKey;
                    return `"${errorName}" (${count} veces)`;
                  })
                  .join(", ");
                userContext += ` Errores técnicos detectados: ${errList}.\n`;
              } else {
                userContext += ` Errores técnicos detectados: Ninguno.\n`;
              }
            });
          });
        }
      } catch (dbError) {
        console.error("Error al consultar base de datos en chatbox route:", dbError);
        userContext = "Error temporal al recuperar los datos del historial de rendimiento del usuario.";
      }
    } else {
      userContext = "El usuario actual no ha iniciado sesión o no tiene datos registrados.";
    }

    const systemInstruction = `Eres un experto en fitness, entrenamiento, nutrición y musculación. Tu función es proporcionar recomendaciones técnicas sobre ejercicios, biomecánica y nutrición deportiva. Está estrictamente prohibido el uso de emojis en tus respuestas. Si el usuario consulta sobre temas ajenos a tu área, declina la respuesta de manera motivadora pero profesional, manteniendo siempre un formato de texto limpio y sin caracteres pictográficos.

A continuación se presenta información sobre el progreso y rendimiento del usuario actual. Utilízala de manera natural para responder sus preguntas (por ejemplo, si te pregunta cómo va, dale feedback basado en sus repeticiones y errores):

${userContext}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const data = response.text;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en API Chatbox:", error);
    return NextResponse.json(
      { error: "Error al procesar el mensaje del chatbot" },
      { status: 500 }
    );
  }
}
