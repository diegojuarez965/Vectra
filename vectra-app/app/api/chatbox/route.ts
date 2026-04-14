import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

export async function POST(request: Request) {
  const { message } = await request.json();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      systemInstruction:
        "Eres un experto en fitness, entrenamiento, nutrición y musculación. Tu función es proporcionar recomendaciones técnicas sobre ejercicios, biomecánica y nutrición deportiva. Está estrictamente prohibido el uso de emojis en tus respuestas. Si el usuario consulta sobre temas ajenos a tu área, declina la respuesta de manera motivadora pero profesional, manteniendo siempre un formato de texto limpio y sin caracteres pictográficos.",
    },
  });
  const data = response.text;
  return NextResponse.json(data);
}
