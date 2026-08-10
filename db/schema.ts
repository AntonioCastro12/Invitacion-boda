import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const guests = sqliteTable(
  "guests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    token: text("token").notNull(),
    name: text("name").notNull(),
    maxPasses: integer("max_passes").notNull().default(1),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_guests_token").on(table.token)],
);

export const rsvps = sqliteTable(
  "rsvps",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    guestId: integer("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
    attending: integer("attending", { mode: "boolean" }).notNull(),
    guestsCount: integer("guests_count").notNull().default(0),
    message: text("message").notNull().default(""),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_rsvps_guest_id").on(table.guestId)],
);

export const checkIns = sqliteTable(
  "check_ins",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    guestId: integer("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
    scannedBy: text("scanned_by").notNull(),
    checkedInAt: text("checked_in_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("idx_check_ins_guest_id").on(table.guestId)],
);

export const albumPhotos = sqliteTable(
  "album_photos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    guestId: integer("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
    objectKey: text("object_key").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    status: text("status").notNull().default("approved"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_album_photos_object_key").on(table.objectKey),
    index("idx_album_photos_status_created_at").on(table.status, table.createdAt),
  ],
);
