import UsersManager from "@/app/components/admin/UsersManager";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestión de Usuarios",
};

export default async function AdminUsersPage() {
  return <UsersManager />;
}
