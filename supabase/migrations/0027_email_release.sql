-- ---------------------------------------------------------------------------
-- 0027: a setup problem at the mail service must not use up an email's tries.
--
-- claim_email_outbox counts an attempt when it hands an email out, and
-- complete_email_outbox gives up after the 5th. That suits a problem with one
-- email, but an unverified domain or a wrong API key fails every email until
-- someone fixes it, and each new order would push the waiting ones closer to
-- 'failed'. The sender now hands such emails back with this function: they stay
-- queued with their attempt uncounted. The 3-day expiry (0019) still applies.
-- ---------------------------------------------------------------------------

create or replace function public.release_email_outbox(p_secret text, p_ids uuid[], p_error text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.email_dispatch_check(p_secret);

  update public.email_outbox
  set state = 'pending',
      attempts = greatest(attempts - 1, 0),
      locked_until = null,
      last_error = left(p_error, 500)
  where id = any(p_ids) and state = 'sending';
end;
$$;

-- Callable with the public key; the secret is what guards it (as in 0019).
revoke execute on function public.release_email_outbox(text, uuid[], text) from public;
grant execute on function public.release_email_outbox(text, uuid[], text) to anon, authenticated;
