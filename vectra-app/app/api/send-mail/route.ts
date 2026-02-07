import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import postgres from "postgres";
import crypto from "crypto";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  // Verificamos si el usuario existe
  const user = await sql`SELECT * FROM users WHERE email = ${email}`;
  if (!user.length) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 },
    );
  }
  // Generamos un token de recuperación
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

  // Guardamos el token en la base de datos
  await sql`
      INSERT INTO password_reset_tokens (email, token, expires_at)
      VALUES (${email}, ${token}, ${expiresAt})
    `;

  // Creamos el enlace de recuperación y enviamos el correo
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

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return NextResponse.json(
      { error: "Error al enviar correo" },
      { status: 500 },
    );
  }
}
