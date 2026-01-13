import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background">
      <Image
        src="/images/Vectra_Logo.png"
        alt="Vectra Logo"
        width={400}
        height={400}
        className="mb-8"
      />
      <h1 className="text-4xl font-bold text-primary">Bienvenido a Vectra App</h1>
      <div></div>
      <p className="text-2xl font-bold text-foreground">Esta es una prueba de colores.</p>
    </div>
  );
}
