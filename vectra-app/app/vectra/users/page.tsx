import Link from "next/link";
import { 
  ScanLine, 
  FileScan, 
  TrendingUp, 
  Activity, 
  Calendar, 
  ChevronRight,
  Clock
} from "lucide-react";
import {auth} from "@/auth";

const session = await auth();
const userName = session?.user?.name || "Atleta";

export default function UsersPage() {
  // Datos simulados para la vista preliminar
  const stats = [
    { label: "Puntuación Media", value: "8.4", icon: Activity, color: "text-green-400" },
    { label: "Sesiones este mes", value: "12", icon: Calendar, color: "text-blue-400" },
    { label: "Mejora Postural", value: "+15%", icon: TrendingUp, color: "text-primary" },
  ];

  const recentActivity = [
    { id: 1, title: "Análisis de Sentadilla", date: "Hoy, 10:30 AM", score: 8.5 },
    { id: 2, title: "Evaluación de Marcha", date: "Ayer, 4:15 PM", score: 7.2 },
    { id: 3, title: "Test de Salto", date: "20 Ene, 11:00 AM", score: 9.1 },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-black p-4 md:p-8 text-white">
      
      {/* 1. HEADER DE BIENVENIDA */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Hola, <span className="text-primary">{userName}</span>
          </h1>
          <p className="mt-1 text-white/60">
            Tu cuerpo es una máquina. Vamos a calibrarla.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs text-white/40">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Sistema Operativo
        </div>
      </div>

      {/* 2. ACCIONES RÁPIDAS (HERO SECTION) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        
        {/* TARJETA 1: ESCÁNER LIVE (Destacada) */}
        <Link 
          href="/vectra/users/live-scanner"
          className="group relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 to-transparent p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,87,34,0.1)]"
        >
          <div className="absolute right-4 top-4 rounded-full bg-primary/20 p-3 text-primary transition-transform group-hover:scale-110 group-hover:rotate-90">
            <ScanLine className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Escáner en Vivo</h2>
            <p className="max-w-[80%] text-sm text-white/60 mt-2">
              Usa la cámara para analizar tu biomecánica en tiempo real.
            </p>
          </div>
          <div className="flex items-center text-xs font-medium text-primary uppercase tracking-wider">
            Iniciar Análisis <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* TARJETA 2: SUBIR ARCHIVO */}
        <Link 
          href="/vectra/users/file-scanner"
          className="group relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
        >
          <div className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white/60 transition-transform group-hover:scale-110">
            <FileScan className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Analizar Archivo</h2>
            <p className="max-w-[80%] text-sm text-white/60 mt-2">
              Procesa videos grabados anteriormente para extraer métricas.
            </p>
          </div>
          <div className="flex items-center text-xs font-medium text-white/40 uppercase tracking-wider group-hover:text-white transition-colors">
            Subir Video <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* 3. GRID DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/5">
            <div className={`rounded-lg bg-white/5 p-2 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-white/40">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. ÚLTIMA ACTIVIDAD (LISTA) */}
      <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-white">Actividad Reciente</h3>
          <Link href="/vectra/users/history" className="text-xs text-primary hover:underline">Ver todo</Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/40">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Clock className="h-3 w-3" />
                    {item.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.score >= 8 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {item.score} / 10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}