"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, ChevronDown, Check } from "lucide-react";
import { sendGlobalNotification } from "@/app/lib/actions";

const roleOptions = [
  { value: "all", label: "Todos" },
  { value: "user", label: "Clientes" },
  { value: "admin", label: "Administradores" },
];

export default function GlobalMessagingForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [role, setRole] = useState("all");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getRoleLabel = (value: string) => {
    return roleOptions.find((opt) => opt.value === value)?.label || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setLoading(true);
    setStatus(null);

    const res = await sendGlobalNotification(title, body, role);
    setStatus({ success: res.success, message: res.message });

    if (res.success) {
      setTitle("");
      setBody("");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="group relative rounded-xl border border-foreground/10 bg-foreground/5 p-6 transition-all hover:border-foreground/20 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">
          Título de la Notificación
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Mantenimiento Programado"
          className="w-full bg-background/50 border border-foreground/10 rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mensaje</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Escribe el mensaje detallado..."
          className="w-full bg-background/50 border border-foreground/10 rounded-lg p-3 text-sm text-foreground resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Destinatarios:</label>
          <div className="relative w-56 z-10" ref={roleRef}>
            <button
              type="button"
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              className={`cursor-pointer w-full flex items-center justify-between bg-background/40 hover:bg-foreground/10 border text-sm rounded-lg px-3 py-2 transition-all ${isRoleOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-foreground/10"} text-foreground`}
            >
              <span className="truncate font-medium whitespace-nowrap">
                {getRoleLabel(role)}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 ml-2 transition-transform ${isRoleOpen ? "rotate-180 text-primary" : "text-foreground/80"}`}
              />
            </button>

            {isRoleOpen && (
              <div className="absolute top-full mt-2 left-0 w-full min-w-max bg-black/95 backdrop-blur-xl border border-foreground/10 rounded-xl p-1 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                  {roleOptions.map(({ value, label }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => {
                        setRole(value);
                        setIsRoleOpen(false);
                      }}
                      className={`cursor-pointer flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground transition-colors ${role === value ? "bg-primary text-foreground font-bold hover:opacity-80" : "text-foreground/80 hover:bg-foreground/10"}`}
                    >
                      <span className="whitespace-nowrap pr-4">{label}</span>
                      {role === value && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title || !body}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Enviar Notificación</span>
        </button>
      </div>

      {status && (
        <div
          className={`mt-2 p-3 text-sm rounded-lg ${status.success ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-400/5 text-red-400 border border-red-400/20"}`}
        >
          {status.message}
        </div>
      )}
    </form>
  );
}
