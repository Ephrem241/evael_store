-- ---------------------------------------------------------------------------
-- 0029: product sizes, and holiday / special sale events.
--
-- 1. product_sizes: a product can be sold in sizes (S, M, L, XL for clothes,
--    38, 39, 40 for shoes, ...), each with its own stock. A product with no
--    rows here is sold as before, with products.stock. For a product WITH
--    sizes, products.stock is kept equal to the sum of its sizes' stock by
--    triggers, so everything that reads products.stock (sold-out badges, the
--    "only N left" note, the admin list) keeps working unchanged.
-- 2. cart_items.size and order_items.size: which size a cart line or an order
--    line is for. '' (cart) / null (orders) means the product has no sizes.
--    A shopper can have the same product in two sizes, so the cart's unique
--    key becomes (user_id, product_id, size).
-- 3. sale_events: a shop-wide or one-category sale for a holiday or special
--    occasion (Genna, Timket, Easter, Eid, Black Friday, ...): N% off, between
--    two dates the admin sets. Read publicly (the storefront shows the banner,
--    the countdown and the lower prices); written by admins only.
-- 4. place_order prices every line itself, as before, now taking the biggest
--    running sale event off each product's price, and checks and takes stock
--    from the chosen size. The browser's prices are never trusted.
-- 5. Cancelling an order returns stock to the size it came from.
-- 6. The order emails include each line's size.
--
-- Safe to run twice: every create is "if not exists" or "or replace", and
-- policies and triggers are dropped before they are made.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. product_sizes
-- ---------------------------------------------------------------------------
create table if not exists public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  -- "M", "XL", "39", "42.5", "One size". No "|": the cart uses it as a separator.
  label text not null check (label = btrim(label) and length(label) between 1 and 20 and position('|' in label) = 0),
  stock int not null default 0 check (stock >= 0),
  sort_order int not null default 0,
  unique (product_id, label)
);
create index if not exists product_sizes_product_id_idx on public.product_sizes (product_id, sort_order);

alter table public.product_sizes enable row level security;

drop policy if exists "product_sizes_select" on public.product_sizes;
create policy "product_sizes_select" on public.product_sizes
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_sizes.product_id and (p.is_active or (select public.is_admin()))
    )
  );
drop policy if exists "product_sizes_admin_insert" on public.product_sizes;
create policy "product_sizes_admin_insert" on public.product_sizes
  for insert with check ((select public.is_admin()));
drop policy if exists "product_sizes_admin_update" on public.product_sizes;
create policy "product_sizes_admin_update" on public.product_sizes
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "product_sizes_admin_delete" on public.product_sizes;
create policy "product_sizes_admin_delete" on public.product_sizes
  for delete using ((select public.is_admin()));

-- A sized product's stock is the sum of its sizes. Enforced on the product row
-- itself, so no write (the admin form, the quick stock edit, place_order) can
-- leave the two out of step.
create or replace function public.products_stock_from_sizes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
begin
  select sum(stock)::int into v_total from public.product_sizes where product_id = new.id;
  if v_total is not null then
    new.stock := v_total;
  end if;
  return new;
end;
$$;

drop trigger if exists products_stock_from_sizes on public.products;
create trigger products_stock_from_sizes
  before update of stock on public.products
  for each row execute function public.products_stock_from_sizes();

-- ...and any change to a size re-totals its product. When the last size is
-- removed the product keeps the total it had, as an ordinary product.
create or replace function public.product_sizes_sync_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product uuid;
begin
  for v_product in
    select distinct x from unnest(array[
      case when tg_op in ('INSERT', 'UPDATE') then new.product_id end,
      case when tg_op in ('UPDATE', 'DELETE') then old.product_id end
    ]) as x where x is not null
  loop
    update public.products
    set stock = coalesce((select sum(stock)::int from public.product_sizes where product_id = v_product), stock)
    where id = v_product;
  end loop;
  return null;
end;
$$;

drop trigger if exists product_sizes_sync_stock on public.product_sizes;
create trigger product_sizes_sync_stock
  after insert or update or delete on public.product_sizes
  for each row execute function public.product_sizes_sync_stock();

-- ---------------------------------------------------------------------------
-- 2. Sizes on cart lines and order lines
-- ---------------------------------------------------------------------------
alter table public.cart_items add column if not exists size text not null default '';
alter table public.cart_items drop constraint if exists cart_items_user_id_product_id_key;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cart_items_user_product_size_key') then
    alter table public.cart_items
      add constraint cart_items_user_product_size_key unique (user_id, product_id, size);
  end if;
end;
$$;

alter table public.order_items add column if not exists size text;

-- ---------------------------------------------------------------------------
-- 3. sale_events
-- ---------------------------------------------------------------------------
create table if not exists public.sale_events (
  id uuid primary key default gen_random_uuid(),
  name_en text not null check (length(btrim(name_en)) between 2 and 60),
  name_am text not null check (length(btrim(name_am)) between 2 and 60),
  tagline_en text not null default '' check (length(tagline_en) <= 160),
  tagline_am text not null default '' check (length(tagline_am) <= 160),
  -- Same ceiling as a product's own discount (lib/discount.ts).
  discount_percent int not null check (discount_percent between 1 and 90),
  -- null: every product in the shop.
  category_id uuid references public.categories(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists sale_events_running_idx on public.sale_events (ends_at) where is_active;

alter table public.sale_events enable row level security;

drop policy if exists "sale_events_select_public" on public.sale_events;
create policy "sale_events_select_public" on public.sale_events
  for select using (is_active or (select public.is_admin()));
drop policy if exists "sale_events_admin_insert" on public.sale_events;
create policy "sale_events_admin_insert" on public.sale_events
  for insert with check ((select public.is_admin()));
drop policy if exists "sale_events_admin_update" on public.sale_events;
create policy "sale_events_admin_update" on public.sale_events
  for update using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "sale_events_admin_delete" on public.sale_events;
create policy "sale_events_admin_delete" on public.sale_events
  for delete using ((select public.is_admin()));

-- The price a product sells at right now: the biggest running sale event for
-- it taken off its price, in whole birr, never below 1 and never above the
-- price itself. lib/sale-events.ts (salePrice) does the same sum for display.
create or replace function public.sale_price(p_price numeric, p_category_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select case
    when max(e.discount_percent) is null then p_price
    else least(p_price, greatest(1, round(p_price * (100 - max(e.discount_percent)) / 100.0)))
  end
  from public.sale_events e
  where e.is_active
    and e.starts_at <= now()
    and e.ends_at > now()
    and (e.category_id is null or e.category_id = p_category_id);
$$;

-- ---------------------------------------------------------------------------
-- 4. place_order: as in 0018, plus sale prices and sizes.
-- Each item is {product_id, quantity, size?}.
-- ---------------------------------------------------------------------------
create or replace function public.place_order(
  p_delivery_address jsonb,
  p_payment_method payment_method,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product record;
  v_size text;
  v_has_sizes boolean;
  v_size_stock int;
  v_unit_price numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_delivery_fee numeric(12,2);
  v_free_threshold numeric;
  v_order public.orders;
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
begin
  -- Definer rights bypass RLS, so identity must be checked explicitly.
  if auth.uid() is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  if p_payment_method <> 'cod' then
    raise exception 'This payment method isn''t available yet.';
  end if;

  if p_delivery_address is null
     or jsonb_typeof(p_delivery_address) <> 'object'
     or coalesce(btrim(p_delivery_address ->> 'full_name'), '') = ''
     or coalesce(btrim(p_delivery_address ->> 'phone'), '') = ''
     or coalesce(btrim(p_delivery_address ->> 'city'), '') = ''
     or coalesce(btrim(p_delivery_address ->> 'sub_city'), '') = ''
     or coalesce(btrim(p_delivery_address ->> 'woreda'), '') = ''
     or coalesce(btrim(p_delivery_address ->> 'address'), '') = '' then
    raise exception 'Delivery address is incomplete.';
  end if;

  select fee into v_delivery_fee from public.delivery_fees where city = p_delivery_address ->> 'city';
  if v_delivery_fee is null then
    select fee into v_delivery_fee from public.delivery_fees where city = 'Other';
  end if;
  if v_delivery_fee is null then
    raise exception 'Delivery is not available for this address.';
  end if;

  select (value #>> '{}')::numeric into v_free_threshold
  from public.store_settings
  where key = 'free_delivery_threshold' and jsonb_typeof(value) = 'number';

  -- Lock every referenced product row, and their sizes, up front (stable
  -- order by id avoids deadlocks between two concurrent checkouts).
  perform 1 from public.products
  where id in (select (elem ->> 'product_id')::uuid from jsonb_array_elements(p_items) elem)
  order by id
  for update;
  perform 1 from public.product_sizes
  where product_id in (select (elem ->> 'product_id')::uuid from jsonb_array_elements(p_items) elem)
  order by id
  for update;

  for v_item in select * from jsonb_array_elements(p_items) loop
    if (v_item ->> 'quantity')::int is null or (v_item ->> 'quantity')::int <= 0 then
      raise exception 'Invalid quantity.';
    end if;

    select p.id, p.name_en, p.price, p.stock, p.category_id, p.is_active, c.is_active as category_active into v_product
    from public.products p
    join public.categories c on c.id = p.category_id
    where p.id = (v_item ->> 'product_id')::uuid;

    if v_product.id is null or not v_product.is_active or not v_product.category_active then
      raise exception 'Some items in your cart are no longer available. Please remove them and try again.';
    end if;

    v_size := nullif(btrim(coalesce(v_item ->> 'size', '')), '');
    v_has_sizes := exists (select 1 from public.product_sizes where product_id = v_product.id);

    if v_has_sizes then
      if v_size is null then
        raise exception 'Please choose a size for: %.', v_product.name_en;
      end if;
      select stock into v_size_stock from public.product_sizes where product_id = v_product.id and label = v_size;
      if v_size_stock is null then
        raise exception 'Some items in your cart are no longer available. Please remove them and try again.';
      end if;
      if v_size_stock < (v_item ->> 'quantity')::int then
        raise exception 'Not enough stock for: %. Please update the quantity in your cart and try again.', v_product.name_en || ' (' || v_size || ')';
      end if;
    else
      if v_size is not null then
        raise exception 'Some items in your cart are no longer available. Please remove them and try again.';
      end if;
      if v_product.stock < (v_item ->> 'quantity')::int then
        raise exception 'Not enough stock for: %. Please update the quantity in your cart and try again.', v_product.name_en;
      end if;
    end if;

    v_subtotal := v_subtotal + public.sale_price(v_product.price, v_product.category_id) * (v_item ->> 'quantity')::int;
  end loop;

  -- "Over" the threshold means strictly above it, exactly as advertised.
  if v_free_threshold is not null and v_subtotal > v_free_threshold then
    v_delivery_fee := 0;
  end if;

  v_order_number := 'ETM-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(md5(v_order_id::text), 1, 4));

  insert into public.orders (
    id, user_id, order_number, status, payment_method, payment_status,
    subtotal, delivery_fee, discount, total, delivery_address, status_history
  ) values (
    v_order_id, auth.uid(), v_order_number, 'pending', p_payment_method, 'pending',
    v_subtotal, v_delivery_fee, 0, v_subtotal + v_delivery_fee, p_delivery_address,
    jsonb_build_array(jsonb_build_object('status', 'pending', 'at', now()))
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select id, name_en, price, category_id into v_product from public.products where id = (v_item ->> 'product_id')::uuid;
    v_size := nullif(btrim(coalesce(v_item ->> 'size', '')), '');
    v_unit_price := public.sale_price(v_product.price, v_product.category_id);

    insert into public.order_items (order_id, product_id, product_name, size, quantity, unit_price, total)
    values (
      v_order_id, v_product.id, v_product.name_en, v_size, (v_item ->> 'quantity')::int,
      v_unit_price, v_unit_price * (v_item ->> 'quantity')::int
    );

    if v_size is not null then
      -- The size trigger re-totals the product's stock.
      update public.product_sizes set stock = stock - (v_item ->> 'quantity')::int
      where product_id = v_product.id and label = v_size;
    else
      update public.products set stock = stock - (v_item ->> 'quantity')::int where id = v_product.id;
    end if;
  end loop;

  return v_order;
end;
$$;

revoke execute on function public.place_order(jsonb, payment_method, jsonb) from public, anon;
grant execute on function public.place_order(jsonb, payment_method, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Status transitions: as in 0018; cancelling returns stock to the size the
--    line was for (when that size still exists), else to the product.
-- ---------------------------------------------------------------------------
create or replace function public.orders_enforce_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status in ('delivered', 'cancelled') then
    raise exception 'Cannot change status of a % order.', old.status;
  end if;
  if new.status = old.status then
    raise exception 'Order is already in this status.';
  end if;
  if new.status <> 'cancelled' and new.status < old.status then
    raise exception 'An order can''t go from % to %.', old.status, new.status;
  end if;

  if new.status = 'cancelled' then
    update public.product_sizes s
    set stock = s.stock + oi.quantity
    from (
      select product_id, size, sum(quantity)::int as quantity
      from public.order_items
      where order_id = new.id and product_id is not null and size is not null
      group by product_id, size
    ) oi
    where oi.product_id = s.product_id and oi.size = s.label;

    update public.products p
    set stock = p.stock + oi.quantity
    from (
      select product_id, sum(quantity)::int as quantity
      from public.order_items
      where order_id = new.id and product_id is not null and size is null
      group by product_id
    ) oi
    where oi.product_id = p.id;
  end if;

  new.status_history := old.status_history || jsonb_build_object('status', new.status, 'at', now());
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Order emails: as in 0020, with each line's size.
-- ---------------------------------------------------------------------------
create or replace function public.claim_email_outbox(p_secret text, p_limit int default 10)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb;
begin
  perform public.email_dispatch_check(p_secret);

  update public.email_outbox
  set state = 'expired', locked_until = null
  where state in ('pending', 'sending') and created_at < now() - interval '3 days';

  with picked as (
    select id
    from public.email_outbox
    where state = 'pending' or (state = 'sending' and locked_until < now())
    order by created_at
    limit least(greatest(coalesce(p_limit, 10), 1), 50)
    for update skip locked
  ),
  claimed as (
    update public.email_outbox o
    set state = 'sending', attempts = o.attempts + 1, locked_until = now() + interval '5 minutes'
    from picked
    where o.id = picked.id
    returning o.*
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'kind', c.kind,
    'status', c.status,
    'locale', c.locale,
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
    ),
    'contact', (
      select jsonb_build_object(
        'name', m.name,
        'email', m.email,
        'subject', m.subject,
        'message', m.message,
        'locale', m.locale,
        'created_at', m.created_at
      )
      from public.contact_messages m
      where m.id = c.contact_id
    ),
    'reply', (
      select jsonb_build_object('body', r.body, 'created_at', r.created_at)
      from public.contact_replies r
      where r.id = c.reply_id
    )
  ) order by c.created_at), '[]'::jsonb)
  into v_rows
  from claimed c;

  return v_rows;
end;
$$;
