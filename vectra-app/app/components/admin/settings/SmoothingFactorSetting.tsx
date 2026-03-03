"use client";

import { useState } from "react";
import clsx from "clsx";
import SettingCard from "@/app/components/admin/settings/SettingCard";
import { updateSmoothingFactor } from "@/app/lib/actions";

export default function SmoothingFactorSetting({
  initialValue,
}: {
  initialValue: number;
}) {
  const [smoothingFactor, setSmoothingFactor] = useState(initialValue);
  const [error, setError] = useState("");

  return (
    <SettingCard
      label="Suavizado (Jitter Filter)"
      valueDisplay={
        smoothingFactor === 0.8
          ? "Bajo"
          : smoothingFactor === 0.2
            ? "Alto"
            : "Media"
      }
      description="Aplica un filtro para reducir el temblor de los puntos detectados. 'Alto' es más suave pero puede tener un ligero retraso."
    >
      <form
        action={async (formData) => {
          setError("");
          const res = await updateSmoothingFactor(formData);
          if (!res.success) {
            setError(res.message);
            setSmoothingFactor(initialValue);
          }
        }}
        className="flex gap-2"
      >
        <button
          type="submit"
          name="smoothing_factor"
          value="0.8"
          onClick={() => setSmoothingFactor(0.8)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            smoothingFactor === 0.8
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          Bajo
        </button>

        <button
          type="submit"
          name="smoothing_factor"
          value="0.5"
          onClick={() => setSmoothingFactor(0.5)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            smoothingFactor === 0.5
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          Media
        </button>

        <button
          type="submit"
          name="smoothing_factor"
          value="0.2"
          onClick={() => setSmoothingFactor(0.2)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            smoothingFactor === 0.2
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          Alto
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </SettingCard>
  );
}
