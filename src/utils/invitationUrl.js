export const SOCIAL_PREVIEW_VERSION = "20260912";

export function createInvitationShareUrl(event, guest, origin) {
  const baseUrl = (
    origin || import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin
  ).replace(/\/$/, "");
  const url = new URL(`/evento/${event.slug}/${guest.code}`, `${baseUrl}/`);
  url.searchParams.set("v", SOCIAL_PREVIEW_VERSION);
  return url.toString();
}
