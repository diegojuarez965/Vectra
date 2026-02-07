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
    <div
      className={clsx(
        "group relative p-4 rounded-xl border transition-all duration-300",
        dangerZone
          ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
          : "bg-white/5 border-white/5 hover:bg-white/[0.07] hover:border-white/10",
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <span
          className={clsx(
            "font-medium text-sm",
            dangerZone ? "text-red-300" : "text-foreground",
          )}
        >
          {label}
        </span>
        {valueDisplay && (
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
            {valueDisplay}
          </span>
        )}
      </div>
      <div className="relative z-10">{children}</div>
      <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500 ease-in-out">
        <div className="pt-3 mt-3 border-t border-white/5">
          <p className="text-xs text-white/50 leading-relaxed flex items-start gap-2">
            <Info className="w-3 h-3 mt-0.5 shrink-0 text-white/30" />
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
