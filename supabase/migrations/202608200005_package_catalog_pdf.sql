-- Sincroniza los seis paquetes comerciales con la propuesta oficial RCM.
update public.plans set name = 'Esencial', price = 250, gallery_limit = 1, features =
'{"responsive":true,"single_page":true,"main_photo":true,"event_details":true,"google_maps":true,"whatsapp_button":true,"whatsapp_rsvp":true}'::jsonb
where key = 'esencial-250';

update public.plans set name = 'Clásica', price = 500, gallery_limit = 5, features =
'{"responsive":true,"single_page":true,"main_photo":true,"event_details":true,"google_maps":true,"whatsapp_button":true,"animated_cover":true,"music":true,"countdown":true,"dress_code":true,"final_message":true}'::jsonb
where key = 'musical-500';

update public.plans set name = 'Elegante', price = 900, gallery_limit = 20, features =
'{"responsive":true,"single_page":true,"main_photo":true,"event_details":true,"google_maps":true,"whatsapp_button":true,"animated_cover":true,"music":true,"countdown":true,"dress_code":true,"final_message":true,"soft_animations":true,"premium_gallery":true,"itinerary":true,"maps_waze":true,"gift_registry":true,"add_calendar":true,"whatsapp_rsvp":true}'::jsonb
where key = 'elegante-900';

update public.plans set name = 'Premium', price = 1500, gallery_limit = 40, features =
'{"responsive":true,"single_page":true,"main_photo":true,"event_details":true,"google_maps":true,"whatsapp_button":true,"animated_cover":true,"music":true,"countdown":true,"dress_code":true,"final_message":true,"soft_animations":true,"premium_gallery":true,"itinerary":true,"maps_waze":true,"gift_registry":true,"add_calendar":true,"form_rsvp":true,"embedded_video":true,"personalized_passes":true,"extra_sections":true}'::jsonb
where key = 'premium-1500';

update public.plans set name = 'Premium Plus', price = 2500, gallery_limit = 80, features =
'{"responsive":true,"single_page":true,"main_photo":true,"event_details":true,"google_maps":true,"whatsapp_button":true,"animated_cover":true,"music":true,"countdown":true,"dress_code":true,"final_message":true,"soft_animations":true,"premium_gallery":true,"itinerary":true,"maps_waze":true,"gift_registry":true,"add_calendar":true,"embedded_video":true,"personalized_passes":true,"extra_sections":true,"personalized_url":true,"guest_database":true,"database_rsvp":true,"confirmation_statuses":true,"pass_count":true,"confirmation_panel":true,"individual_qr":true,"admin_panel":true,"statistics":true}'::jsonb
where key = 'premium-plus-2500';

update public.plans set name = 'VIP', price = 5000, gallery_limit = 200, features =
'{"responsive":true,"single_page":true,"main_photo":true,"event_details":true,"google_maps":true,"whatsapp_button":true,"animated_cover":true,"music":true,"countdown":true,"premium_gallery":true,"dress_code":true,"final_message":true,"soft_animations":true,"itinerary":true,"maps_waze":true,"gift_registry":true,"add_calendar":true,"whatsapp_rsvp":true,"form_rsvp":true,"embedded_video":true,"personalized_passes":true,"extra_sections":true,"personalized_url":true,"guest_database":true,"database_rsvp":true,"confirmation_statuses":true,"pass_count":true,"confirmation_panel":true,"individual_qr":true,"admin_panel":true,"collaborative_album":true,"qr_scanner":true,"access_control":true,"entry_log":true,"used_pass_control":true,"duplicate_qr_prevention":true,"statistics":true}'::jsonb
where key = 'vip-5000';
