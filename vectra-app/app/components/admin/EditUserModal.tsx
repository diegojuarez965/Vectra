"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { User, EditUserState } from "@/app/lib/definitions";
import { X, Save, AlertCircle, ChevronDown, Check } from "lucide-react";
import { updateUser } from "@/app/lib/actions";

interface EditUserModalProps {
  user: User;
  currentUserId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  user,
  currentUserId,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const initialState: EditUserState = { message: "", errors: {} };
  const [state, formAction, isPending] = useActionState(
    updateUser,
    initialState,
  );

  const [isActive, setIsActive] = useState(user.active ?? true);
  const [selectedRol, setSelectedRol] = useState(user.rol);
  const [isRolOpen, setIsRolOpen] = useState(false);
  const rolRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rolRef.current && !rolRef.current.contains(event.target as Node)) {
        setIsRolOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleToggleStatus = () => {
    setIsActive((prev) => !prev);
  };

  useEffect(() => {
    // Bloquear scroll de la página de fondo
    document.body.style.overflow = "hidden";

    return () => {
      // Restaurar scroll de fondo
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (state.message === "success") {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 transition-opacity duration-300 backdrop-blur-sm custom-scrollbar">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="w-full max-w-md bg-background rounded-xl border border-foreground/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/10 bg-foreground/5">
            <h2 className="text-xl font-semibold text-foreground">
              Editar Usuario
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form action={formAction} className="p-5 space-y-4">
            <input type="hidden" name="id" value={user.id} />
            <input
              type="hidden"
              name="active"
              value={isActive ? "on" : "off"}
            />

            {state.message && state.message !== "success" && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/5 border border-red-400/20 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{state.message}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">
                ID de Usuario
              </label>
              <input
                type="text"
                value={user.id}
                disabled
                className="w-full px-3 py-2 mt-1 rounded-md border border-foreground/10 bg-foreground/5 text-foreground/80 font-mono text-sm cursor-not-allowed"
              />
              {state.errors?.id && (
                <p className="text-sm text-red-400 mt-1">{state.errors.id}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground/80"
              >
                Nombre Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                disabled={isPending}
                className="w-full px-3 py-2 mt-1 rounded-md border border-foreground/20 bg-background text-foreground transition-colors disabled:opacity-50"
              />
              {state.errors?.name && (
                <p className="text-sm text-red-400 mt-1">{state.errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground/80"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                disabled={isPending}
                className="w-full px-3 py-2 mt-1 rounded-md border border-foreground/20 bg-background text-foreground transition-colors disabled:opacity-50"
              />
              {state.errors?.email && (
                <p className="text-sm text-red-400 mt-1">
                  {state.errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground/80 block">
                  Rol del Sistema
                </label>
                {String(user.id) === String(currentUserId) && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    No editable
                  </span>
                )}
              </div>
              <input type="hidden" name="rol" value={selectedRol} />
              <div className="relative" ref={rolRef}>
                <button
                  type="button"
                  disabled={
                    isPending || String(user.id) === String(currentUserId)
                  }
                  onClick={() => setIsRolOpen(!isRolOpen)}
                  className={`mt-1 cursor-pointer w-full flex items-center justify-between bg-background/40 hover:bg-foreground/10 border text-sm rounded-xl px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isRolOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-foreground/10"} text-foreground`}
                >
                  <span className="truncate font-medium whitespace-nowrap">
                    {selectedRol === "admin"
                      ? "Administrador"
                      : "Usuario normal"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 ml-2 transition-transform ${isRolOpen ? "rotate-180 text-primary" : "text-foreground/80"}`}
                  />
                </button>

                {isRolOpen && !isPending && (
                  <div className="absolute top-full mt-1 left-0 w-full z-50 bg-black backdrop-blur-xl border border-foreground/10 rounded-xl p-1 shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
                    <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                      {[
                        { value: "user", label: "Usuario normal" },
                        { value: "admin", label: "Administrador" },
                      ].map(({ value, label }) => (
                        <button
                          type="button"
                          key={value}
                          onClick={() => {
                            setSelectedRol(value as "user" | "admin");
                            setIsRolOpen(false);
                          }}
                          className={`cursor-pointer flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground transition-colors ${selectedRol === value ? "bg-primary text-foreground font-bold hover:opacity-80" : "text-foreground/80 hover:bg-foreground/10"}`}
                        >
                          <span className="whitespace-nowrap pr-4">
                            {label}
                          </span>
                          {selectedRol === value && (
                            <Check className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {state.errors?.rol && (
                <p className="text-sm text-red-400 mt-1">{state.errors.rol}</p>
              )}
            </div>

            <div className="space-y-1 border-t border-foreground/10 pt-4 mt-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-foreground/80 block">
                      Estado de Cuenta
                    </label>
                    {String(user.id) === String(currentUserId) && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Mismo usuario
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-foreground/80">
                    {isActive
                      ? "El usuario puede acceder al sistema"
                      : "El usuario tiene bloqueado el acceso al sistema"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={
                    isPending || String(user.id) === String(currentUserId)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                    isActive ? "bg-primary" : "bg-foreground/20"
                  }`}
                >
                  <span className="sr-only">Toggle de estado</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-foreground shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              {state.errors?.active && (
                <p className="text-sm text-red-400 mt-1">
                  {state.errors.active}
                </p>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-foreground/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-foreground bg-transparent border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Guardar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
