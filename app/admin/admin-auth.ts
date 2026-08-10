import { headers } from "next/headers";
import { getChatGPTUser, type ChatGPTUser } from "../chatgpt-auth";
import { getAdminAllowlist } from "../../db/runtime";

export type AdminAccess = {
  user: ChatGPTUser | null;
  isLocal: boolean;
  isAllowed: boolean;
};

export async function getAdminAccess(): Promise<AdminAccess> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

  if (isLocal) {
    return {
      isLocal: true,
      isAllowed: true,
      user: {
        userId: "local-admin",
        displayName: "Administrador local",
        email: "local@invitacion.test",
        fullName: "Administrador local",
      },
    };
  }

  const user = await getChatGPTUser();
  if (!user) return { user: null, isLocal: false, isAllowed: false };

  const allowlist = getAdminAllowlist();
  const isAllowed = allowlist.length === 0 || allowlist.includes(user.email.toLowerCase());
  return { user, isLocal: false, isAllowed };
}
