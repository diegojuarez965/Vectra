import { NextResponse } from "next/server";
import { getRelevantExerciseContext } from "@/app/lib/exerciseKnowledge";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const ragContext = getRelevantExerciseContext(message);

    const systemInstruction = `Eres Vectra AI, un experto en fitness, entrenamiento, biomecánica y nutrición deportiva. Tu función es proporcionar recomendaciones técnicas, consejos sobre ejercicios y orientación sobre nutrición deportiva.

REGLAS DE RESPUESTA:
- Responde siempre de manera técnica, clara, motivadora y profesional.
- Puedes utilizar emojis adecuados y amigables (ej: 🏋️‍♂️, 💪, 🎯, ⚠️, 📌) para hacer las explicaciones visuales y fáciles de leer.
- Utiliza saltos de línea claros, viñetas y texto en negrita para estructurar las secciones de manera limpia.
- Si el usuario consulta sobre temas ajenos a tu área (fitness, entrenamiento o nutrición), declina la respuesta de manera educada y profesional.${ragContext}`;

    const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

    const aiResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: systemInstruction },
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
