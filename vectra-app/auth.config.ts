import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // Custom sign-in page
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
