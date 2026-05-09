import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Custom sign-in page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días de persistencia
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
