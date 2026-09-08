const DATABASE_NAME = "rcm-invitaciones-local";
const DATABASE_VERSION = 1;
const STORE_NAME = "album_photos";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/quicktime",
]);

const maxSizeFor = (file) => file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error("Este navegador no permite guardar fotografías localmente."));
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("albumKey", "albumKey", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

function complete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function listLocalPhotos(albumKey) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).index("albumKey").getAll(albumKey);
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export async function saveLocalPhotos(albumKey, files, author) {
  const media = Array.from(files);
  if (!media.length) return [];
  if (media.some((file) => !ALLOWED_TYPES.has(file.type) || file.size > maxSizeFor(file))) throw new Error("Cada foto puede pesar hasta 10 MB y cada video hasta 25 MB.");
  const records = media.map((file) => ({ id: crypto.randomUUID(), albumKey, author, name: file.name, type: file.type, size: file.size, createdAt: new Date().toISOString(), blob: file }));
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  records.forEach((record) => store.add(record));
  await complete(transaction);
  database.close();
  return records;
}

export async function deleteLocalPhoto(photoId) {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(photoId);
  await complete(transaction);
  database.close();
}

export const localAlbumLimits = { maxItems: null, maxImageSize: MAX_IMAGE_SIZE, maxVideoSize: MAX_VIDEO_SIZE };
