"use client";

import { useState } from "react";
import clsx from "clsx";
import SettingCard from "@/app/components/admin/settings/SettingCard";
import { updateRetentionDays } from "@/app/lib/actions";

export default function RetentionDaysSetting({
  initialValue,
}: {
  initialValue: number;
}) {
  const [retentionDays, setRetentionDays] = useState(initialValue);
  const [error, setError] = useState("");

  return (
    <SettingCard
      label="Retención del Historial"
      valueDisplay={`${retentionDays} Días`}
      description="Define por cuántos días se almacenará el historial de entrenamientos de los usuarios antes de ser eliminado."
    >
      <form
        action={async (formData) => {
          setError("");
          const res = await updateRetentionDays(formData);
          if (!res.success) {
            setError(res.message);
            setRetentionDays(initialValue);
          }
        }}
        className="flex gap-2"
      >
        <button
          type="submit"
          name="retention_days"
          value="30"
          onClick={() => setRetentionDays(30)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            retentionDays === 30
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          30 Días
        </button>

        <button
          type="submit"
          name="retention_days"
          value="60"
          onClick={() => setRetentionDays(60)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            retentionDays === 60
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          60 Días
        </button>

        <button
          type="submit"
          name="retention_days"
          value="90"
          onClick={() => setRetentionDays(90)}
          className={clsx(
            "cursor-pointer flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
            retentionDays === 90
              ? "bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,87,34,0.2)]"
              : "bg-foreground/5 border-foreground/10 text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          90 Días
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </SettingCard>
  );
}
