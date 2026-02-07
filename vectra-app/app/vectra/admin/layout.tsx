import type { Metadata } from "next";
import SideNav from "@/app/components/admin/SideNav";

export const metadata: Metadata = {
  title: {
    template: "%s | Administración",
    default: "Administración",
  },
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-64 shrink-0">
        <SideNav />
      </div>
      {children}
    </div>
  );
}
