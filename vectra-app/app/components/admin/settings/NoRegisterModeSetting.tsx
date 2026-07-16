"use client";

import { useState } from "react";
import clsx from "clsx";
import SettingCard from "@/app/components/admin/settings/SettingCard";
import { updateNoRegisterMode } from "@/app/lib/actions";

export default function NoRegisterModeSetting({
  initialValue,
}: {
  initialValue: boolean;
}) {
  const [noRegisterActive, setNoRegisterActive] = useState(initialValue);
  const [error, setError] = useState("");

  return (
    <SettingCard
      label="Modo Sin Registro"
      description="Desactiva la capacidad de nuevos usuarios para registrarse en el sistema."
      dangerZone={true}
    >
      <form
        action={async (formData) => {
          const newValue = formData.get("no_register_mode") === "on";
          setNoRegisterActive(newValue);
          setError("");

          const res = await updateNoRegisterMode(formData);
          if (!res.success) {
            setError(res.message);
            setNoRegisterActive(!newValue);
          }
        }}
      >
        <input
          type="hidden"
          name="no_register_mode"
          value={noRegisterActive ? "off" : "on"}
        />

        <button
          type="submit"
          className={clsx(
            "w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer",
            "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400",
            noRegisterActive ? "bg-red-400" : "bg-foreground/20",
          )}
        >
          <span
            className={clsx(
              "absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300",
              noRegisterActive ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </form>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </SettingCard>
  );
}
