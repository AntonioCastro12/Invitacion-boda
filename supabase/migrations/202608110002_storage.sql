-- Bucket privado preparado para música e imágenes futuras de cada evento.
insert into storage.buckets (id, name, public)
values ('event-assets', 'event-assets', false)
on conflict (id) do nothing;

-- La primera carpeta del objeto debe ser el event_id. Sólo el dueño de ese evento
-- (o super_admin) puede leer, subir, modificar o eliminar archivos.
create policy "event_assets_select_owner" on storage.objects for select to authenticated
using (
  bucket_id = 'event-assets' and
  (public.owns_event((storage.foldername(name))[1]::uuid) or public.is_super_admin())
);
create policy "event_assets_insert_owner" on storage.objects for insert to authenticated
with check (
  bucket_id = 'event-assets' and
  (public.owns_event((storage.foldername(name))[1]::uuid) or public.is_super_admin())
);
create policy "event_assets_update_owner" on storage.objects for update to authenticated
using (
  bucket_id = 'event-assets' and
  (public.owns_event((storage.foldername(name))[1]::uuid) or public.is_super_admin())
);
create policy "event_assets_delete_owner" on storage.objects for delete to authenticated
using (
  bucket_id = 'event-assets' and
  (public.owns_event((storage.foldername(name))[1]::uuid) or public.is_super_admin())
);
