import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import constants from "constants";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z
              .string()
              .min(8)
              .regex(/[A-Z]/)
              .regex(/[a-z]/)
              .regex(/[0-9]/),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // 1. Ejecutar callback original para inicializar o procesar actualizaciones locales
      constants updatedToken = await authConfig.callbacks.jwt({
      token,
      user,
      trigger,
      session,
    });

      // 2. Si hay sesión y el token contiene el id del usuario, refrescamos la información desde la base de datos
      if (updatedToken?.id) {
        try {
          const dbUsers = await sql<User[]>`
            SELECT name, email, image_url, rol, active 
            FROM users 
            WHERE id = ${updatedToken.id as string}
          `;

          if (dbUsers.length > 0) {
            const dbUser = dbUsers[0];
            // Sincronizar el token con los valores reales y actualizados de la base de datos
            updatedToken.name = dbUser.name;
            updatedToken.email = dbUser.email;
            updatedToken.picture = dbUser.image_url;
            updatedToken.rol = dbUser.rol;
            updatedToken.active = dbUser.active;
          }
        } catch (error) {
          console.error("Error actualizando la sesión desde la base de datos:", error);
        }
      }

      return updatedToken;
    },
  },
});
