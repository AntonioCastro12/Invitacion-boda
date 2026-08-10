import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  hasAdminConfiguration,
  verifyAdminPassword,
} from "../../../admin/admin-session";

export async function POST(request: Request) {
  if (!hasAdminConfiguration()) {
    return NextResponse.json({ error: "Configura ADMIN_PASSWORD y ADMIN_SESSION_SECRET en Netlify." }, { status: 503 });
  }

  const payload = await request.json().catch(() => ({})) as { password?: string };
  if (!verifyAdminPassword(payload.password ?? "")) {
    return NextResponse.json({ error: "La contraseña no es correcta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSession(), adminCookieOptions);
  return response;
}
