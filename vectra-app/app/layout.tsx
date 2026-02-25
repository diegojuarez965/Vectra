import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

import { getMaintenanceMode } from "@/app/lib/data";
import { auth } from "@/auth";
import MaintenancePage from "@/app/mantenimiento/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Vectra",
    default: "Vectra",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Mostrar pantalla de mantenimiento si está en modo mantenimiento y el usuario no es admin
  const isMaintenance = await getMaintenanceMode();
  let showMaintenanceScreen = false;
  if (isMaintenance) {
    const session = await auth();
    const isAdmin = session?.user?.rol === "admin";
    if (!isAdmin) {
      showMaintenanceScreen = true;
    }
  }
  if (showMaintenanceScreen) {
    return (
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
        >
          <MaintenancePage />
        </body>
      </html>
    );
  }
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased flex flex-col min-h-screen`}
      >
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
