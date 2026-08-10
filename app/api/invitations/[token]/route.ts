import { ensureWeddingSchema, getD1 } from "../../../../db/runtime";

type GuestRow = {
  id: number;
  token: string;
  name: string;
  max_passes: number;
  attending: number | null;
  guests_count: number | null;
};

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    await ensureWeddingSchema();
    const { token } = await context.params;
    const guest = await getD1().prepare(`SELECT
      g.id, g.token, g.name, g.max_passes, r.attending, r.guests_count
      FROM guests g
      LEFT JOIN rsvps r ON r.guest_id = g.id
      WHERE g.token = ?`)
      .bind(token)
      .first<GuestRow>();

    if (!guest) return Response.json({ error: "Invitación no encontrada." }, { status: 404 });

    return Response.json({
      guest: {
        name: guest.name,
        passes: guest.max_passes,
        token: guest.token,
        rsvp: guest.attending === null ? null : {
          attending: Boolean(guest.attending),
          guests: guest.guests_count ?? 0,
        },
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible abrir la invitación." }, { status: 500 });
  }
}
