import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Vectra | Usuarios",
    description:
        "Plataforma de análisis biomecánico y corrección postural con IA.",
};
export default function UsersPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <h1 className="text-4xl font-bold text-primary">Página de Usuarios</h1>
        </div>
    );
}