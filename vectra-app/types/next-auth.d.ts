import { DefaultSession } from "next-auth";

//Extendemos la interfaz Session para incluir 'id' y 'rol' en 'user'. Por defecto NextAuth solo incluye 'name', 'email' e 'image'.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: "admin" | "user";
    } & DefaultSession["user"];
  }
}

//Extendemos la interfaz JWT para incluir 'id' y 'rol'.
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: "admin" | "user";
  }
}
