-- Registro de acceso por evento. Cada invitación puede utilizarse una sola vez.
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  attendees integer not null check (attendees >= 1),
  checked_in_by uuid references public.profiles(id) on delete set null,
  checked_in_at timestamptz not null default now(),
  unique (event_id, guest_id)
);

create index check_ins_event_time_idx on public.check_ins(event_id, checked_in_at desc);
create index check_ins_guest_id_idx on public.check_ins(guest_id);
create index check_ins_checked_in_by_idx on public.check_ins(checked_in_by);

alter table public.check_ins enable row level security;

create policy "check_ins_owner_select" on public.check_ins for select to authenticated
using ((select public.owns_event(event_id)) or (select public.is_super_admin()));

create policy "check_ins_owner_delete" on public.check_ins for delete to authenticated
using ((select public.owns_event(event_id)) or (select public.is_super_admin()));

-- Las altas pasan exclusivamente por register_check_in para validar plan, código y cupo.
revoke all on public.check_ins from anon, authenticated;
grant select, delete on public.check_ins to authenticated;

create or replace function public.register_check_in(p_event_id uuid, p_guest_code text, p_attendees integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_guest_id uuid;
  allowed_passes integer;
  access_allowed boolean;
  result_id uuid;
begin
  if auth.uid() is null or not (public.owns_event(p_event_id) or public.is_super_admin()) then
    raise exception 'No tienes permiso para operar este evento';
  end if;

  select
    g.id,
    g.passes,
    coalesce(((p.features || ee.feature_overrides)->>'access_control')::boolean, false)
  into target_guest_id, allowed_passes, access_allowed
  from public.guests g
  join public.events e on e.id = g.event_id
  left join public.event_entitlements ee on ee.event_id = e.id
  left join public.plans p on p.key = ee.plan_key and p.active
  where g.event_id = p_event_id
    and g.code = upper(trim(p_guest_code));

  if target_guest_id is null then raise exception 'Código de invitación no válido'; end if;
  if not coalesce(access_allowed, false) then raise exception 'El control de acceso no está habilitado para este evento'; end if;
  if p_attendees is null or p_attendees < 1 or p_attendees > allowed_passes then
    raise exception 'Número de asistentes fuera del cupo asignado';
  end if;

  insert into public.check_ins(event_id, guest_id, attendees, checked_in_by)
  values (p_event_id, target_guest_id, p_attendees, auth.uid())
  returning id into result_id;

  return result_id;
exception
  when unique_violation then
    raise exception 'Este código ya fue utilizado. No se permite una entrada duplicada';
end;
$$;

revoke all on function public.register_check_in(uuid, text, integer) from public, anon;
grant execute on function public.register_check_in(uuid, text, integer) to authenticated;
