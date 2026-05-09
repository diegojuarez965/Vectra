import type { NextAuthConfig } from "next-auth";
import type { User } from "@/app/lib/definitions";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // Permite que la sesión persista al cerrar el navegador
      },
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        if (session.user.image !== undefined)
          token.picture = session.user.image;
        if (session.user.name !== undefined) token.name = session.user.name;
        if (session.user.email !== undefined) token.email = session.user.email;
      }

      if (user) {
        const u = user as User;
        token.id = u.id;
        token.rol = u.rol;
        token.active = u.active;
        token.picture = u.image_url;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as "admin" | "user";
        session.user.active = token.active as boolean;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
        if (token.name) {
          session.user.name = token.name as string;
        }
        if (token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
    authorized() {
      return true;
    },
  },
} satisfies NextAuthConfig;
