-- ---------------------------------------------------------------------------
-- Burgundy and gold redesign: the hero copy of the new homepage.
--
-- Homepage text is admin-editable (Admin -> Homepage, stored in
-- homepage_sections). This moves the hero row from the 0024 wording to the
-- redesign's — but ONLY while it still holds the 0024 headline. If an admin
-- has already rewritten it, it is left exactly as they wrote it.
--
--   * `\n` in the headline is a deliberate line break. The storefront draws
--     the LAST line in gold ("Made for Ethiopia."); on phones the lines
--     before it become the small capitals over it.
--   * The subtext is unchanged.
--   * The buttons become "Shop Now" (the whole shop) and "Explore Deals".
--
-- The Amharic wording is a first draft; have a native speaker review it.
-- ---------------------------------------------------------------------------

update public.homepage_sections
set content = content || jsonb_build_object(
      'headline', E'Modern Shopping.\nMade for Ethiopia.',
      'headline_am', E'ዘመናዊ ግብይት።\nለኢትዮጵያ የተሰራ።',
      'cta_label', 'Shop Now',
      'cta_label_am', 'አሁን ይግዙ',
      'cta_href', '/shop',
      'secondary_cta_label', 'Explore Deals',
      'secondary_cta_label_am', 'ቅናሾችን ያስሱ',
      'secondary_cta_href', '/deals'
    ),
    updated_at = now()
where section_key = 'hero'
  and content ->> 'headline' = E'Everything You Love.\nBetter Prices.';
