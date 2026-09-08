-- Amplía el álbum privado para fotografías y videos optimizados para web.
alter table public.album_photos
  drop constraint if exists album_photos_mime_type_check,
  drop constraint if exists album_photos_size_bytes_check;

alter table public.album_photos
  add constraint album_photos_mime_type_check check (
    mime_type in (
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    )
  ),
  add constraint album_photos_size_bytes_check check (
    (mime_type like 'image/%' and size_bytes between 1 and 10485760)
    or
    (mime_type like 'video/%' and size_bytes between 1 and 26214400)
  );

update storage.buckets
set
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
where id = 'event-albums';

create or replace function public.submit_album_photo(
  p_event_slug text,
  p_guest_code text,
  p_storage_path text,
  p_original_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_event public.events%rowtype;
  target_guest public.guests%rowtype;
  media_id uuid;
  allowed_size bigint;
begin
  select e.* into target_event
  from public.events e
  where e.slug = lower(trim(p_event_slug));

  select g.* into target_guest
  from public.guests g
  where g.event_id = target_event.id
    and g.code = upper(trim(p_guest_code));

  if target_event.id is null or target_guest.id is null then
    raise exception 'Invitación no válida';
  end if;

  if p_storage_path not like target_event.id::text || '/' || target_guest.id::text || '/%' then
    raise exception 'Ruta de archivo no válida';
  end if;

  allowed_size := case
    when p_mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif') then 10485760
    when p_mime_type in ('video/mp4', 'video/webm', 'video/quicktime') then 26214400
    else 0
  end;

  if allowed_size = 0 or p_size_bytes not between 1 and allowed_size then
    raise exception 'Archivo no permitido';
  end if;

  if not exists (
    select 1
    from storage.objects o
    where o.bucket_id = 'event-albums'
      and o.name = p_storage_path
  ) then
    raise exception 'El archivo no existe en Storage';
  end if;

  insert into public.album_photos (
    event_id, guest_id, uploader_name, storage_path,
    original_name, mime_type, size_bytes
  ) values (
    target_event.id, target_guest.id, target_guest.name, p_storage_path,
    left(p_original_name, 255), p_mime_type, p_size_bytes
  )
  returning id into media_id;

  return media_id;
end;
$$;

revoke all on function public.submit_album_photo(text, text, text, text, text, bigint) from public;
grant execute on function public.submit_album_photo(text, text, text, text, text, bigint) to anon, authenticated;
