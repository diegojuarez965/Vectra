"use client";

import { useTransition, useState, useEffect, useCallback } from "react";
import Pagination from "@/app/components/Pagination";
import UsersSkeleton from "@/app/components/admin/UsersSkeleton";
import { Users, Edit2, ShieldAlert, ShieldCheck } from "lucide-react";
import { User, UsersResponse } from "@/app/lib/definitions";
import { getUsers } from "@/app/lib/data";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Search from "@/app/components/Search";
import UserFilters from "@/app/components/admin/UserFilters";
import EditUserModal from "@/app/components/admin/EditUserModal";

export default function UsersManager({
  currentUserId,
}: {
  currentUserId?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentQuery = searchParams.get("query") || "";
  const currentRol = searchParams.get("rol") || "all";
  const currentStatus = searchParams.get("status") || "all";

  const [usersData, setUsersData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUsers(
        currentPage,
        currentQuery,
        currentRol,
        currentStatus,
      );
      if (!data) {
        setError("Error al conectar con la base de datos.");
        return;
      }
      setUsersData(data);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con la base de datos.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentQuery, currentRol, currentStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`, { scroll: true });
    });

    // Smooth scroll manual opcional
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditSuccess = () => {
    setEditingUser(null);
    fetchUsers();
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 md:p-8 text-foreground pb-24">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 border-b border-foreground/10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Gestión de Usuarios
            </h1>
            <p className="mt-1 text-foreground/80">
              Administre roles, estados e información de los usuarios.
            </p>
          </div>
          <div className="text-sm text-foreground/80 shrink-0 self-start md:self-end bg-foreground/5 px-4 py-2 rounded-lg border border-foreground/10">
            Total listado:{" "}
            <span className="font-bold text-primary text-base">
              {isLoading ? "..." : usersData?.pagination.totalUsers || 0}
            </span>
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS */}
        <div className="flex flex-col md:flex-row items-stretch justify-center md:items-center gap-4 bg-foreground/5 p-4 rounded-xl border border-foreground/10">
          <Search placeholder=" Nombre o email..." />
          <UserFilters />
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-background rounded-lg border border-foreground/10 overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <div className="bg-red-400/5 border border-red-400/20 rounded-lg p-4 text-red-400 inline-block">
              {error}
            </div>
          </div>
        ) : isLoading || isPending || !usersData ? (
          <UsersSkeleton count={usersData?.pagination.usersPerPage || 6} />
        ) : usersData.users.length > 0 ? (
          <>
            {/* MOBILE */}
            <div className="md:hidden p-4 space-y-3">
              {usersData.users.map((user) => (
                <div
                  key={`card-${user.id}`}
                  className="bg-foreground/3 rounded-lg p-3 border border-foreground/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">
                      {user.name}
                    </div>
                    <div className="text-xs text-foreground/80">
                      ID: {user.id}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-foreground/80">
                    {user.email}
                  </div>
                  <div className="mt-4 pt-4 border-t border-foreground/5 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.rol === "admin"
                            ? "bg-primary/5 text-primary"
                            : "bg-foreground/10 text-foreground/80"
                        }`}
                      >
                        {user.rol === "admin" ? "Admin" : "Usuario"}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          user.active !== false
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-400/5 text-red-400"
                        }`}
                      >
                        {user.active !== false ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        {user.active !== false ? "Activo" : "Suspendido"}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="shrink-0 p-2 text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-foreground/10 hover:border-primary/20 bg-background shadow-sm"
                      title="Editar usuario"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/10 bg-foreground/5">
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                      ID
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground/80">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-foreground/10 hover:bg-foreground/5 transition-colors ${
                        index % 2 === 0 ? "bg-transparent" : "bg-foreground/2"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-foreground text-center">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium text-center">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/80 text-center">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.rol === "admin"
                              ? "bg-primary/5 text-primary border border-primary/20"
                              : "bg-foreground/5 text-foreground/80 border border-foreground/10"
                          }`}
                        >
                          {user.rol === "admin" ? "Admin" : "Usuario"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                            user.active !== false
                              ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                              : "bg-red-400/5 text-red-400 border-red-400/20"
                          }`}
                        >
                          {user.active !== false ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                          {user.active !== false ? "Activo" : "Suspendido"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:text-primary bg-background hover:bg-primary/5 border border-foreground/10 hover:border-primary/20 rounded-lg transition-all shadow-sm cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN */}
            <div className="mt-6 mb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={usersData.pagination.totalPages}
                onPageChange={handlePageChange}
                disabled={isPending}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-foreground/80">No hay usuarios disponibles.</p>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          currentUserId={currentUserId}
          onClose={() => setEditingUser(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
