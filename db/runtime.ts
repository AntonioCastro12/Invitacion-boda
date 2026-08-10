import { getStore } from "@netlify/blobs";
import { getDatabase } from "@netlify/database";

export function getWeddingDatabase() {
  return getDatabase();
}

export function getWeddingAlbumStore() {
  return getStore({ name: "wedding-album", consistency: "strong" });
}
