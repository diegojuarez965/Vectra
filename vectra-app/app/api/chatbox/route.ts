import { NextResponse } from "next/server";
import postgres from "postgres";
import { auth } from "@/auth";
import { getRelevantExerciseContext, getMatchedDbExerciseKeys } from "@/app/lib/exerciseKnowledge";
import { EXERCISE_LABELS, ERROR_LABELS } from "@/app/lib/definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    // 1. Obtener la sesión e historial del usuario
    const session = await auth();
    const userID = session?.user?.id;
    const userName = session?.user?.name || "Atleta";

    // Detectar ejercicios en el mensaje actual y en el historial reciente
    const currentMsgKeys = getMatchedDbExerciseKeys(message);
    let historyMsgKeys: string[] = [];
    if (Array.isArray(history) && history.length > 0) {
      const recentHistoryText = history.slice(-4).map((m: { content: string }) => m.content).join(" ");
      historyMsgKeys = getMatchedDbExerciseKeys(recentHistoryText);
    }

    // Unión de claves de ejercicios sin duplicados
    const matchedDbKeys = Array.from(new Set([...currentMsgKeys, ...historyMsgKeys]));

    let userContext = "";

    if (userID && matchedDbKeys.length > 0) {
      try {
        const [repetitions, feedbacks] = await Promise.all([
          sql`
            SELECT exercise, TO_CHAR(date, 'YYYY-MM-DD') as date_str, SUM(count) as reps_count
            FROM repetitions
            WHERE user_id = ${userID} AND exercise = ANY(${matchedDbKeys})
            GROUP BY exercise, date_str
            ORDER BY date_str DESC
          `,
          sql`
            SELECT exercise, error, TO_CHAR(date, 'YYYY-MM-DD') as date_str, COUNT(*) as error_count
            FROM feedbacks
            WHERE user_id = ${userID} AND exercise = ANY(${matchedDbKeys})
            GROUP BY exercise, error, date_str
            ORDER BY date_str DESC
          `
        ]);

        userContext = `Información de progreso del usuario actual (Nombre: ${userName}):\n`;

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

        const dates = Object.keys(historyMap).sort((a, b) => b.localeCompare(a));

        if (dates.length === 0) {
          userContext += "- No hay registros de entrenamientos o ejercicios en ningún día todavía.\n";
        } else {
          dates.forEach((date) => {
            const dayInfo = historyMap[date];
            const [year, month, day] = date.split("-").map(Number);
            const dateObj = new Date(year, month - 1, day);
            const humanDate = dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

            userContext += `- **Día ${humanDate} (${date})**:\n`;

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
                const sortedErrs = Object.entries(errs).sort((a, b) => b[1] - a[1]);

                const errList = sortedErrs
                  .map(([errKey, count]) => {
                    const errorName = ERROR_LABELS[errKey as keyof typeof ERROR_LABELS] || errKey;
                    return `"${errorName}" (${count} veces)`;
                  })
                  .join(", ");
                userContext += ` Errores técnicos detectados (ordenados de mayor a menor frecuencia): ${errList}.\n`;
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
    }

    // 2. Obtener contexto de RAG combinando el mensaje actual y el historial reciente
    const combinedTextForRag = [
      message,
      ...(Array.isArray(history) ? history.slice(-4).map((m: { content: string }) => m.content) : [])
    ].join(" ");
    const ragContext = getRelevantExerciseContext(combinedTextForRag);

    // 3. Construir la instrucción del sistema
    const systemInstruction = `Eres Vectra AI, un experto en fitness, entrenamiento, biomecánica y nutrición deportiva. Tu función es proporcionar recomendaciones técnicas sobre ejercicios, biomecánica y nutrición deportiva.

REGLAS DE RESPUESTA:
- Responde siempre de manera técnica, clara, motivadora y profesional.
- Puedes utilizar emojis adecuados y amigables (ej: 🏋️‍♂️, 💪, 🎯, ⚠️, 📌) para hacer las explicaciones visuales y fáciles de leer.
- Utiliza saltos de línea claros, viñetas y texto en negrita para estructurar las secciones de manera limpia.
- Si el usuario consulta sobre temas ajenos a tu área (fitness, entrenamiento o nutrición), declina la respuesta de manera motivadora pero profesional.

${userContext}
${ragContext}`;

    const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
    const OLLAMA_MODEL_COLAB = process.env.OLLAMA_MODEL_COLAB;

    if (!OLLAMA_BASE_URL) {
      throw new Error("OLLAMA_BASE_URL no está configurada en las variables de entorno.");
    }

    // Formatear el historial previo de conversación enviado por la interfaz
    const formattedHistory = Array.isArray(history)
      ? history
        .filter((msg: { role: string; content: string }) => msg.content && !msg.content.startsWith("¡Hola! 🏋️‍♂️"))
        .slice(-4) // Mantener las últimas 4 interacciones para un contexto fluido y ligero
        .map((msg: { role: string; content: string }) => ({
          role: msg.role === "bot" || msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        }))
      : [];

    console.log("systemInstruction¸\n", systemInstruction);
    console.log("formattedHistory\n", formattedHistory);

    const aiResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL_COLAB,
        messages: [
          { role: "system", content: systemInstruction },
          ...formattedHistory,
          { role: "user", content: message },
        ],
        options: {
          temperature: 0.3,
        },
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Error en respuesta de Ollama/Colab:", errorText);
      throw new Error(`Error en Ollama API (${aiResponse.status}): ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const data = aiData.message?.content || "";
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en API Chatbox:", error);
    return NextResponse.json(
      { error: "Error al procesar el mensaje del chatbot" },
      { status: 500 }
    );
  }
}

