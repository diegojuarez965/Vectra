import SettingsEditor from "@/app/components/admin/settings/SettingsEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  return <SettingsEditor />;
}
