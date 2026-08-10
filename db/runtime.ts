import { env } from "cloudflare:workers";

type RuntimeBindings = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
  ADMIN_EMAILS?: string;
};

let schemaReady: Promise<void> | null = null;

export function getD1(): D1Database {
  const database = (env as unknown as RuntimeBindings).DB;
  if (!database) throw new Error("La base de datos de invitados no está disponible.");
  return database;
}

export function getMediaBucket(): R2Bucket {
  const bucket = (env as unknown as RuntimeBindings).MEDIA;
  if (!bucket) throw new Error("El almacenamiento del álbum no está disponible.");
  return bucket;
}

export function getAdminAllowlist(): string[] {
  const value = (env as unknown as RuntimeBindings).ADMIN_EMAILS ?? "";
  return value.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

export async function ensureWeddingSchema(): Promise<void> {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const db = getD1();
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        max_passes INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS rsvps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id INTEGER NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
        attending INTEGER NOT NULL,
        guests_count INTEGER NOT NULL DEFAULT 0,
        message TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS check_ins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id INTEGER NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
        scanned_by TEXT NOT NULL,
        checked_in_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS album_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
        object_key TEXT NOT NULL UNIQUE,
        filename TEXT NOT NULL,
        content_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'approved',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_album_photos_status_created_at ON album_photos(status, created_at)"),
      db.prepare("INSERT OR IGNORE INTO guests (token, name, max_passes) VALUES (?, ?, ?)")
        .bind("familia-castro-cuevas", "Familia Castro Cuevas", 4),
      db.prepare("PRAGMA optimize"),
    ]);
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}
