import Link from "next/link";
import Image from "next/image";
import HeroScanner from "./components/HeroScanner";
import FeatureCard from "./components/FeatureCard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* --- NAVBAR --- */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Image
            src="/images/vectra-logo.png"
            alt="Vectra Logo"
            width={40}
            height={40}
          />
          <div className="hidden md:block text-2xl font-bold tracking-tighter text-foreground">
            VECTRA
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-semibold"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-full bg-primary text-foreground hover:bg-orange-600 transition-colors text-sm font-semibold shadow-lg shadow-orange-900/20"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* --- Sección Hero --- */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-12 max-w-7xl mx-auto gap-12 py-12 md:py-24">
        {/* Texto Hero */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Corrección Postural con <br />
            <span className="text-primary">Visión Artificial</span>
          </h1>

          <p className="text-lg text-white/70 max-w-xl mx-auto md:mx-0 leading-relaxed">
            Haz que cada repetición cuente. Optimiza tu biomecánica para
            asegurar el máximo estímulo muscular y corregir vicios posturales
            que frenan tu progreso en el gimnasio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <Link
              href="/login"
              className="px-6 py-4 rounded-lg bg-primary text-foreground font-bold text-lg hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-900/40 transform hover:-translate-y-1"
            >
              Comenzar Análisis
            </Link>
            <Link
              href="#como-funciona"
              className="px-6 py-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium text-lg backdrop-blur-sm"
            >
              ¿Cómo Funciona?
            </Link>
          </div>
        </div>
        {/* Hero Scanner */}
        <HeroScanner />
      </section>

      {/* --- Sección de Características --- */}
      <section id="como-funciona" className="py-24 bg-black/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Tecnología Avanzada</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <FeatureCard
              icon={<ScanIcon />}
              title="Detección en Tiempo Real"
              description="Sin sensores corporales. Solo necesitas tu cámara para obtener un mapeo esquelético preciso al instante."
            />
            {/* Card 2 */}
            <FeatureCard
              icon={<ChartIcon />}
              title="Historial y Métricas"
              description="Guarda cada sesión y visualiza tu progreso a lo largo del tiempo con gráficos detallados."
            />
            {/* Card 3 */}
            <FeatureCard
              icon={<ShieldIcon />}
              title="Privacidad Primero"
              description="El procesamiento de video se realiza en tiempo real. Tus imágenes nunca se guardan, solo los datos matemáticos."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

// Íconos
const ScanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 16v3" />
    <path d="M12 8V5" />
    <path d="M8 12H5" />
    <path d="M19 12h-3" />
  </svg>
);
const ChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);
const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);
