-- ---------------------------------------------------------------------------
-- "New order" tracking for the admin.
--
-- Applied straight to the database on 2026-10-05 (version 20261005062812)
-- and recovered here from its migration history, so a fresh database matches
-- the live one. It ran before 0022; it does not depend on it either way.
--
-- - orders.admin_seen_at: null until an admin has seen the order. Every order
--   that existed when this ran counts as seen.
-- - A partial index over the unseen orders, newest first.
-- - mark_orders_seen(ids): marks the given orders seen, or all of them when
--   called with no ids. Admins only.
-- ---------------------------------------------------------------------------

alter table public.orders add column if not exists admin_seen_at timestamptz;

update public.orders set admin_seen_at = now() where admin_seen_at is null;

create index if not exists orders_unseen_idx on public.orders (created_at desc) where admin_seen_at is null;

create or replace function public.mark_orders_seen(p_order_ids uuid[] default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed.';
  end if;
  update public.orders
  set admin_seen_at = now()
  where admin_seen_at is null
    and (p_order_ids is null or id = any (p_order_ids));
end;
$$;

revoke execute on function public.mark_orders_seen(uuid[]) from public, anon;
grant execute on function public.mark_orders_seen(uuid[]) to authenticated;
