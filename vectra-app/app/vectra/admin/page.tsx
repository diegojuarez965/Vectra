import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Vectra | Administración",
    description:
        "Plataforma de análisis biomecánico y corrección postural con IA.",
};
export default function AdminPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <h1 className="text-4xl font-bold text-primary">Página de Administración</h1>
        </div>
    );
}