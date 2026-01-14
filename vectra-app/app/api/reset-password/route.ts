import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Faltan datos.' }, { status: 400 });
    }

    // Buscar el usuario con el token válido y no vencido
    const result = await sql`
      SELECT * FROM password_reset_tokens
      WHERE token = ${token} AND expires_at > NOW()
      LIMIT 1
    `;

    const resetEntry = result[0];
    if (!resetEntry) {
      return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña del usuario
    await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE email = ${resetEntry.email}
    `;

    // Eliminar el token usado
    await sql`
      DELETE FROM password_reset_tokens WHERE token = ${token}
    `;

    return NextResponse.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return NextResponse.json({ message: 'Error del servidor.' }, { status: 500 });
  }
}
