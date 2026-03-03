"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function UserFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [isRolOpen, setIsRolOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const rolRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Click outside logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rolRef.current && !rolRef.current.contains(event.target as Node)) {
        setIsRolOpen(false);
      }
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Resetear a la página 1 cuando cambia un filtro

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentRol = searchParams.get("rol") || "all";
  const currentStatus = searchParams.get("status") || "all";

  const rolOptions = [
    { value: "all", label: "Rol: Todos" },
    { value: "admin", label: "Rol: Admin" },
    { value: "user", label: "Rol: Usuario" },
  ];

  const statusOptions = [
    { value: "all", label: "Estado: Todos" },
    { value: "active", label: "Solo Activos" },
    { value: "suspended", label: "Suspendidos" },
  ];

  const getRolLabel = (val: string) =>
    rolOptions.find((o) => o.value === val)?.label;
  const getStatusLabel = (val: string) =>
    statusOptions.find((o) => o.value === val)?.label;

  return (
    <div className="flex justify-center md:justify-start gap-3 w-full md:w-auto shrink-0 p-1 md:p-0">
      {/* SELECTOR ROL */}
      <div className="relative flex-1 md:flex-none md:w-48" ref={rolRef}>
        <button
          onClick={() => setIsRolOpen(!isRolOpen)}
          className={`cursor-pointer w-full flex items-center justify-between bg-background/40 hover:bg-foreground/10 border text-sm rounded-xl px-4 py-2.5 transition-all ${isRolOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-foreground/10"} text-foreground`}
        >
          <span className="truncate font-medium whitespace-nowrap">
            {getRolLabel(currentRol)}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 ml-2 transition-transform ${isRolOpen ? "rotate-180 text-primary" : "text-foreground/80"}`}
          />
        </button>

        {isRolOpen && (
          <div className="absolute top-full mt-2 left-0 w-full min-w-max md:min-w-full bg-black backdrop-blur-xl border border-foreground/10 rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
              {rolOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    handleFilterChange("rol", value);
                    setIsRolOpen(false);
                  }}
                  className={`cursor-pointer flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground transition-colors ${currentRol === value ? "bg-primary text-foreground font-bold hover:opacity-80" : "text-foreground/80 hover:bg-foreground/10"}`}
                >
                  <span className="whitespace-nowrap pr-4">{label}</span>
                  {currentRol === value && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SELECTOR ESTADO */}
      <div className="relative flex-1 md:flex-none md:w-48" ref={statusRef}>
        <button
          onClick={() => setIsStatusOpen(!isStatusOpen)}
          className={`cursor-pointer w-full flex items-center justify-between bg-background/40 hover:bg-foreground/10 border text-sm rounded-xl px-4 py-2.5 transition-all ${isStatusOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-foreground/10"} text-foreground`}
        >
          <span className="truncate font-medium whitespace-nowrap">
            {getStatusLabel(currentStatus)}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 ml-2 transition-transform ${isStatusOpen ? "rotate-180 text-primary" : "text-foreground/80"}`}
          />
        </button>

        {isStatusOpen && (
          <div className="absolute top-full mt-2 left-0 w-full min-w-max md:min-w-full bg-black backdrop-blur-xl border border-foreground/10 rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden">
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
              {statusOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    handleFilterChange("status", value);
                    setIsStatusOpen(false);
                  }}
                  className={`cursor-pointer flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground transition-colors ${currentStatus === value ? "bg-primary text-foreground font-bold hover:opacity-80" : "text-foreground/80 hover:bg-foreground/10"}`}
                >
                  <span className="whitespace-nowrap pr-4">{label}</span>
                  {currentStatus === value && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
