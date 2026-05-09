import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Custom sign-in page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // Hace que el token JWT persista
  },
  cookies: {
    csrfToken: {
      options: {
        maxAge: 30 * 24 * 60 * 60, // Hace que el token CSRF persista
      },
    },
    callbackUrl: {
      options: {
        maxAge: 30 * 24 * 60 * 60, // Hace que la URL de callback persista
      },
    },
    // El sessionToken ya toma el maxAge de la configuración de 'session' automáticamente
  },
  callbacks: {
    // Default callbacks
    authorized() {
      return true;
    },
  },
  secret: process.env.AUTH_SECRET, // Add a secret for encryption
  providers: [], // Providers will be added in auth.ts
} satisfies NextAuthConfig;
