import { getWeddingDatabase } from "../../../db/runtime";

type GuestRow = { id: string; max_passes: number };

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

    const { sql } = getWeddingDatabase();
    const guestRows = await sql<GuestRow>`SELECT id, max_passes FROM guests WHERE token = ${token} LIMIT 1`;
    const guest = guestRows[0];
    if (!guest) return Response.json({ error: "Invitación no encontrada." }, { status: 404 });

    const guests = payload.attending
      ? Math.min(Math.max(Number(payload.guests) || 1, 1), guest.max_passes)
      : 0;
    const message = payload.message?.trim().slice(0, 600) ?? "";

    await sql`INSERT INTO rsvps (guest_id, attending, guests_count, message, updated_at)
      VALUES (${guest.id}, ${payload.attending}, ${guests}, ${message}, CURRENT_TIMESTAMP)
      ON CONFLICT (guest_id) DO UPDATE SET
        attending = EXCLUDED.attending,
        guests_count = EXCLUDED.guests_count,
        message = EXCLUDED.message,
        updated_at = CURRENT_TIMESTAMP`;

    return Response.json({ ok: true, attending: payload.attending, guests });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar la confirmación." }, { status: 500 });
  }
}
