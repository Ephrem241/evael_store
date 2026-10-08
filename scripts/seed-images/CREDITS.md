# Image credits

All photographs are from [Unsplash](https://unsplash.com) and used under the
[Unsplash License](https://unsplash.com/license): free for commercial use, no
permission or attribution required (attribution is appreciated). They are demo
photography for the seeded catalog — replace them with your own product photos
through **Admin → Products / Categories** as real inventory arrives.

Each entry is the photo's ID on Unsplash's image CDN
(`https://images.unsplash.com/<id>`); search for the ID on unsplash.com to find
the photographer.

## Homepage (`public/images/home/`)

| File | Unsplash photo |
| --- | --- |
| `deals-kitchen.jpg` | `photo-1628797279405-8cd6ffdbeb6c` |

The redesign photographs — `hero-shopper.jpg`, `hero-couple.jpg`,
`hero-living-room.jpg`, `savings-banner.jpg`, `addis-skyline.jpg` and
`newsletter-shopper.jpg` — were supplied by the store with the design brief
(`docs/design/`) and resized for the web; they are not Unsplash photos.
`deals-tile.jpg` (the shopping bags on the home page's Deals tile and the
Categories page's Deals banner) was made by the store with Google Gemini; its
original is `docs/design/Deals tile.jpg`.

## Catalog (`products/` and `categories/` here)

`manifest.json` maps every product slug and category slug to its Unsplash photo
ID. The files are those photos, cropped (square for products, 4:5 for
categories) and compressed.

Each product also has two more photos, `<slug>--2.jpg` and `<slug>--3.jpg`
(listed under `productExtras` in `manifest.json`), shown after the main one in
the product gallery. Where the photographer shot the same item several times
they are that item from another angle; otherwise they are the closest matching
item (another view, in use, or a close-up), not the identical product. Real
photos of your own stock should replace them.

Upload them with:

```
node --env-file=.env --import tsx scripts/seed-images.ts
```
