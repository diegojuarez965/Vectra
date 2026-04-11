"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

export default function ProfileAvatar({
  user,
}: {
  user: {
    id: string;
    name: string;
    email?: string | null;
    image?: string | null;
  };
}) {
  const [isHovering, setIsHovering] = useState(false); // Estado para mostrar/ocultar el icono de usuario
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para mostrar/ocultar el modal

  const currentImage =
    user.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Imagen actual del usuario

  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <div
          className="relative w-24 h-24 rounded-full border-2 border-foreground/10 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-primary"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsModalOpen(true);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Mi Perfil"
        >
          <Image
            src={currentImage}
            alt={`Avatar de ${user.name}`}
            fill
            className="object-cover"
          />

          <div
            className={`absolute inset-0 bg-black/50 flex flex-col justify-center items-center transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}
          >
            <User className="w-6 h-6 text-foreground" />
            <span className="text-[10px] text-foreground mt-1 font-semibold uppercase tracking-wider">
              Mi Perfil
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-foreground truncate max-w-[150px]">
            {user.name}
          </p>
        </div>
      </div>

      {isModalOpen && (
        <EditProfileModal user={user} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
