"use client";

import { useState } from "react";
import clsx from "clsx";
import SettingCard from "@/app/components/admin/settings/SettingCard";
import { updateMaxTimeAnalysis } from "@/app/lib/actions";

export default function MaxTimeAnalysisSetting({
  initialValue,
}: {
  initialValue: number;
}) {
  const [maxTimeAnalysis, setMaxTimeAnalysis] = useState(initialValue);
  const [error, setError] = useState("");

  return (
    <SettingCard
      label="Tiempo Máximo de Análisis"
      valueDisplay={
        maxTimeAnalysis === 1 ? "1 Minuto" : `${maxTimeAnalysis} Minutos`
      }
      description="Define la duración máxima de los análisis en vivo."
    >
      <form
        action={async (formData) => {
          setError("");
          const res = await updateMaxTimeAnalysis(formData);
          if (!res.success) {
            setError(res.message);
            setMaxTimeAnalysis(initialValue);
          }
        }}
        className="flex gap-2"
      >
        <button
          type="submit"
          name="max_time_analysis"
          value="1"
          onClick={() => setMaxTimeAnalysis(1)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            maxTimeAnalysis === 1
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          1 Minuto
        </button>

        <button
          type="submit"
          name="max_time_analysis"
          value="2"
          onClick={() => setMaxTimeAnalysis(2)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            maxTimeAnalysis === 2
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          2 Minutos
        </button>

        <button
          type="submit"
          name="max_time_analysis"
          value="3"
          onClick={() => setMaxTimeAnalysis(3)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            maxTimeAnalysis === 3
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          3 Minutos
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </SettingCard>
  );
}
