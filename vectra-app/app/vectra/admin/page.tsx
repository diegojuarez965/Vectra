import Link from "next/link";
import {
  Users,
  Settings,
  Activity,
  BarChart3,
  Server,
  ChevronRight,
  UserPlus,
  FileText
} from "lucide-react";

export const dynamic = "force-dynamic";
import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();
  const userName = session?.user?.name || "Administrador";

  // Datos simulados: Métricas del Negocio/Sistema
  const stats = [
    {
      label: "Usuarios Totales",
      value: "142",
      subtext: "+12 esta semana",
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Análisis (Mes)",
      value: "1,204",
      subtext: "+8.5% vs mes anterior",
      icon: BarChart3,
      color: "text-primary",
    },
    {
      label: "Estado API",
      value: "Online",
      subtext: "15ms latencia",
      icon: Server,
      color: "text-green-400",
    },
  ];

  // Datos simulados: Log de actividad del sistema
  const systemLogs = [
    {
      id: 1,
      action: "Nuevo Usuario Registrado",
      user: "Carlos M.",
      time: "Hace 2 min",
      type: "user",
    },
    {
      id: 2,
      action: "Análisis Completado",
      user: "Ana G. (Sentadilla)",
      time: "Hace 15 min",
      type: "analysis",
    },
    {
      id: 3,
      action: "Intento de acceso fallido",
      user: "admin@vectra.com",
      time: "Hace 1 hora",
      type: "security",
    },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-black p-4 md:p-8 text-white">
      
      {/* 1. HEADER ADMIN */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Panel de Control
          </h1>
          <p className="mt-1 text-white/60">
            Bienvenido, <span className="text-primary">{userName}</span>. Visión general del sistema.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1 text-xs text-red-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Modo Administrador
        </div>
      </div>

      {/* 2. ACCIONES PRINCIPALES DE GESTIÓN (HERO) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        
        {/* TARJETA 1: GESTIÓN DE USUARIOS */}
        <Link
          href="/vectra/admin/users"
          className="group relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border border-blue-500/20 bg-linear-to-br from-blue-900/20 to-transparent p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
        >
          <div className="absolute right-4 top-4 rounded-full bg-blue-500/20 p-3 text-blue-400 transition-transform group-hover:scale-110">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              Gestión de Usuarios
            </h2>
            <p className="max-w-[80%] text-sm text-white/60 mt-2">
              Administrar atletas, restablecer accesos y ver perfiles.
            </p>
          </div>
          <div className="flex items-center text-xs font-medium text-blue-400 uppercase tracking-wider">
            Ver Directorio{" "}
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* TARJETA 2: CONFIGURACIÓN GLOBAL */}
        <Link
          href="/vectra/admin/settings"
          className="group relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
        >
          <div className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white/60 transition-transform group-hover:scale-110 group-hover:rotate-45">
            <Settings className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configuración Global</h2>
            <p className="max-w-[80%] text-sm text-white/60 mt-2">
              Ajustar umbrales de IA, modo mantenimiento y variables.
            </p>
          </div>
          <div className="flex items-center text-xs font-medium text-white/40 uppercase tracking-wider group-hover:text-white transition-colors">
            Ir a Ajustes{" "}
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* 3. GRID DE ESTADÍSTICAS DEL SISTEMA */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/5"
          >
            <div className={`rounded-lg bg-white/5 p-2 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-white/40">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <span className="text-[10px] text-white/30 font-mono">{stat.subtext}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. LOGS RECIENTES (Últimos eventos) */}
      <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-white">Actividad Reciente del Sistema</h3>
          <button className="text-xs text-primary hover:underline">
            Ver Logs Completos
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {systemLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                {/* Icono dinámico según el tipo de log */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ${
                    log.type === 'security' ? 'text-red-400' : 'text-white/40'
                }`}>
                  {log.type === 'user' && <UserPlus className="h-5 w-5" />}
                  {log.type === 'analysis' && <Activity className="h-5 w-5" />}
                  {log.type === 'security' && <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-white">{log.action}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{log.user}</span>
                    <span className="h-1 w-1 rounded-full bg-white/20"></span>
                    <span>{log.time}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                 <span className="text-xs font-mono text-white/20">#{log.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}