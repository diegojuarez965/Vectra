"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { User, EditUserState } from "@/app/lib/definitions";
import { X, Save, AlertCircle, ChevronDown, Check } from "lucide-react";
import { updateUser } from "@/app/lib/actions";
import Image from "next/image";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const initialState: EditUserState = { message: "", errors: {} };
  const [state, formAction, isPending] = useActionState(
    updateUser,
    initialState,
  );

  const [isActive, setIsActive] = useState(user.active); // Estado para indicar si el usuario está activo
  const [isImageDelete, setIsImageDelete] = useState(false); // Estado para indicar si se debe eliminar la imagen
  const [isEnlarged, setIsEnlarged] = useState(false); // Estado para indicar si la imagen está ampliada
  const [selectedRol, setSelectedRol] = useState(user.rol); // Estado para indicar el rol seleccionado
  const [isRolOpen, setIsRolOpen] = useState(false); // Estado para indicar si el dropdown de rol está abierto
  const rolRef = useRef<HTMLDivElement>(null); // Referencia al elemento del dropdown de rol

  // Al cargar la página bloqueamos el scroll de la página de fondo
  useEffect(() => {
    // Bloquear scroll de la página de fondo
    document.body.style.overflow = "hidden";

    return () => {
      // Restaurar scroll de fondo
      document.body.style.overflow = "";
    };
  }, []);

  // Al cargar la página cargamos la función para manejar el cierre del dropdown de rol al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rolRef.current && !rolRef.current.contains(event.target as Node)) {
        setIsRolOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Si la acción del formulario es exitosa, cerramos el modal y recargamos la lista de usuarios
  useEffect(() => {
    if (state.message === "success") {
      onSuccess();
    }
  }, [state, onSuccess]);

  // Manejar cierre de imagen ampliada con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEnlarged) {
        setIsEnlarged(false);
      }
    };
    if (isEnlarged) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEnlarged]);

  return (
    <>
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
              {/* Campo para mostrar state.message */}
              {state.message && state.message !== "success" && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/5 border border-red-400/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{state.message}</span>
                </div>
              )}

              {/* Avatar Viewer/Deleter */}
              <input
                type="hidden"
                name="imageDelete"
                value={isImageDelete ? "true" : "false"}
              />
              {user.image_url && !isImageDelete && (
                <div className="space-y-1 pb-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Avatar del Usuario
                  </label>
                  <div className="flex items-center gap-5 mt-3">
                    <div
                      className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden cursor-pointer border-2 border-primary/20 hover:border-primary/50 hover:opacity-90 transition-all focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary shadow-sm hover:shadow-md"
                      onClick={() => setIsEnlarged(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setIsEnlarged(true);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="Agrandar imagen"
                    >
                      <Image
                        src={user.image_url}
                        alt="Avatar del usuario"
                        className="object-cover"
                        sizes="80px"
                        fill
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsImageDelete(true)}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-primary rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Eliminar imagen
                    </button>
                  </div>
                </div>
              )}
              {user.image_url && isImageDelete && (
                <div className="space-y-1 pb-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Avatar del Usuario
                  </label>
                  <div className="text-sm text-primary mt-2 bg-primary/5 p-3 rounded-lg border border-primary/20 flex items-center justify-between">
                    <span>La imagen será eliminada al guardar.</span>
                    <button
                      type="button"
                      onClick={() => setIsImageDelete(false)}
                      disabled={isPending}
                      className="tflex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-primary rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Deshacer
                    </button>
                  </div>
                </div>
              )}
              {!user.image_url && (
                <div className="space-y-1 pb-2">
                  <label className="text-sm font-medium text-foreground/80">
                    Avatar del Usuario
                  </label>
                  <div className="text-sm text-foreground/80 mt-1 italic">
                    El usuario no tiene una imagen configurada.
                  </div>
                </div>
              )}

              {state.errors?.imageDelete && (
                <p className="text-sm text-red-400 mt-1">
                  {state.errors.imageDelete}
                </p>
              )}

              {/* ID de Usuario */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">
                  ID de Usuario
                </label>
                <input
                  type="text"
                  name="id"
                  value={user.id}
                  readOnly
                  className="w-full px-3 py-2 mt-1 rounded-md border border-foreground/10 bg-foreground/5 text-foreground/80 font-mono text-sm cursor-not-allowed outline-none"
                />
                {state.errors?.id && (
                  <p className="text-sm text-red-400 mt-1">{state.errors.id}</p>
                )}
              </div>

              {/* Nombre Completo */}
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
                  <p className="text-sm text-red-400 mt-1">
                    {state.errors.name}
                  </p>
                )}
              </div>

              {/* Correo Electrónico */}
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

              {/* Rol del Sistema */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground/80 block">
                    Rol del Sistema
                  </label>
                </div>
                <input type="hidden" name="rol" value={selectedRol} />
                <div className="relative" ref={rolRef}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setIsRolOpen(!isRolOpen)}
                    className={`mt-1 cursor-pointer w-full flex items-center justify-between bg-background/40 hover:bg-foreground/10 border text-sm rounded-xl px-4 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isRolOpen ? "border-primary/50 ring-1 ring-primary/20" : "border-foreground/10"} text-foreground`}
                  >
                    <span className="truncate font-medium foregroundspace-nowrap">
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
                            <span className="foregroundspace-nowrap pr-4">
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
                  <p className="text-sm text-red-400 mt-1">
                    {state.errors.rol}
                  </p>
                )}
              </div>

              {/* Estado de Cuenta */}
              <div className="space-y-1 border-t border-foreground/10 pt-4 mt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-foreground/80 block">
                        Estado de Cuenta
                      </label>
                    </div>
                    <span className="text-xs text-foreground/80">
                      {isActive
                        ? "El usuario puede acceder al sistema"
                        : "El usuario tiene bloqueado el acceso al sistema"}
                    </span>
                  </div>
                  <label
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-all duration-200 ease-in-out has-focus-visible:outline-2 has-focus-visible:outline-primary has-focus-visible:outline-offset-2 ${
                      isPending
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${isActive ? "bg-primary" : "bg-foreground/20"}`}
                  >
                    <input
                      type="checkbox"
                      name="active"
                      value="true"
                      className="sr-only peer "
                      checked={isActive}
                      onChange={() => setIsActive(!isActive)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setIsActive((prev) => !prev);
                        }
                      }}
                      disabled={isPending}
                    />
                    <span className="sr-only">Toggle de estado</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-foreground shadow ring-0 transition duration-200 ease-in-out ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </label>
                </div>
                {state.errors?.active && (
                  <p className="text-sm text-red-400 mt-1">
                    {state.errors.active}
                  </p>
                )}
              </div>

              {/* Botones de Acción */}
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-primary rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
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

      {/* Imagen ampliada */}
      {isEnlarged && user.image_url && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm transition-all"
          onClick={() => setIsEnlarged(false)}
          role="dialog"
          aria-label="Imagen ampliada"
        >
          <div className="relative w-full max-w-4xl h-[85vh] p-4 flex flex-col items-center justify-center">
            <div className="relative w-full h-full">
              <Image
                src={user.image_url}
                alt="Avatar ampliado"
                className="object-contain drop-shadow-2xl animate-in zoom-in duration-200"
                fill
              />
            </div>
            <span className="text-foreground/70 text-sm mt-6 tracking-wide font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
              Click en cualquier lugar para cerrar
            </span>
          </div>
        </div>
      )}
    </>
  );
}
