import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, checkPassword, createSessionToken, sessionCookieOptions, verifySessionToken } from "@/lib/auth";

export async function GET() {
  const jar = await cookies();
  const ok = await verifySessionToken(jar.get(AUTH_COOKIE)?.value);
  return NextResponse.json({ authenticated: ok });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!body.password || !checkPassword(body.password)) {
    return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 });
  }
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
