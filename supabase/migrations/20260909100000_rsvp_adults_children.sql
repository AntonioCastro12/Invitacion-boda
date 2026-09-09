-- Confirmaciones divididas por adultos y niños.
alter table public.rsvps
  add column if not exists adults integer not null default 0 check (adults >= 0),
  add column if not exists children integer not null default 0 check (children >= 0);

-- Conserva como adultos los asistentes registrados antes de este desglose.
update public.rsvps
set adults = attendees
where status = 'confirmed' and adults = 0 and children = 0 and attendees > 0;

-- La versión anterior de submit_rsvp recibía un total único; se reemplaza por desglose.
drop function if exists public.submit_rsvp(text,text,text,integer,text);

create or replace function public.submit_rsvp(
  p_event_slug text,
  p_guest_code text,
  p_status text,
  p_adults integer,
  p_children integer default 0,
  p_message text default ''
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  target_event_id uuid;
  target_guest_id uuid;
  allowed_passes integer;
  result_id uuid;
  total_attendees integer;
  rsvp_allowed boolean;
begin
  select e.id, g.id, g.passes,
    coalesce(((p.features || ee.feature_overrides)->>'form_rsvp')::boolean,false)
    or coalesce(((p.features || ee.feature_overrides)->>'database_rsvp')::boolean,false)
    into target_event_id, target_guest_id, allowed_passes, rsvp_allowed
  from public.events e join public.guests g on g.event_id = e.id
  left join public.event_entitlements ee on ee.event_id = e.id
  left join public.plans p on p.key = ee.plan_key
  where e.slug = lower(trim(p_event_slug)) and g.code = upper(trim(p_guest_code));
  if target_event_id is null or not coalesce(rsvp_allowed,false) or p_status not in ('confirmed','declined') then raise exception 'Invitación no válida'; end if;

  total_attendees := coalesce(p_adults, 0) + coalesce(p_children, 0);
  if p_adults < 0 or p_children < 0 or total_attendees > allowed_passes
     or (p_status = 'confirmed' and total_attendees < 1)
     or (p_status = 'declined' and (p_adults <> 0 or p_children <> 0)) then
    raise exception 'Número de asistentes no válido';
  end if;

  insert into public.rsvps(event_id,guest_id,status,attendees,adults,children,message)
  values(target_event_id,target_guest_id,p_status,total_attendees,coalesce(p_adults,0),coalesce(p_children,0),left(coalesce(p_message,''),1000))
  on conflict(event_id,guest_id) do update set
    status=excluded.status,attendees=excluded.attendees,adults=excluded.adults,children=excluded.children,
    message=excluded.message,updated_at=now()
  returning id into result_id;
  return result_id;
end; $$;
revoke all on function public.submit_rsvp(text,text,text,integer,integer,text) from public;
grant execute on function public.submit_rsvp(text,text,text,integer,integer,text) to anon, authenticated;

comment on column public.rsvps.adults is 'Adultos confirmados por la familia';
comment on column public.rsvps.children is 'Niños confirmados por la familia';
