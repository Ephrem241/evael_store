-- Not a migration: run this once by hand in the SQL editor, AFTER Resend shows
-- the domain as Verified. It puts back in the queue the emails that were
-- rejected because the domain wasn't verified, so the next order or admin
-- action sends them. Anything queued more than 3 days ago still expires.

-- A status update the order has already moved on from would only confuse the
-- customer ("confirmed" after "delivered"): those are dropped, not sent.
update public.email_outbox e
set state = 'expired', locked_until = null
from public.orders o
where e.order_id = o.id
  and e.kind = 'order_status'
  and e.state in ('pending', 'failed')
  and e.last_error ilike '%not verified%'
  and e.status is distinct from o.status::text;

update public.email_outbox
set state = 'pending', attempts = 0, locked_until = null, last_error = null
where state in ('pending', 'failed')
  and last_error ilike '%not verified%'
  and created_at > now() - interval '3 days';

select kind, state, attempts, created_at
from public.email_outbox
order by created_at desc
limit 20;
