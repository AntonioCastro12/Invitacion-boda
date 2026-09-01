-- Confirmaciones por evento y endurecimiento del álbum colaborativo.
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  status text not null check (status in ('confirmed', 'declined')),
  attendees integer not null check (attendees >= 0),
  message text not null default '' check (length(message) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, guest_id)
);

create index rsvps_event_status_idx on public.rsvps(event_id, status);
create index rsvps_guest_id_idx on public.rsvps(guest_id);
create trigger rsvps_set_updated_at before update on public.rsvps for each row execute function public.set_updated_at();
alter table public.rsvps enable row level security;

create policy "rsvps_owner_select" on public.rsvps for select to authenticated
using ((select public.owns_event(event_id)) or (select public.is_super_admin()));
create policy "rsvps_owner_update" on public.rsvps for update to authenticated
using ((select public.owns_event(event_id)) or (select public.is_super_admin()))
with check ((select public.owns_event(event_id)) or (select public.is_super_admin()));
create policy "rsvps_owner_delete" on public.rsvps for delete to authenticated
using ((select public.owns_event(event_id)) or (select public.is_super_admin()));
revoke all on public.rsvps from anon, authenticated;
grant select, update, delete on public.rsvps to authenticated;

create or replace function public.submit_rsvp(p_event_slug text, p_guest_code text, p_status text, p_attendees integer, p_message text default '')
returns uuid language plpgsql security definer set search_path = '' as $$
declare target_event_id uuid; target_guest_id uuid; allowed_passes integer; result_id uuid; rsvp_allowed boolean;
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
  if p_attendees < 0 or p_attendees > allowed_passes or (p_status = 'declined' and p_attendees <> 0) then raise exception 'Número de asistentes no válido'; end if;
  insert into public.rsvps(event_id,guest_id,status,attendees,message)
  values(target_event_id,target_guest_id,p_status,p_attendees,left(coalesce(p_message,''),1000))
  on conflict(event_id,guest_id) do update set status=excluded.status,attendees=excluded.attendees,message=excluded.message,updated_at=now()
  returning id into result_id;
  return result_id;
end; $$;
revoke all on function public.submit_rsvp(text,text,text,integer,text) from public;
grant execute on function public.submit_rsvp(text,text,text,integer,text) to anon, authenticated;

-- El bucket deja de servir URLs públicas. Las lecturas de invitados usan album-access.
update storage.buckets set public = false, file_size_limit = 10485760 where id = 'event-albums';
drop policy if exists "event_album_public_upload" on storage.objects;

create or replace function private.owns_album_object(object_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare folders text[];
begin
  folders := storage.foldername(object_name);
  if coalesce(array_length(folders,1),0) < 2 then return false; end if;
  return public.owns_event(folders[1]::uuid) or public.is_super_admin();
exception when others then return false;
end; $$;
revoke all on function private.owns_album_object(text) from public, anon;
grant execute on function private.owns_album_object(text) to authenticated;

create policy "event_album_owner_read" on storage.objects for select to authenticated
using (bucket_id = 'event-albums' and (select private.owns_album_object(name)));

-- Las rutas físicas no se exponen directamente a visitantes anónimos.
revoke execute on function public.get_public_album(text,text) from anon;
