"use client";

import { useState } from "react";
import SettingCard from "@/app/components/admin/settings/SettingCard";
import { updateConfidenceThreshold } from "@/app/lib/actions";

export default function ConfidenceThresholdSetting({
  initialValue,
}: {
  initialValue: number;
}) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(initialValue);
  const [error, setError] = useState("");

  return (
    <SettingCard
      label="Umbral de Confianza (Confidence)"
      valueDisplay={confidenceThreshold.toFixed(2)}
      description="Define qué tan seguro debe estar el modelo para marcar un punto corporal. Un valor alto (0.8+) es más preciso pero requiere mejor luz."
    >
      <form
        action={async (formData) => {
          setError("");
          const res = await updateConfidenceThreshold(formData);
          if (!res.success) {
            setError(res.message);
            setConfidenceThreshold(initialValue);
          }
        }}
      >
        <input
          type="range"
          name="confidence_threshold"
          min="0"
          max="1"
          step="0.05"
          defaultValue={initialValue}
          onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
          onMouseUp={(e) => e.currentTarget.form?.requestSubmit()}
          onTouchEnd={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-full accent-primary h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer"
        />
      </form>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </SettingCard>
  );
}
