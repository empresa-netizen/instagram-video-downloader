import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { cookieName, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = process.env.LOGIN_PASSWORD || "";
  if (typeof password !== "string" || !expected || password.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected))) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, createSession(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
