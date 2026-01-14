import bcrypt from "bcryptjs";
import postgres from "postgres";
import { users } from "../lib/placeholder-data";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Crea tabla de usuarios y los inserta
async function seedUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'user'
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (name, email, password, rol)
        VALUES (${user.name}, ${user.email}, ${hashedPassword}, ${user.rol})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );

  return insertedUsers;
}

// Crea tabla de tokens de restablecimiento de contraseña
async function seedPasswordResetTokens() {
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      email TEXT NOT NULL,
      token TEXT NOT NULL PRIMARY KEY,
      expires_at TIMESTAMP NOT NULL
    );
  `;
}

// Ruta para sembrar la base de datos
export async function GET() {
  try {
    await sql.begin(async () => [
      await seedUsers(),
      await seedPasswordResetTokens(),
    ]);

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
