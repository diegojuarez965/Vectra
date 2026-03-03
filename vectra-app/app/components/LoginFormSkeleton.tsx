export default function LoginFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* CAMPO EMAIL */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-foreground/10 rounded-md"></div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 bg-foreground/10 rounded-full"></div>
          </div>
          <div className="w-full h-12 rounded-lg bg-foreground/5 border border-foreground/10"></div>
        </div>
      </div>

      {/* CAMPO PASSWORD */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-foreground/10 rounded-md"></div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 bg-foreground/10 rounded-full"></div>
          </div>
          <div className="w-full h-12 rounded-lg bg-foreground/5 border border-foreground/10"></div>
          <div className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center">
            <div className="h-5 w-5 bg-foreground/10 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* OLVIDASTE CONTRASEÑA */}
      <div className="flex justify-end">
        <div className="h-4 w-40 bg-foreground/10 rounded-md"></div>
      </div>

      {/* BOTÓN SUBMIT */}
      <div className="w-full h-12 rounded-lg bg-primary/20"></div>

      {/* ESPACIO DE ERROR (Opcional, pero para mantener altura original) */}
      <div className="flex h-8 items-end space-x-1"></div>
    </div>
  );
}
