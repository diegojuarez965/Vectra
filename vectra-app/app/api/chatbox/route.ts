import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const systemInstruction = `Eres Vectra AI, un experto en fitness, entrenamiento, biomecánica y nutrición deportiva. Tu función es proporcionar recomendaciones técnicas, consejos sobre ejercicios y orientación sobre nutrición deportiva.

REGLAS DE RESPUESTA:
- Responde siempre de manera técnica, profesional y estructurada.
- Está estrictamente prohibido el uso de emojis en tus respuestas.
- Si el usuario consulta sobre temas ajenos a tu área (fitness, entrenamiento o nutrición), declina la respuesta de manera educada y profesional, manteniendo siempre un formato de texto limpio.`;

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
