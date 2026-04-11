import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function uploadImageToS3(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME as string;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Devuelve la URL pública de la imagen subida
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

export async function deleteImageFromS3(imageUrl: string): Promise<boolean> {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME as string;
    const region = process.env.AWS_REGION || "us-east-1";
    const baseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;

    const key = imageUrl.replace(baseUrl, "");

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error eliminando la imagen de S3:", error);
    return false;
  }
}
