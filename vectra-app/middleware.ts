import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { auth } from "./auth";
import { NextRequest, NextResponse } from "next/server";

// Middleware de autenticación de NextAuth
export default NextAuth(authConfig).auth;

export async function middleware(req: NextRequest) {
  const session = await auth();
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  // Rutas protegidas según rol
  const isOnAdmin = pathname.startsWith("/vectra/admin");
  const isOnUsers = pathname.startsWith("/vectra/users");
  const isOnLoginSuccess = pathname === "/login-success";
  const isOnSuspendido = pathname === "/suspendido";

  const requiresAuth =
    isOnAdmin || isOnUsers || isOnLoginSuccess || isOnSuspendido;

  // Redirección a login si no hay sesión en rutas protegidas
  if (!session && requiresAuth) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!session) return NextResponse.next(); // acceso libre al resto

  const active = session.user.active;
  const role = session.user.rol;

  if (!active && !isOnSuspendido) {
    url.pathname = "/suspendido";
    return NextResponse.redirect(url);
  }

  if (active && isOnSuspendido) {
    url.pathname = role === "admin" ? "/vectra/admin" : "/vectra/users";
    return NextResponse.redirect(url);
  }

  // Redirección post-login según rol
  if (isOnLoginSuccess) {
    url.pathname = role === "admin" ? "/vectra/admin" : "/vectra/users";
    return NextResponse.redirect(url);
  }

  // Acceso restringido según rol
  if (isOnAdmin && role !== "admin") {
    url.pathname = "/vectra/users";
    return NextResponse.redirect(url);
  }

  if (isOnUsers && role !== "user") {
    url.pathname = "/vectra/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Matcher para definir qué rutas pasan por el middleware
export const config = {
  matcher: [
    "/login-success",
    "/suspendido",
    "/vectra/(admin|users)(/:path*)?",
    "/((?!api/|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|firebase-messaging-sw\\.js|icons/|.*\\.png$).*)",
  ],
};
