import { NextResponse } from "next/server";
import { getRelevantExerciseContext } from "@/app/lib/exerciseKnowledge";

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    const combinedTextForRag = [
      message,
      ...(Array.isArray(history) ? history.slice(-4).map((m: { content: string }) => m.content) : [])
    ].join(" ");
    const ragContext = getRelevantExerciseContext(combinedTextForRag);

    const systemInstruction = `Eres Vectra AI, un experto en fitness, entrenamiento, biomecánica y nutrición deportiva. Tu función es proporcionar recomendaciones técnicas, consejos sobre ejercicios y orientación sobre nutrición deportiva.

REGLAS DE RESPUESTA:
- Responde siempre de manera técnica, clara, motivadora y profesional.
- Puedes utilizar emojis adecuados y amigables (ej: 🏋️‍♂️, 💪, 🎯, ⚠️, 📌) para hacer las explicaciones visuales y fáciles de leer.
- Utiliza saltos de línea claros, viñetas y texto en negrita para estructurar las secciones de manera limpia.
- Si el usuario consulta sobre temas ajenos a tu área (fitness, entrenamiento o nutrición), declina la respuesta de manera educada y profesional.${ragContext}`;

    const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
    const OLLAMA_MODEL_LOCAL = process.env.OLLAMA_MODEL_LOCAL;

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
        model: OLLAMA_MODEL_LOCAL,
        messages: [
          { role: "system", content: systemInstruction },
          ...formattedHistory,
          { role: "user", content: message },
        ],
        options: {
          temperature: 0.2,
        },
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Error en respuesta de Ollama:", errorText);
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
