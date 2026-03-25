import { NextRequest, NextResponse } from "next/server";
import { uploadImageToS3 } from "@/app/lib/s3";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";
import { auth, unstable_update } from "@/auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id: userId } = await params;

    // Solo un admin o el propio usuario puede actualizar su foto
    if (session.user.rol !== "admin" && session.user.id !== userId) {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No se encontró ninguna imagen" }, { status: 400 });
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
    }

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExtension = file.name.split(".").pop();
    const fileName = `avatars/${userId}-${uuidv4()}.${fileExtension}`;

    // Subir a S3
    const imageUrl = await uploadImageToS3(buffer, fileName, file.type);

    // Actualizar BD
    await sql`
      UPDATE users
      SET image_url = ${imageUrl}
      WHERE id = ${userId}
    `;

    // Forzar actualización de sesión
    await unstable_update({ user: { image: imageUrl } });

    return NextResponse.json({ success: true, image_url: imageUrl });
  } catch (error) {
    console.error("Error subiendo avatar a S3:", error);
    return NextResponse.json(
      { error: "Error interno al subir avatar" },
      { status: 500 },
    );
  }
}
