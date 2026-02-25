import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import postgres from "postgres";
import crypto from "crypto";
import { ForgotPasswordSchema } from "@/app/lib/schemas";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Envia un correo de recuperación de contraseña
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validamos los parámetros
    const validatedData = ForgotPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      const errorMessage = validatedData.error.flatten().fieldErrors.email?.[0];
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { email } = validatedData.data;

    // Verificamos si el usuario existe
    const user = await sql`SELECT * FROM users WHERE email = ${email}`;

    // Si no existe, NO lanzamos error para no dar información a atacantes
    if (!user.length) {
      console.log(`Intento de recuperación para email no registrado: ${email}`);
      return NextResponse.json({ message: "Correo procesado" });
    }

    // Generamos token y expiración
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    // Guardamos el token
    await sql`
      INSERT INTO password_reset_tokens (email, token, expires_at)
      VALUES (${email}, ${token}, ${expiresAt})
    `;

    // Enviamos el correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de contraseña",
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña. El enlace vencerá en 1 hora: ${resetLink}`,
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña. El enlace vencerá en 1 hora:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la solicitud" },
      { status: 500 },
    );
  }
}
