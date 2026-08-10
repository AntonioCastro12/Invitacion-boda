import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, hasAdminConfiguration, verifyAdminSession } from "./admin-session";

export type AdminUser = {
  userId: string;
  displayName: string;
  email: string;
};

export type AdminAccess = {
  user: AdminUser | null;
  isLocal: boolean;
  isAllowed: boolean;
};

export async function getAdminAccess(): Promise<AdminAccess> {
  const isLocal = process.env.NODE_ENV !== "production";
  const localWithoutPassword = isLocal && !hasAdminConfiguration();
  const cookieStore = await cookies();
  const hasSession = verifyAdminSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!localWithoutPassword && !hasSession) {
    return { user: null, isLocal, isAllowed: false };
  }

  return {
    isLocal,
    isAllowed: true,
    user: {
      userId: "wedding-admin",
      displayName: isLocal ? "Administrador local" : "Administrador",
      email: "admin@invitacion-boda.local",
    },
  };
}
