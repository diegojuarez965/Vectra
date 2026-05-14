export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import AdminDashboard from "@/app/components/admin/AdminDashboard";
import NotificationButton from "@/app/components/users/NotificationButton";

export default async function AdminPage() {
  const session = await auth();
  const userName = session?.user?.name || "Administrador";
  const userID = session?.user?.id || "";

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground">
      {/* HEADER DE BIENVENIDA */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-foreground/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hola, <span className="text-primary">{userName}</span>
          </h1>
          <p className="mt-1 text-foreground/80">Visión general del sistema.</p>
        </div>
        <div className="flex items-center">
          <NotificationButton userID={userID} />
        </div>
      </div>

      <AdminDashboard />
    </div>
  );
}
