import { getAdminAccess } from "../../../admin/admin-auth";
import { ensureWeddingSchema, getD1 } from "../../../../db/runtime";

type GuestSummary = {
  id: number;
  token: string;
  name: string;
  max_passes: number;
  attending: number | null;
  guests_count: number | null;
  checked_in_at: string | null;
  created_at: string;
};

export async function GET() {
  const access = await getAdminAccess();
  if (!access.user) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  if (!access.isAllowed) return Response.json({ error: "Tu cuenta no tiene acceso al panel." }, { status: 403 });

  try {
    await ensureWeddingSchema();
    const result = await getD1().prepare(`SELECT
      g.id, g.token, g.name, g.max_passes, g.created_at,
      r.attending, r.guests_count, c.checked_in_at
      FROM guests g
      LEFT JOIN rsvps r ON r.guest_id = g.id
      LEFT JOIN check_ins c ON c.guest_id = g.id
      ORDER BY g.created_at DESC, g.id DESC`)
      .all<GuestSummary>();
    const guests = result.results ?? [];
    const stats = guests.reduce((totals, guest) => ({
      invitations: totals.invitations + 1,
      invited: totals.invited + guest.max_passes,
      confirmed: totals.confirmed + (guest.attending ? guest.guests_count ?? 0 : 0),
      pending: totals.pending + (guest.attending === null ? 1 : 0),
      declined: totals.declined + (guest.attending === 0 ? 1 : 0),
      checkIns: totals.checkIns + (guest.checked_in_at ? 1 : 0),
    }), { invitations: 0, invited: 0, confirmed: 0, pending: 0, declined: 0, checkIns: 0 });

    return Response.json({ stats, guests });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible cargar el panel." }, { status: 500 });
  }
}
