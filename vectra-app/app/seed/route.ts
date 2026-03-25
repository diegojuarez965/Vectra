import bcrypt from "bcryptjs";
import postgres from "postgres";
import { users, system_settings } from "../lib/placeholder-data";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Crea tabla de usuarios y los inserta
async function seedUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'user',
      active BOOLEAN NOT NULL DEFAULT true,
      date TIMESTAMP DEFAULT NOW(),
      image_url VARCHAR(255)
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (name, email, password, rol)
        VALUES (${user.name}, ${user.email}, ${hashedPassword}, ${user.rol})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
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

// Crea tabla de configuraciones del sistema
async function seedSystemSettings() {
  await sql`
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);
`;
  const insertedSettings = await Promise.all(
    system_settings.map(async (setting) => {
      return sql`
        INSERT INTO system_settings (key, value)
        VALUES (${setting.key}, ${setting.value})
        ON CONFLICT (key) DO NOTHING;
      `;
    }),
  );
  return insertedSettings;
}

// Crea tabla de feedbacks
async function seedFeedbacks() {
  await sql`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255), 
      exercise VARCHAR(50) NOT NULL,
      error VARCHAR(100) NOT NULL,
      date TIMESTAMP DEFAULT NOW()
    );
  `;
}

// Crea tabla de repeticiones
async function seedRepetitions() {
  await sql`
    CREATE TABLE IF NOT EXISTS repetitions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255), 
      exercise VARCHAR(50) NOT NULL,
      count INTEGER NOT NULL,
      date TIMESTAMP DEFAULT NOW()
    );
  `;
}

// Ruta para sembrar la base de datos
export async function GET() {
  try {
    await sql.begin(async () => [
      await seedUsers(),
      await seedPasswordResetTokens(),
      await seedSystemSettings(),
      await seedFeedbacks(),
      await seedRepetitions(),
    ]);

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
