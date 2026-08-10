import { getWeddingDatabase } from "../../../../db/runtime";

type GuestRow = {
  id: string;
  token: string;
  name: string;
  max_passes: number;
  attending: boolean | null;
  guests_count: number | null;
};

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const { sql } = getWeddingDatabase();
    const rows = await sql<GuestRow>`SELECT
      g.id, g.token, g.name, g.max_passes, r.attending, r.guests_count
      FROM guests g
      LEFT JOIN rsvps r ON r.guest_id = g.id
      WHERE g.token = ${token}
      LIMIT 1`;
    const guest = rows[0];

    if (!guest) return Response.json({ error: "Invitación no encontrada." }, { status: 404 });

    return Response.json({
      guest: {
        name: guest.name,
        passes: guest.max_passes,
        token: guest.token,
        rsvp: guest.attending === null ? null : {
          attending: guest.attending,
          guests: guest.guests_count ?? 0,
        },
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible abrir la invitación." }, { status: 500 });
  }
}
