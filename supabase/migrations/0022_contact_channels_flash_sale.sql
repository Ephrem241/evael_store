-- ---------------------------------------------------------------------------
-- 0022: Telegram / WhatsApp / phone contact, and a per-product flash sale.
--
-- - products.is_flash_sale: the admin chooses which discounted products the
--   homepage's Flash Deals row shows (it used to show every discounted one).
--   Products already on sale start switched on, so the row doesn't go empty.
-- - store_settings: the shop's phone, WhatsApp and Telegram, shown on the
--   Contact page and in the footer and edited on /admin/settings. Existing
--   values are kept (on conflict do nothing). Reads are public and writes
--   admin-only, as for every store_settings row (0014).
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
