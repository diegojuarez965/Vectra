import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToStorage(
  fileBuffer: Buffer,
  fileName: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Cloudinary admite la subida directa de buffers a través de streams
    const publicId = fileName.split("/").pop()?.split(".")[0];
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        public_id: publicId,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url || "");
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl.includes("res.cloudinary.com")) {
      console.warn("La imagen no es de Cloudinary. Omitiendo borrado.");
      return true;
    }

    // Extraer el public_id de la URL de Cloudinary
    // Ejemplo: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
    const uploadIndex = imageUrl.indexOf("/upload/");
    if (uploadIndex === -1) return false;

    const path = imageUrl.substring(uploadIndex + 8); // Saltamos "/upload/"

    const parts = path.split("/");
    // Si la primera parte coincide con la versión (v + dígitos), la removemos
    if (parts.length > 0 && /^v\d+$/.test(parts[0])) {
      parts.shift();
    }

    // Reconstruimos la ruta y removemos la extensión
    const pathWithoutVersion = parts.join("/");
    const extensionIndex = pathWithoutVersion.lastIndexOf(".");
    const publicId = extensionIndex !== -1 ? pathWithoutVersion.substring(0, extensionIndex) : pathWithoutVersion;

    console.log("Eliminando publicId de Cloudinary:", publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error eliminando la imagen de Cloudinary:", error);
    return false;
  }
}
