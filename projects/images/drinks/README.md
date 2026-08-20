# Drink pictures

One folder per drink (folder name = the drink's `id` in `projects/drinks.json`).
Same conventions as `../plant-pictures/`:

- `YYYY-MM-DD.jpg` (max 1600 px) + `YYYY-MM-DD_thumb.jpg` (max 600 px);
  extra shots the same day get `_2`, `_3` suffixes.
- Untouched originals live in `_originals/` as `<drink-id>__<original-name>`
  (gitignored - large files, EXIF may contain GPS).
- Add each photo to the drink's `photos` array in `projects/drinks.json`;
  the first photo is the card cover.

`spencer-bar/sign.webp` is the background-removed cutout of the carved
"Spencer's Bar" sign (made with macOS Vision subject extraction). It's the
hero design element on `drinks.html` - keep it if you reshoot the sign.

New drink fields in `drinks.json`: `rating` (null now; 0-5 shows as stars),
`category` (`beer` / `spirits` / ...) and `subcategory` (`IPA` / `Pale Ale` /
`Gin` / ...) which together drive the two-level filter chips (both built
from the data - new values appear automatically), `abv`, `notes`, `dateTried`,
plus `maker` / `makerLocation` / `makerLogo`.

`_logos/` holds small brewery/distillery logos (webp). If `makerLogo` is null
the page shows a monogram badge instead (e.g. FOC for Fat Orange Cat).
