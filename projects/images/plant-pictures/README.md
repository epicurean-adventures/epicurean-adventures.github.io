# Plant pictures

One folder per plant (folder name = the plant's `id` in `projects/plants.json`).

## Adding a new growth photo

1. Drop the photo in the plant's folder, then create two scaled copies:
   - `YYYY-MM-DD.jpg` - max 1600 px, the full view
   - `YYYY-MM-DD_thumb.jpg` - max 600 px, used by the card grid
   (second photo the same day: `YYYY-MM-DD_2.jpg` / `YYYY-MM-DD_2_thumb.jpg`)
2. Add an entry to that plant's `photos` array in `projects/plants.json`
   (keep the array sorted by date - the newest photo becomes the card image).
3. Keep the untouched original in `_originals/` as `<plant-id>__<original-name>`.
   That folder is gitignored: full-resolution phone photos are large and their
   EXIF may contain GPS coordinates, so they never get pushed to GitHub.
   The web copies have EXIF stripped.

## Adding a whole new plant

Add a folder + photos as above, then a new object in `plants.json`. Fields:

- `nickname`: give the plant a name! Shows on its card and in its modal title.
- `lineage.parent`: set to another plant's `id` when this one was propagated
  from it - the page then shows the parent, and the parent lists its offspring.
- `lineage.propagationNote`: e.g. "leaf cutting, rooted in water, June 2027".
- `idConfidence`: `confirmed` / `likely` / `guess` (shows an "ID: best guess"
  badge so uncertain identifications stay honest).

A helper for scaling (from the repo root, requires Pillow):

```python
from PIL import Image, ImageOps
img = ImageOps.exif_transpose(Image.open("new-photo.jpg"))
for size, name in [(1600, "2026-09-01.jpg"), (600, "2026-09-01_thumb.jpg")]:
    c = img.copy(); c.thumbnail((size, size), Image.LANCZOS)
    c.save(f"projects/images/plant-pictures/<plant-id>/{name}", quality=82, optimize=True)
```
