-- ---------------------------------------------------------------------------
-- 0023: new-order alerts in the admin panel.
--
-- orders.admin_seen_at: when an admin first opened (or dismissed) the order.
-- NULL = a new order the admin hasn't looked at yet; the admin panel counts
-- these, pops up an alert when one arrives, and marks them "New".
--
-- Orders that already exist are marked seen, so only orders placed from now
-- on count as new.
--
-- Setting it goes through mark_orders_seen() (admin only). It touches no
-- other column, so the status triggers (`update of status`: transition rules,
-- stock, status emails) never fire for it.
-- ---------------------------------------------------------------------------

alter table public.orders add column if not exists admin_seen_at timestamptz;

update public.orders set admin_seen_at = now() where admin_seen_at is null;

create index if not exists orders_unseen_idx on public.orders (created_at desc) where admin_seen_at is null;

-- Marks the given orders seen; NULL marks every unseen order seen.
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
