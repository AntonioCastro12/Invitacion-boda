import { getGuest, saveRsvp } from "../../../db/runtime";

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

    const guest = await getGuest(token);
    if (!guest) return Response.json({ error: "Invitación no encontrada." }, { status: 404 });

    const guests = payload.attending
      ? Math.min(Math.max(Number(payload.guests) || 1, 1), guest.max_passes)
      : 0;

    await saveRsvp(token, {
      attending: payload.attending,
      guests_count: guests,
      message: payload.message?.trim().slice(0, 600) ?? "",
      updated_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, attending: payload.attending, guests });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible guardar la confirmación." }, { status: 500 });
  }
}
