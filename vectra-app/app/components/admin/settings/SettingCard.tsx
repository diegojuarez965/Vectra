import clsx from "clsx";
import { Info } from "lucide-react";

export default function SettingCard({
  label,
  children,
  description,
  valueDisplay,
  dangerZone = false,
}: {
  label: string;
  children: React.ReactNode;
  description: string;
  valueDisplay?: string;
  dangerZone?: boolean;
}) {
  return (
    // Retornanos una tarjeta con la información del setting
    <div
      className={clsx(
        "group relative p-4 rounded-xl border transition-all duration-300",
        dangerZone
          ? "bg-red-400/5 border-red-400/20 hover:bg-red-400/10"
          : "bg-foreground/5 border-foreground/5 hover:bg-foreground/[0.07] hover:border-foreground/10",
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <span
          className={clsx(
            "font-medium text-sm",
            dangerZone ? "text-red-400" : "text-foreground",
          )}
        >
          {label}
        </span>
        {valueDisplay && (
          <span className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">
            {valueDisplay}
          </span>
        )}
      </div>
      <div className="relative z-10">{children}</div>
      <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500 ease-in-out">
        <div className="pt-3 mt-3 border-t border-foreground/5">
          <p className="text-xs text-foreground/80 leading-relaxed flex items-start gap-2">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-foreground/80" />
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
