import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const userID = searchParams.get("userID");

    if (!token || !userID) {
      return NextResponse.json({ isSubscribed: false }, { status: 400 });
    }

    const result = await sql`
      SELECT 1 FROM fcm_tokens 
      WHERE token = ${token} AND user_id = ${userID}
    `;

    return NextResponse.json({ isSubscribed: result.length > 0 }, { status: 200 });
  } catch (error) {
    console.error("Error verificando suscripción:", error);
    return NextResponse.json({ isSubscribed: false }, { status: 500 });
  }
}
