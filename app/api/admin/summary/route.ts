import { getAdminAccess } from "../../../admin/admin-auth";
import { getCheckIn, getRsvp, listGuests } from "../../../../db/runtime";

export async function GET() {
  const access = await getAdminAccess();
  if (!access.user) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });

  try {
    const records = await listGuests();
    const guests = await Promise.all(records.map(async (guest) => {
      const [rsvp, checkIn] = await Promise.all([getRsvp(guest.token), getCheckIn(guest.token)]);
      return {
        ...guest,
        attending: rsvp?.attending ?? null,
        guests_count: rsvp?.guests_count ?? null,
        checked_in_at: checkIn?.checked_in_at ?? null,
      };
    }));

    const stats = guests.reduce((totals, guest) => ({
      invitations: totals.invitations + 1,
      invited: totals.invited + guest.max_passes,
      confirmed: totals.confirmed + (guest.attending ? guest.guests_count ?? 0 : 0),
      pending: totals.pending + (guest.attending === null ? 1 : 0),
      declined: totals.declined + (guest.attending === false ? 1 : 0),
      checkIns: totals.checkIns + (guest.checked_in_at ? 1 : 0),
    }), { invitations: 0, invited: 0, confirmed: 0, pending: 0, declined: 0, checkIns: 0 });

    return Response.json({ stats, guests });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible cargar el panel." }, { status: 500 });
  }
}
