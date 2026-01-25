import { getNoRegisterMode } from "@/app/lib/actions";
import NoRegisterPage from "@/app/no-register-mode/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta para comenzar el análisis biomecánico con IA.",
};

export default async function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const not_allowed = await getNoRegisterMode();

  if (not_allowed) {
    return <NoRegisterPage />;
  }

  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
