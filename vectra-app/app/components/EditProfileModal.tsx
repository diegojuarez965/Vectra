"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Save, AlertCircle, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/lib/actions";
import { EditProfileState } from "@/app/lib/definitions";

export default function EditProfileModal({
  user,
  onClose,
}: {
  user: {
    id: string;
    name: string;
    email?: string | null;
    image?: string | null;
  };
  onClose: () => void;
}) {
  const router = useRouter(); // Hook para navegar entre páginas
  const initialState: EditProfileState = { message: "", errors: {} }; // Estado inicial de la acción

  const currentImage =
    user.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Imagen actual del usuario
  const [previewImage, setPreviewImage] = useState<string>(currentImage); // Estado para mostrar la imagen previa
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia al input de archivo

  const [state, formAction, isPending] = useActionState(
    async (prevState: EditProfileState, formData: FormData) => {
      const result = await updateProfile(prevState, formData); // Actualiza el perfil del usuario
      // Si tuvo éxito, cerramos el modal y refrescamos la página
      if (result.message === "success") {
        router.refresh();
        onClose();
      } else {
        // Si hay un error, reseteamos la imagen y el input de archivo
        setPreviewImage(currentImage);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      return result;
    },
    initialState,
  );

  // Bloquea el scroll de la página cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Maneja el cambio de archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 transition-opacity duration-300 backdrop-blur-sm custom-scrollbar flex min-h-full items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-background rounded-xl border border-foreground/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        <div className="flex items-center justify-between p-5 border-b border-foreground/10 bg-foreground/5">
          <h2 className="text-xl font-semibold text-foreground">Mi Perfil</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={formAction} className="p-5 space-y-4">
          <input type="hidden" name="id" value={user.id} />

          {state.message && state.message !== "success" && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/5 border border-red-400/20 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-2 pb-2">
            <div
              className="relative w-24 h-24 rounded-full border-2 border-foreground/10 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Cambiar foto de perfil"
            >
              <Image
                src={previewImage}
                alt="Vista previa"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center transition-opacity duration-300">
                <Camera className="w-6 h-6 text-foreground" />
              </div>
            </div>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isPending}
            />
            <span className="text-xs text-foreground/80">
              Haz clic en la foto para cambiarla
            </span>
            {state.errors?.image && (
              <p className="text-sm text-red-400 mt-1">{state.errors.image}</p>
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
              defaultValue={user.email || ""}
              disabled={isPending}
              className="w-full px-3 py-2 mt-1 rounded-md border border-foreground/20 bg-background text-foreground transition-colors disabled:opacity-50"
            />
            {state.errors?.email && (
              <p className="text-sm text-red-400 mt-1">{state.errors.email}</p>
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
  );
}
