import { NextResponse } from "next/server";
import postgres from "postgres";
import { User } from "../../lib/definitions";
import bcrypt from "bcryptjs";
import { CreateUserSchema, EditUserSchema } from "@/app/lib/schemas";
import { auth } from "@/auth";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Handler para crear un nuevo usuario
export async function handlerCreateUser(req: Request) {
  try {
    const body = await req.json();

    // VALIDACIÓN CON ZOD
    const validatedData = CreateUserSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos o incompletos",
          details: validatedData.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Extraemos los datos sanitizados y garantizados por Zod
    const { name, email, password } = validatedData.data;

    // Verificar si ya existe un usuario con ese email
    const existingUsers = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Email ya registrado" },
        { status: 409 },
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta usuario
    const result = await sql<User[]>`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Fallo en la base de datos:", error);
    return NextResponse.json(
      { error: "Fallo al crear el usuario." },
      { status: 500 },
    );
  }
}

// Handler para obtener usuarios con paginación
export async function handlerGetUsers(req: Request) {
  try {
    // Obtener parámetros de la URL
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const query = url.searchParams.get("query") || "";
    const rol = url.searchParams.get("rol") || "all";
    const status = url.searchParams.get("status") || "all";
    const dateParam = url.searchParams.get("date");
    const usersPerPage = 6;
    const offset = (page - 1) * usersPerPage;

    const searchPattern = query ? `%${query}%` : `%%`;

    // Filtros dinámicos con postgres.js
    const filterRol = rol !== "all" ? sql`AND rol = ${rol}` : sql``;
    const filterActive =
      status !== "all" ? sql`AND active = ${status === "active"}` : sql``;
    const filterDate = dateParam
      ? sql`AND date >= ${dateParam}::timestamp`
      : sql``;

    // Obtener usuarios filtrados
    const users = await sql<User[]>`
      SELECT id, name, email, rol, active, date FROM users
      WHERE (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
      ${filterRol}
      ${filterActive}
      ${filterDate}
      ORDER BY id ASC
      LIMIT ${usersPerPage} OFFSET ${offset}
    `;

    // Contar total de usuarios filtrados
    const countResult = await sql<{ count: number }[]>`
      SELECT COUNT(*) as count FROM users
      WHERE (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
      ${filterRol}
      ${filterActive}
      ${filterDate}
    `;

    const totalUsers = countResult[0].count;
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    return NextResponse.json(
      {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          usersPerPage,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fallo al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Fallo al obtener usuarios." },
      { status: 500 },
    );
  }
}

// Handler para actualizar un usuario
export async function handlerUpdateUser(req: Request) {
  try {
    const body = await req.json();

    // VALIDACIÓN CON ZOD
    const validatedData = EditUserSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos o incompletos",
          details: validatedData.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { id, name, email, rol, active } = validatedData.data;

    const session = await auth();
    const currentUserId = session?.user?.id;

    console.log("currentUserId", currentUserId);
    console.log("id", id);

    // 1. Prohibir autodegradación
    if (String(currentUserId) === String(id)) {
      const currentUserRecord = await sql<
        User[]
      >`SELECT rol, active FROM users WHERE id = ${id}`;
      if (currentUserRecord.length > 0) {
        if (rol !== currentUserRecord[0].rol) {
          return NextResponse.json(
            { error: "No puedes cambiar tu propio rol" },
            { status: 403 },
          );
        }
        if (active !== currentUserRecord[0].active) {
          return NextResponse.json(
            {
              error:
                "No puedes suspender o cambiar el estado de tu propia cuenta",
            },
            { status: 403 },
          );
        }
      }
    }

    // 2. Validación del Último Administrador
    if (rol !== "admin" || !active) {
      const userRecord = await sql<
        User[]
      >`SELECT rol, active FROM users WHERE id = ${id}`;
      if (
        userRecord.length > 0 &&
        userRecord[0].rol === "admin" &&
        userRecord[0].active
      ) {
        const adminCountResult = await sql<
          { count: number }[]
        >`SELECT COUNT(*) as count FROM users WHERE rol = 'admin' AND active = true`;
        if (adminCountResult[0].count <= 1) {
          return NextResponse.json(
            {
              error:
                "No puedes degradar o suspender al último administrador activo del sistema",
            },
            { status: 403 },
          );
        }
      }
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

    const result = await sql<User[]>`
      UPDATE users 
      SET name = ${name}, email = ${email}, rol = ${rol}, active = ${active}
      WHERE id = ${id}
      RETURNING id, name, email, rol, active
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Fallo al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Fallo al actualizar el usuario." },
      { status: 500 },
    );
  }
}
