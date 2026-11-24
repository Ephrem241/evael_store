-- ---------------------------------------------------------------------------
-- 0031: a Telegram message to the shop for every new order.
--
-- Works like the email outbox (0019): a trigger queues one row per new order,
-- so no code path can forget it, and the server's /api/email/dispatch route
-- sends what is queued through the shop's Telegram bot (TELEGRAM_BOT_TOKEN,
-- TELEGRAM_CHAT_ID). It is its own queue, so it works with or without email.
--
-- The queue is read and settled only through the two SECURITY DEFINER
-- functions below, guarded by the same dispatch secret as the email outbox
-- (EMAIL_DISPATCH_SECRET / set_email_dispatch_secret). Admins may look at it
-- (RLS select policy); nobody can write to it directly.
--
-- A failed send goes back in the queue and is retried by the next dispatch,
-- up to 5 attempts; anything still queued after 3 days is given up on.
-- Safe to re-run.
-- ---------------------------------------------------------------------------

create table if not exists public.telegram_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  state text not null default 'pending' check (state in ('pending', 'sending', 'sent', 'failed', 'expired')),
  attempts int not null default 0,
  locked_until timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index if not exists telegram_outbox_open_idx on public.telegram_outbox (created_at) where state in ('pending', 'sending');
create index if not exists telegram_outbox_order_idx on public.telegram_outbox (order_id);

alter table public.telegram_outbox enable row level security;
revoke all on public.telegram_outbox from anon, authenticated;
grant select on public.telegram_outbox to authenticated;

drop policy if exists "telegram_outbox_admin_select" on public.telegram_outbox;
create policy "telegram_outbox_admin_select" on public.telegram_outbox
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Queuing: one message per new order. The line items are inserted after the
-- order row (place_order), so they are read when the message is sent.
-- ---------------------------------------------------------------------------
create or replace function public.orders_queue_telegram()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.telegram_outbox (order_id) values (new.id);
  return null;
end;
$$;

revoke execute on function public.orders_queue_telegram() from public, anon, authenticated;

drop trigger if exists orders_after_insert_queue_telegram on public.orders;
create trigger orders_after_insert_queue_telegram
after insert on public.orders
for each row execute function public.orders_queue_telegram();

-- ---------------------------------------------------------------------------
-- The sender's side. claim hands over up to p_limit queued messages with the
-- order they are about, each leased for 5 minutes (a crashed sender doesn't
-- strand it, and two senders never take the same one).
-- ---------------------------------------------------------------------------
create or replace function public.claim_telegram_outbox(p_secret text, p_limit int default 10)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb;
begin
  perform public.email_dispatch_check(p_secret);

  update public.telegram_outbox
  set state = 'expired', locked_until = null
  where state in ('pending', 'sending') and created_at < now() - interval '3 days';

  with picked as (
    select id
    from public.telegram_outbox
    where state = 'pending' or (state = 'sending' and locked_until < now())
    order by created_at
    limit least(greatest(coalesce(p_limit, 10), 1), 50)
    for update skip locked
  ),
  claimed as (
    update public.telegram_outbox t
    set state = 'sending', attempts = t.attempts + 1, locked_until = now() + interval '5 minutes'
    from picked
    where t.id = picked.id
    returning t.*
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'order', (
      select jsonb_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'status', o.status,
        'payment_method', o.payment_method,
        'subtotal', o.subtotal,
        'delivery_fee', o.delivery_fee,
        'discount', o.discount,
        'total', o.total,
        'delivery_address', o.delivery_address,
        'created_at', o.created_at,
        'customer_name', p.full_name,
        'customer_email', p.email,
        'items', coalesce((
          select jsonb_agg(jsonb_build_object(
            'name', oi.product_name,
            'size', oi.size,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total', oi.total
          ) order by oi.product_name, oi.size)
          from public.order_items oi
          where oi.order_id = o.id
        ), '[]'::jsonb)
      )
      from public.orders o
      left join public.profiles p on p.id = o.user_id
      where o.id = c.order_id
    )
  ) order by c.created_at), '[]'::jsonb)
  into v_rows
  from claimed c;

  return v_rows;
end;
$$;

-- p_error null: sent. Otherwise back in the queue (failed after 5 attempts).
create or replace function public.complete_telegram_outbox(p_secret text, p_id uuid, p_error text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.email_dispatch_check(p_secret);

  if p_error is null then
    update public.telegram_outbox
    set state = 'sent', sent_at = now(), locked_until = null, last_error = null
    where id = p_id and state = 'sending';
  else
    update public.telegram_outbox
    set state = case when attempts >= 5 then 'failed' else 'pending' end,
        locked_until = null,
        last_error = left(p_error, 500)
    where id = p_id and state = 'sending';
  end if;
end;
$$;

-- Callable with the public key; the secret is what guards them.
revoke execute on function public.claim_telegram_outbox(text, int) from public;
grant execute on function public.claim_telegram_outbox(text, int) to anon, authenticated;
revoke execute on function public.complete_telegram_outbox(text, uuid, text) from public;
grant execute on function public.complete_telegram_outbox(text, uuid, text) to anon, authenticated;
