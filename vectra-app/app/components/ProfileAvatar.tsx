"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileAvatarProps {
  userId: string;
  userName: string;
  imageUrl?: string | null;
}

export default function ProfileAvatar({ userId, userName, imageUrl }: ProfileAvatarProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const currentImage = imageUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona una imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`/api/users/${userId}/avatar`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al subir la imagen");
      }

      // Force a router refresh to update the session and server components
      router.refresh();
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
      alert(msg);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-4">
      <div 
        className="relative w-24 h-24 rounded-full border-2 border-foreground/10 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-primary"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
      >
        <Image 
          src={currentImage} 
          alt={`Avatar de ${userName}`}
          fill
          className="object-cover"
        />
        
        {/* Overlay Camera Icon */}
        <div className={`absolute inset-0 bg-black/50 flex flex-col justify-center items-center transition-opacity duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <>
              <Camera className="w-6 h-6 text-white" />
              <span className="text-[10px] text-white mt-1 font-semibold uppercase tracking-wider">Cambiar</span>
            </>
          )}
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      <div className="text-center">
        <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{userName}</p>
      </div>
    </div>
  );
}
