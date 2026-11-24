-- ---------------------------------------------------------------------------
-- 0030: customer service on Telegram is @EVAELSTORES (the owner's decision,
-- 2026-11-24).
--
-- store_settings.contact_telegram drives the Telegram button on the Contact
-- page and in the footer, the floating "Customer service" button on every shop
-- page, and the Customer service link in the admin sidebar. 0022 set it to the
-- shop's phone number. It changes only while it still holds that 0022 value
-- (or is missing), so a value the admin has already edited on /admin/settings
-- is kept. Safe to re-run.
-- Previous value, for reference: "+251949888889".
-- ---------------------------------------------------------------------------

insert into public.store_settings (key, value)
values ('contact_telegram', '"@EVAELSTORES"'::jsonb)
on conflict (key) do update
set value = excluded.value,
    updated_at = now()
where public.store_settings.value = '"+251949888889"'::jsonb;
