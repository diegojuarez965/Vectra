import { Metadata } from "next";
import { auth } from "@/auth";
import { History } from "lucide-react";
import UserHistory from "@/app/components/users/UserHistory";

export const metadata: Metadata = {
  title: "Historial",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();
  const userID = session?.user?.id || "";
  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 border-b border-foreground/10 pb-6">
          <div className="p-3 bg-foreground/5 rounded-xl border border-foreground/10 shadow-lg shadow-primary/5">
            <History className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Historial
            </h1>
            <p className="text-sm text-muted-foreground hidden md:block">
              Revisa detalladamente los resultados de tus entrenamientos
            </p>
          </div>
        </div>
      </div>
      {/* History Component */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Métricas de Rendimiento
        </h2>
      </div>
      <UserHistory userID={userID} />
    </div>
  );
}
