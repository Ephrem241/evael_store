-- ---------------------------------------------------------------------------
-- 0026: Customer comments and feedback on products (public.reviews, 0002).
--
-- - author_name: the first name shown beside a review. profiles is private
--   (0004), so the name is copied here; the rest of the profile stays private.
-- - guard_review: a customer can never approve their own review, nor move it
--   to another product or person. The insert/update policies only check
--   user_id, so without this anyone signed in could publish straight away.
--   Editing a review sends it back for moderation.
-- - sync_product_rating: products.rating becomes the average of the approved
--   reviews. It only runs when an approved review is involved, so a product
--   nobody has reviewed keeps the rating it has.
-- ---------------------------------------------------------------------------

alter table public.reviews
  add column if not exists author_name text not null default '';

alter table public.reviews
  add constraint reviews_comment_length check (comment is null or char_length(comment) <= 1000);

create or replace function public.guard_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    new.user_id := old.user_id;
    new.product_id := old.product_id;
    new.created_at := old.created_at;
    new.author_name := old.author_name;
  end if;

  if tg_op = 'INSERT' then
    select coalesce(split_part(btrim(p.full_name), ' ', 1), '')
      into new.author_name
      from public.profiles p
      where p.id = new.user_id;
    new.author_name := coalesce(new.author_name, '');
  end if;

  if not public.is_admin() then
    new.is_approved := false;
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_guard on public.reviews;
create trigger reviews_guard
  before insert or update on public.reviews
  for each row execute function public.guard_review();

create or replace function public.sync_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := case when tg_op = 'DELETE' then old.product_id else new.product_id end;
begin
  if (tg_op <> 'INSERT' and old.is_approved) or (tg_op <> 'DELETE' and new.is_approved) then
    update public.products
    set rating = (
      select round(avg(r.rating)::numeric, 1)
      from public.reviews r
      where r.product_id = target and r.is_approved
    )
    where id = target;
  end if;
  return null;
end;
$$;

drop trigger if exists reviews_sync_rating on public.reviews;
create trigger reviews_sync_rating
  after insert or update or delete on public.reviews
  for each row execute function public.sync_product_rating();

-- Trigger functions only: nobody needs to call them directly.
revoke execute on function public.guard_review() from public, anon, authenticated;
revoke execute on function public.sync_product_rating() from public, anon, authenticated;
