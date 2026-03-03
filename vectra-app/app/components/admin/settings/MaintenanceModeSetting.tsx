"use client";

import { useState } from "react";
import clsx from "clsx";
import SettingCard from "@/app/components/admin/settings/SettingCard";
import { updateMaintenanceMode } from "@/app/lib/actions";

export default function MaintenanceModeSetting({
  initialValue,
}: {
  initialValue: boolean;
}) {
  const [maintenanceActive, setMaintenanceActive] = useState(initialValue);
  const [error, setError] = useState("");

  return (
    <SettingCard
      label="Modo Mantenimiento"
      description="Bloquea el acceso a todos los usuarios excepto administradores."
      dangerZone={true}
    >
      <form
        action={async (formData) => {
          const newValue = formData.get("maintenance_mode") === "on";
          setMaintenanceActive(newValue);
          setError("");

          const res = await updateMaintenanceMode(formData);
          if (!res.success) {
            setError(res.message);
            setMaintenanceActive(!newValue);
          }
        }}
      >
        <input
          type="hidden"
          name="maintenance_mode"
          value={maintenanceActive ? "off" : "on"}
        />

        <button
          type="submit"
          className={clsx(
            "w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer",
            "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400",
            maintenanceActive ? "bg-red-400/5" : "bg-foreground/20",
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300",
              maintenanceActive ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </form>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </SettingCard>
  );
}
