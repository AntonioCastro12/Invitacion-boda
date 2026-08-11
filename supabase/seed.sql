-- 1) Crea primero este usuario desde Authentication > Users en Supabase:
--    dulce.eduardo@rcminvitaciones.com
-- 2) Después ejecuta este archivo en SQL Editor.
do $$
declare
  client_uuid uuid;
  event_uuid uuid := '11111111-1111-4111-8111-111111111111';
begin
  select id into client_uuid from auth.users where email = 'dulce.eduardo@rcminvitaciones.com' limit 1;
  if client_uuid is null then
    raise exception 'Crea primero el usuario dulce.eduardo@rcminvitaciones.com en Supabase Authentication';
  end if;

  update public.profiles set nombre = 'Dulce y Eduardo', rol = 'cliente' where id = client_uuid;

  insert into public.events (
    id, client_id, name, slug, event_type, event_date, event_time, plan, template_key, template_config, price_reference,
    whatsapp, ceremony_name, ceremony_address, ceremony_lat, ceremony_lng,
    reception_name, reception_address, reception_lat, reception_lng, music_url,
    itinerary, gift_registry
  ) values (
    event_uuid, client_uuid, 'Dulce & Eduardo', 'dulce-eduardo', 'Boda', '2026-10-10', '17:00',
    'elegante', 'elegante-clasica',
    '{"gallery":["/images/pareja-1.jpg","/images/pareja-2.jpg","/images/pareja-3.jpg","/images/pareja-4.jpg","/images/pareja-5.jpg"],"video_url":"/video/nuestra-historia.mp4","video_poster":"/images/pareja-3.jpg","ceremony_image":"/images/pareja-3.jpg","reception_image":"/images/pareja-5.jpg","dress_code":{"title":"Formal"},"bank":{"bank":"Banco Nacional","holder":"Dulce & Eduardo","clabe":"000 000 0000000000 0"}}'::jsonb,
    900, '524621234567', 'Templo de San Francisco',
    'Centro histórico, Guanajuato, Gto.', 21.01858, -101.25736,
    'Hacienda San José Lavista', 'Camino a San José, Guanajuato, Gto.', 20.98718, -101.28054,
    '/audio/boda.mp3',
    '[{"time":"5:00 PM","title":"Ceremonia","description":"Templo de San Francisco"},{"time":"7:00 PM","title":"Recepción","description":"Hacienda San José Lavista"},{"time":"8:00 PM","title":"Cena","description":"Compartamos la mesa"},{"time":"9:00 PM","title":"Celebración","description":"¡A disfrutar juntos!"}]'::jsonb,
    '[{"name":"Liverpool","url":"https://www.liverpool.com.mx/tienda/home"},{"name":"Amazon","url":"https://www.amazon.com.mx/registries"}]'::jsonb
  ) on conflict (id) do update set client_id = excluded.client_id, updated_at = now();

  insert into public.guests (event_id, name, phone, passes, code, table_name, notes) values
    (event_uuid, 'Familia Hernández', '524621234567', 4, 'A7X92', 'Mesa 4', null),
    (event_uuid, 'Familia Castro Cuevas', '524621112233', 5, 'B8K31', 'Mesa 2', 'Familia de la novia'),
    (event_uuid, 'María López', '524621223344', 2, 'D9P21', 'Mesa 6', null),
    (event_uuid, 'José Ramírez', '524621334455', 1, 'F4M67', 'Mesa 7', null)
  on conflict (code) do update set name = excluded.name, phone = excluded.phone,
    passes = excluded.passes, table_name = excluded.table_name, notes = excluded.notes;
end $$;
