import { getGuest, getRsvp } from "../../../../db/runtime";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const guest = await getGuest(token);
    if (!guest) return Response.json({ error: "Invitación no encontrada." }, { status: 404 });

    const rsvp = await getRsvp(token);
    return Response.json({
      guest: {
        name: guest.name,
        passes: guest.max_passes,
        token: guest.token,
        rsvp: rsvp ? {
          attending: rsvp.attending,
          guests: rsvp.guests_count,
        } : null,
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible abrir la invitación." }, { status: 500 });
  }
}
