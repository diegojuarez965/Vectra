import { NextRequest } from "next/server";
import {
  handlerCreateUser,
  handlerGetUsers,
  handlerUpdateUser,
} from "./handler";

export async function POST(req: NextRequest) {
  return handlerCreateUser(req);
}

export async function GET(req: NextRequest) {
  return handlerGetUsers(req);
}

export async function PUT(req: NextRequest) {
  return handlerUpdateUser(req);
}
