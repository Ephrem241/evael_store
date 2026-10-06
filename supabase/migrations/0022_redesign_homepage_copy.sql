-- ---------------------------------------------------------------------------
-- Evael redesign: the hero copy of the new homepage.
--
-- Homepage text is admin-editable (Admin -> Homepage, stored in
-- homepage_sections). This moves the hero row from the 0016 wording to the
-- redesign's — but ONLY while it still holds the 0016 headline. If an admin
-- has already rewritten it, it is left exactly as they wrote it.
--
--   * `\n` in the headline is a deliberate line break. The storefront draws
--     the LAST line in the brand orange ("Better Prices.").
--   * The primary button now goes to the deals page.
--
-- The Amharic wording is a first draft; have a native speaker review it.
-- ---------------------------------------------------------------------------

update public.homepage_sections
set content = content || jsonb_build_object(
      'headline', E'Everything You Love.\nBetter Prices.',
      'headline_am', E'የሚወዱትን ሁሉ።\nበተሻለ ዋጋ።',
      'subtext', 'Discover fashion, electronics, beauty, home essentials and more — all in one place.',
      'subtext_am', 'ፋሽን፣ ኤሌክትሮኒክስ፣ የውበት ምርቶች፣ የቤት ቁሳቁሶች እና ሌሎችንም — ሁሉንም በአንድ ቦታ ያግኙ።',
      'cta_label', 'Shop Deals',
      'cta_label_am', 'ቅናሾችን ይግዙ',
      'cta_href', '/deals',
      'secondary_cta_label', 'Explore Categories',
      'secondary_cta_label_am', 'ምድቦችን ያስሱ',
      'secondary_cta_href', '/categories'
    ),
    updated_at = now()
where section_key = 'hero'
  and content ->> 'headline' = E'Everything You Love,\nAll in One Place.';
