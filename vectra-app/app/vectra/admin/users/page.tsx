import UsersManager from "@/app/components/admin/UsersManager";
import { Metadata } from "next";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestión de Usuarios",
};

export default async function AdminUsersPage() {
  const session = await auth();
  const userID = session?.user?.id || "";
  return <UsersManager currentUserId={userID} />;
}
