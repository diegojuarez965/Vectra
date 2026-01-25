import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

// --- IMPORTS NUEVOS PARA MANTENIMIENTO ---
import { getMaintenanceMode } from "@/app/lib/actions";
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
        <body className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}>
          <MaintenancePage />
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-white antialiased flex flex-col min-h-screen`}
      >
        {/* El children normal de la app */}
        <main className="grow">
            {children}
        </main>
        
        {/* El footer solo aparece si la app funciona normal */}
        <Footer />
      </body>
    </html>
  );
}