-- ---------------------------------------------------------------------------
-- 0028: delivery to Addis Ababa costs 300 ETB (the owner's decision, 2026-11-03).
--
-- Every other city, and "Other" places, stay at 700 ETB, and free delivery for
-- orders over 5,000 ETB is unchanged (0021). The checkout, the cart, the
-- Delivery page and place_order all read this row, so nothing else changes.
-- Previous value, for reference: Addis Ababa 700.
-- ---------------------------------------------------------------------------

update public.delivery_fees
set fee = 300
where city = 'Addis Ababa';
