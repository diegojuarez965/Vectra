import { NextRequest } from "next/server";
import { handlerCreateUser } from "./handler";

export async function POST(req: NextRequest) {
  return handlerCreateUser(req);
}
