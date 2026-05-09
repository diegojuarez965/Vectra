import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname;

  const isOnAdmin = pathname.startsWith("/vectra/admin");
  const isOnUsers = pathname.startsWith("/vectra/users");
  const isOnLoginSuccess = pathname === "/login-success";
  const isOnSuspendido = pathname === "/suspendido";

  const requiresAuth =
    isOnAdmin || isOnUsers || isOnLoginSuccess || isOnSuspendido;

  // Redirección a login si no hay sesión
  if (!session && requiresAuth) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!session) return NextResponse.next();

  // Extraemos variables usando encadenamiento opcional para evitar fallos si user no está
  const active = session.user?.active;
  const role = session.user?.rol;

  if (!active && !isOnSuspendido) {
    url.pathname = "/suspendido";
    return NextResponse.redirect(url);
  }

  if (active && isOnSuspendido) {
    url.pathname = role === "admin" ? "/vectra/admin" : "/vectra/users";
    return NextResponse.redirect(url);
  }

  if (isOnLoginSuccess) {
    url.pathname = role === "admin" ? "/vectra/admin" : "/vectra/users";
    return NextResponse.redirect(url);
  }

  if (isOnAdmin && role !== "admin") {
    url.pathname = "/vectra/users";
    return NextResponse.redirect(url);
  }

  if (isOnUsers && role !== "user") {
    url.pathname = "/vectra/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login-success",
    "/suspendido",
    "/vectra/(admin|users)(/:path*)?",
    "/((?!api/|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|firebase-messaging-sw\\.js|icons/|.*\\.png$).*)",
  ],
};
