import { ensureWeddingSchema, getD1 } from "../../../db/runtime";

type GuestRow = { id: number; max_passes: number };

export async function POST(request: Request) {
  try {
    const payload = await request.json() as {
      token?: string;
      attending?: boolean;
      guests?: number;
      message?: string;
    };
    const token = payload.token?.trim() ?? "";
    if (!token || typeof payload.attending !== "boolean") {
      return Response.json({ error: "La confirmación está incompleta." }, { status: 400 });
    }

    await ensureWeddingSchema();
    const db = getD1();
    const guest = await db.prepare("SELECT id, max_passes FROM guests WHERE token = ?")
      .bind(token)
      .first<GuestRow>();
    if (!guest) return Response.json({ error: "Invitación no encontrada." }, { status: 404 });

    const guests = payload.attending
      ? Math.min(Math.max(Number(payload.guests) || 1, 1), guest.max_passes)
      : 0;
    const message = payload.message?.trim().slice(0, 600) ?? "";

    await db.prepare(`INSERT INTO rsvps (guest_id, attending, guests_count, message, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(guest_id) DO UPDATE SET
        attending = excluded.attending,
        guests_count = excluded.guests_count,
        message = excluded.message,
        updated_at = CURRENT_TIMESTAMP`)
      .bind(guest.id, payload.attending ? 1 : 0, guests, message)
      .run();

    return Response.json({ ok: true, attending: payload.attending, guests });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar la confirmación." }, { status: 500 });
  }
}
