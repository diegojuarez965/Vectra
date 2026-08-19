import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { User } from "@/app/lib/definitions";
import { auth, unstable_update } from "@/auth";
import { EditProfileSchema } from "@/app/lib/schemas";
import { uploadImageToStorage, deleteImageFromStorage } from "@/app/lib/storage";
import { v4 as uuidv4 } from "uuid";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Actualizar información de perfil propia
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    // Verificar que el usuario esté autenticado
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const file = formData.get("image") as File | null;

    // Verificar que el usuario no intente actualizar a otra persona
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 },
      );
    }

    // VALIDACIÓN CON ZOD
    const validatedData = EditProfileSchema.safeParse({ id, name, email });

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos o incompletos",
          details: validatedData.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Verificar si ya existe un usuario con ese email (excluyendo el actual)
    const existingUsers = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email} AND id != ${id}
    `;
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "El email ya está registrado a otro usuario" },
        { status: 409 },
      );
    }

    let imageUrl = session.user.image;

    // Procesar la imagen si fue suministrada
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "El archivo debe ser una imagen" },
          { status: 400 },
        );
      }
      if (file.size > 1024 * 1024 * 5) {
        return NextResponse.json(
          { error: "El archivo debe pesar menos de 5MB" },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileExtension = file.name.split(".").pop();
      const fileName = `avatars/${id}-${uuidv4()}.${fileExtension}`;

      // Identificamos la imagen anterior
      const oldImageUrl = session.user.image;

      imageUrl = await uploadImageToStorage(buffer, fileName);

      // Eliminamos la imagen anterior de Cloudinary
      if (oldImageUrl) {
        deleteImageFromStorage(oldImageUrl).catch((err) =>
          console.error(
            "Fallo silencioso omitido borrando imagen antigua",
            err,
          ),
        );
      }
    }

    // Actualizar base de datos
    const result = await sql<User[]>`
      UPDATE users 
      SET name = ${name}, email = ${email}, image_url = ${imageUrl ?? null}
      WHERE id = ${id}
      RETURNING name, email, image_url
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Forzar actualización de la sesión
    await unstable_update({ user: { name, email, image: imageUrl } });

    return NextResponse.json(
      { success: true, user: result[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fallo al actualizar perfil:", error);
    return NextResponse.json(
      { error: "Fallo al actualizar el perfil." },
      { status: 500 },
    );
  }
}
