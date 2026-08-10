import { getStore } from "@netlify/blobs";

export type WeddingGuest = {
  id: string;
  token: string;
  name: string;
  max_passes: number;
  created_at: string;
};

export type WeddingRsvp = {
  attending: boolean;
  guests_count: number;
  message: string;
  updated_at: string;
};

export type WeddingCheckIn = {
  scanned_by: string;
  checked_in_at: string;
};

export type WeddingAlbumPhoto = {
  id: string;
  guest_token: string;
  uploader: string;
  object_key: string;
  filename: string;
  content_type: string;
  status: "approved";
  created_at: string;
};

const demoGuest: WeddingGuest = {
  id: "demo-familia-castro-cuevas",
  token: "familia-castro-cuevas",
  name: "Familia Castro Cuevas",
  max_passes: 4,
  created_at: "2026-01-01T00:00:00.000Z",
};

function getWeddingStateStore() {
  return getStore({ name: "wedding-data", consistency: "strong" });
}

export function getWeddingAlbumStore() {
  return getStore({ name: "wedding-album", consistency: "strong" });
}

async function getJSON<T>(key: string): Promise<T | null> {
  return await getWeddingStateStore().get(key, { type: "json" }) as T | null;
}

async function listJSON<T>(prefix: string): Promise<T[]> {
  const store = getWeddingStateStore();
  const { blobs } = await store.list({ prefix });
  const records = await Promise.all(blobs.map((blob) => store.get(blob.key, { type: "json" }))) as Array<T | null>;
  return records.filter((record) => record !== null) as T[];
}

export async function getGuest(token: string) {
  if (token === demoGuest.token) return demoGuest;
  return getJSON<WeddingGuest>(`guests/${token}`);
}

export async function listGuests() {
  const guests = await listJSON<WeddingGuest>("guests/");
  return [demoGuest, ...guests.filter((guest) => guest.token !== demoGuest.token)]
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
}

export async function saveGuest(guest: WeddingGuest) {
  await getWeddingStateStore().setJSON(`guests/${guest.token}`, guest);
}

export async function removeGuest(token: string) {
  const store = getWeddingStateStore();
  await Promise.all([
    store.delete(`guests/${token}`),
    store.delete(`rsvps/${token}`),
    store.delete(`check-ins/${token}`),
  ]);
}

export async function getRsvp(token: string) {
  return getJSON<WeddingRsvp>(`rsvps/${token}`);
}

export async function saveRsvp(token: string, rsvp: WeddingRsvp) {
  await getWeddingStateStore().setJSON(`rsvps/${token}`, rsvp);
}

export async function getCheckIn(token: string) {
  return getJSON<WeddingCheckIn>(`check-ins/${token}`);
}

export async function createCheckIn(token: string, checkIn: WeddingCheckIn) {
  const previous = await getCheckIn(token);
  if (previous) return false;
  await getWeddingStateStore().setJSON(`check-ins/${token}`, checkIn);
  return true;
}

export async function listAlbumPhotos() {
  return listJSON<WeddingAlbumPhoto>("album-meta/");
}

export async function getAlbumPhoto(id: string) {
  return getJSON<WeddingAlbumPhoto>(`album-meta/${id}`);
}

export async function saveAlbumPhoto(photo: WeddingAlbumPhoto) {
  await getWeddingStateStore().setJSON(`album-meta/${photo.id}`, photo);
}

export async function removeAlbumPhoto(id: string) {
  await getWeddingStateStore().delete(`album-meta/${id}`);
}
