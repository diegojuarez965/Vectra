import type { Metadata } from "next";
import SideNav from "@/app/components/users/SideNav";

export const metadata: Metadata = {
  title: {
    template: "%s | Usuarios",
    default: "Usuarios",
  },
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-64 shrink-0">
        <SideNav />
      </div>
      {children}
    </div>
  );
}
