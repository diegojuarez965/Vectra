import { getNoRegisterMode } from "@/app/lib/data";
import NoRegisterPage from "@/app/no-register-mode/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro",
};

export default async function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificamos si el modo de no registro está activado
  const not_allowed = await getNoRegisterMode();

  if (not_allowed) {
    return <NoRegisterPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  );
}
