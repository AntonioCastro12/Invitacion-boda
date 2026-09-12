-- Borrado definitivo de recuerdos del álbum digital.
-- Los anfitriones (dueño del evento o super_admin) pueden eliminar cualquier
-- recuerdo; cada invitado puede eliminar únicamente los que él mismo publicó.
-- La función borra la fila de album_photos y el objeto de Storage en un solo paso.
create or replace function public.delete_album_photo(
  p_event_slug text,
  p_photo_id uuid,
  p_guest_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event_id uuid;
  target_guest_id uuid;
  photo_event_id uuid;
  photo_guest_id uuid;
  photo_storage_path text;
  is_owner boolean;
begin
  select id
    into target_event_id
  from public.events
  where slug = lower(trim(p_event_slug));

  if target_event_id is null then
    raise exception 'Evento no válido';
  end if;

  is_owner := public.owns_event(target_event_id) or public.is_super_admin();

  if not is_owner then
    if p_guest_code is null or trim(p_guest_code) = '' then
      raise exception 'No autorizado';
    end if;
    select id
      into target_guest_id
    from public.guests
    where event_id = target_event_id
      and code = upper(trim(p_guest_code));
    if target_guest_id is null then
      raise exception 'Invitación no válida';
    end if;
  end if;

  select event_id, guest_id, storage_path
    into photo_event_id, photo_guest_id, photo_storage_path
  from public.album_photos
  where id = p_photo_id;

  if photo_event_id is null or photo_event_id <> target_event_id then
    raise exception 'El recuerdo no pertenece a este evento';
  end if;

  if not is_owner and photo_guest_id is distinct from target_guest_id then
    raise exception 'Solo podrás borrar tus propios recuerdos';
  end if;

  delete from storage.objects
  where bucket_id = 'event-albums' and name = photo_storage_path;

  delete from public.album_photos
  where id = p_photo_id;

  return true;
end;
$$;

revoke all on function public.delete_album_photo(text, uuid, text) from public;
grant execute on function public.delete_album_photo(text, uuid, text) to anon, authenticated;

comment on function public.delete_album_photo(text, uuid, text) is
'Borra definitivamente un recuerdo del álbum: fila de album_photos y objeto de Storage.';