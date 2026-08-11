const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateGuestCode(length = 8) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}
