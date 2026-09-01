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
    event_uuid, client_uuid, 'Dulce & Eduardo', 'dulce-eduardo', 'Boda', '2026-10-10', '14:00',
    'elegante', 'elegante-clasica',
    '{"gallery":["/images/dulce-eduardo-historia-01.jpg","/images/dulce-eduardo-historia-02.jpg","/images/dulce-eduardo-historia-03.jpg","/images/dulce-eduardo-historia-04.jpg","/images/dulce-eduardo-historia-05.jpg"],"video_url":"/video/nuestra-historia.mp4","video_poster":"/images/dulce-eduardo-historia-02.jpg","ceremony_image":"/images/dulce-eduardo-historia-04.jpg","reception_image":"/images/dulce-eduardo-historia-03.jpg","dress_code":{"title":"Formal"},"bank":{"bank":"Banco Nacional","holder":"Dulce & Eduardo","clabe":"000 000 0000000000 0"}}'::jsonb,
    900, '5214623105704', 'Templo Hospitalito',
    'Misa · 2:00 p. m.', null, null,
    'Salón Casa de Adobe', 'Recepción · 4:00 p. m.', null, null,
    '/audio/boda.mp3',
    '[{"time":"2:00 PM","title":"Misa","description":"Templo Hospitalito"},{"time":"4:00 PM","title":"Recepción","description":"Salón Casa de Adobe"},{"time":"5:00 PM","title":"Entrada de los novios","description":"Comienza nuestra celebración"},{"time":"5:15 PM","title":"Comida","description":"Compartamos la mesa"},{"time":"6:30 PM","title":"Vals de los novios","description":"Nuestro primer baile"},{"time":"7:00 PM","title":"Baile","description":"¡A celebrar juntos!"},{"time":"12:00 AM","title":"Fin de la fiesta","description":"Gracias por acompañarnos"}]'::jsonb,
    '[{"name":"Liverpool","url":"https://www.liverpool.com.mx/tienda/home"},{"name":"Amazon","url":"https://www.amazon.com.mx/registries"}]'::jsonb
  ) on conflict (id) do update set
    client_id = excluded.client_id,
    whatsapp = excluded.whatsapp,
    updated_at = now();

  insert into public.guests (event_id, name, phone, passes, code, table_name, notes) values
    (event_uuid, 'Familia Hernández', '524621234567', 4, 'A7X92', 'Mesa 4', null),
    (event_uuid, 'Familia Castro Cuevas', '524621112233', 5, 'B8K31', 'Mesa 2', 'Familia de la novia'),
    (event_uuid, 'María López', '524621223344', 2, 'D9P21', 'Mesa 6', null),
    (event_uuid, 'José Ramírez', '524621334455', 1, 'F4M67', 'Mesa 7', null)
  on conflict (code) do update set name = excluded.name, phone = excluded.phone,
    passes = excluded.passes, table_name = excluded.table_name, notes = excluded.notes;
end $$;
