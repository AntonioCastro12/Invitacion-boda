import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "wedding_admin_session";
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "local-wedding-admin-session-only";
  throw new Error("Falta configurar ADMIN_SESSION_SECRET en Netlify.");
}

function signature(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createAdminSession() {
  const expiresAt = String(Date.now() + ADMIN_SESSION_SECONDS * 1000);
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function verifyAdminSession(value?: string) {
  if (!value) return false;
  const [expiresAt, receivedSignature, extra] = value.split(".");
  if (!expiresAt || !receivedSignature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Date.now()) return false;

  try {
    return safeEqual(receivedSignature, signature(expiresAt));
  } catch {
    return false;
  }
}

export function verifyAdminPassword(value: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(signature(`password:${value}`), signature(`password:${expected}`));
}

export function hasAdminConfiguration() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim() && process.env.ADMIN_SESSION_SECRET?.trim());
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ADMIN_SESSION_SECONDS,
};
