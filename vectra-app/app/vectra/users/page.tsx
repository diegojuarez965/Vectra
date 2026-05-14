import Link from "next/link";
import { ScanLine, FileScan, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import UserDashboard from "@/app/components/users/UserDashboard";
import { getRetentionDays } from "@/app/lib/data";
import Chatbox from "@/app/components/users/Chatbox";
import NotificationButton from "@/app/components/users/NotificationButton";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const userName = session?.user?.name || "Atleta";
  const userID = session?.user?.id || "";
  const avatar =
    session?.user?.image ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const retentionDays = await getRetentionDays();

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground">
      {/* HEADER DE BIENVENIDA */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-foreground/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hola, <span className="text-primary">{userName}</span>
          </h1>
          <p className="mt-1 text-foreground/80">
            Tu cuerpo es una máquina. Vamos a calibrarla.
          </p>
        </div>
        <div className="flex items-center">
          <NotificationButton userID={userID} />
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        {/* TARJETA 1: ESCÁNER LIVE */}
        <Link
          href="/vectra/users/live-scanner"
          className="group relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 to-transparent p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,87,34,0.1)]"
        >
          <div className="absolute right-4 top-4 rounded-full bg-primary/20 p-3 text-primary transition-transform group-hover:scale-110 group-hover:rotate-90">
            <ScanLine className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              Escáner en Vivo
            </h2>
            <p className="max-w-[80%] text-sm text-foreground/80 mt-2">
              Usa la cámara para analizar tu biomecánica en tiempo real.
            </p>
          </div>
          <div className="flex items-center text-xs font-medium text-primary uppercase tracking-wider">
            Iniciar Análisis{" "}
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* TARJETA 2: SUBIR ARCHIVO */}
        <Link
          href="/vectra/users/file-scanner"
          className="group relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5 p-6 transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/10"
        >
          <div className="absolute right-4 top-4 rounded-full bg-foreground/10 p-3 text-foreground/80 transition-transform group-hover:scale-110">
            <FileScan className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Analizar Archivo
            </h2>
            <p className="max-w-[80%] text-sm text-foreground/80 mt-2">
              Procesa videos grabados anteriormente para extraer métricas.
            </p>
          </div>
          <div className="flex items-center text-xs font-medium text-foreground/80 uppercase tracking-wider group-hover:text-foreground transition-colors">
            Subir Video{" "}
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* DASHBOARD DE MÉTRICAS */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Métricas de Rendimiento
        </h2>
      </div>
      <UserDashboard userID={userID} retentionDays={retentionDays} />

      <Chatbox avatar={avatar} />
    </div>
  );
}
