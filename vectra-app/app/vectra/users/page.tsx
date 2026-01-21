import {Metadata} from "next";
import Scanner from "@/app/components/users/Scanner";


export const metadata: Metadata = {
    title: "Vectra | Usuarios",
    description:
        "Plataforma de análisis biomecánico y corrección postural con IA.",
};
export default function UsersPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
             <Scanner />
        </div>
    );
}