-- ---------------------------------------------------------------------------
-- Contact channels and a flash-sale flag on products.
--
-- Applied straight to the database on 2026-10-05 (version 20261005060211)
-- and recovered here from its migration history, so a fresh database matches
-- the live one. It ran before 0022; it does not depend on it either way.
--
-- - products.is_flash_sale, switched on for every product already on sale
--   (a compare-at price above the selling price).
-- - Phone, WhatsApp and Telegram contact numbers in store_settings. Existing
--   values are left alone.
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists is_flash_sale boolean not null default false;

update public.products
set is_flash_sale = true
where compare_at_price is not null and compare_at_price > price;

insert into public.store_settings (key, value) values
  ('contact_phone', '"+251949888889"'::jsonb),
  ('contact_whatsapp', '"+251949888889"'::jsonb),
  ('contact_telegram', '"+251949888889"'::jsonb)
on conflict (key) do nothing;
