-- Álbum colaborativo compartido por evento.
create schema if not exists private;

create table public.album_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  uploader_name text not null check (length(trim(uploader_name)) between 1 and 100),
  storage_path text not null unique,
  original_name text not null check (length(original_name) between 1 and 255),
  mime_type text not null check (mime_type like 'image/%'),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

create index album_photos_event_created_idx
on public.album_photos (event_id, created_at desc)
where status = 'visible';

create index album_photos_guest_id_idx on public.album_photos (guest_id);

alter table public.album_photos enable row level security;

-- Los clientes administran solamente las fotografías de sus propios eventos.
create policy "album_photos_owner_select" on public.album_photos for select to authenticated
using ((select public.owns_event(event_id)) or (select public.is_super_admin()));

create policy "album_photos_owner_update" on public.album_photos for update to authenticated
using ((select public.owns_event(event_id)) or (select public.is_super_admin()))
with check ((select public.owns_event(event_id)) or (select public.is_super_admin()));

create policy "album_photos_owner_delete" on public.album_photos for delete to authenticated
using ((select public.owns_event(event_id)) or (select public.is_super_admin()));

revoke all on public.album_photos from anon;
grant select, update, delete on public.album_photos to authenticated;

-- Valida internamente que la carpeta event_id/guest_id corresponde a un invitado real.
create or replace function private.is_valid_album_path(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[];
begin
  folders := storage.foldername(object_name);
  if coalesce(array_length(folders, 1), 0) < 2 then return false; end if;
  return exists (
    select 1 from public.guests g
    where g.event_id = folders[1]::uuid and g.id = folders[2]::uuid
  );
exception when others then
  return false;
end;
$$;

revoke all on function private.is_valid_album_path(text) from public, anon, authenticated;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_valid_album_path(text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-albums',
  'event-albums',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "event_album_public_upload" on storage.objects for insert to anon, authenticated
with check (
  bucket_id = 'event-albums'
  and (select private.is_valid_album_path(name))
  and coalesce((metadata ->> 'size')::bigint, 0) between 1 and 10485760
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
);

-- Devuelve únicamente el álbum del evento al que pertenece el código presentado.
create or replace function public.get_public_album(p_event_slug text, p_guest_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'uploader_name', p.uploader_name,
          'storage_path', p.storage_path,
          'created_at', p.created_at
        ) order by p.created_at desc
      )
      from (
        select ap.*
        from public.album_photos ap
        where ap.event_id = e.id and ap.status = 'visible'
        order by ap.created_at desc
        limit 100
      ) p
    ),
    '[]'::jsonb
  )
  from public.events e
  join public.guests g on g.event_id = e.id
  where e.slug = lower(trim(p_event_slug)) and g.code = upper(trim(p_guest_code))
  limit 1;
$$;

-- Registra una subida sólo si slug, código, carpeta, tamaño y MIME coinciden.
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
  photo_id uuid;
begin
  select e.* into target_event
  from public.events e
  where e.slug = lower(trim(p_event_slug));

  select g.* into target_guest
  from public.guests g
  where g.event_id = target_event.id and g.code = upper(trim(p_guest_code));

  if target_event.id is null or target_guest.id is null then
    raise exception 'Invitación no válida';
  end if;

  if p_storage_path not like target_event.id::text || '/' || target_guest.id::text || '/%' then
    raise exception 'Ruta de archivo no válida';
  end if;

  if p_mime_type not in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
     or p_size_bytes not between 1 and 10485760 then
    raise exception 'Archivo no permitido';
  end if;

  if not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'event-albums' and o.name = p_storage_path
  ) then
    raise exception 'El archivo no existe en Storage';
  end if;

  insert into public.album_photos (
    event_id, guest_id, uploader_name, storage_path, original_name, mime_type, size_bytes
  ) values (
    target_event.id, target_guest.id, target_guest.name, p_storage_path,
    left(p_original_name, 255), p_mime_type, p_size_bytes
  ) returning id into photo_id;

  return photo_id;
end;
$$;

revoke all on function public.get_public_album(text, text) from public;
revoke all on function public.submit_album_photo(text, text, text, text, text, bigint) from public;
grant execute on function public.get_public_album(text, text) to anon, authenticated;
grant execute on function public.submit_album_photo(text, text, text, text, text, bigint) to anon, authenticated;
