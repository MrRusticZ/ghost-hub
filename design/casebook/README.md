# Casebook material assets

Created for this implementation with the built-in image generation tool. No external stock images or new icon system are used. UI lettering, bookmarks, buttons, rules and icons remain native HTML/CSS and the existing Lucide icons.

| Original | Actual source dimensions | Runtime delivery |
|---|---|---|
| `paper-source.png` | 1672 × 941 | `src/hub/assets/book-paper.webp`, tiled at 836 × 470 CSS pixels; 600 × 338 compact delivery below 720 px |
| `binding-source.png` | 1254 × 1254 | `src/hub/assets/book-binding.webp`, compressed 512 × 512, tiled at 128 CSS pixels |

The sources are high-detail material tiles, **not native 4K full-page paintings**. Actual rendered 3840 × 2160 browser captures are saved under `artifacts/casebook/`. Texture is decorative and does not encode information. The paper occupies a bounded material layer, and the narrow cloth binding remains static; rendering a huge texture and shadow behind every long chapter was measurably slower.

Paper generation brief: a flat archival scan of warm ivory cotton paper, fine fibers, quiet paper grain and restrained wear; low contrast, no lettering, objects, borders or directional lighting, suitable for a repeatable notebook material.

Exact binding prompt:

> Generate a production texture asset: a perfectly flat orthographic macro scan of dark muted olive charcoal linen bookbinding cloth with subtle rubbed wear and tiny irregular fibers. Uniform subdued material across entire square image, seamless tileable feel, no objects, no page, no book silhouette, no stitching, no words, no symbols, no lettering, no borders, no directional lighting, no vignette. Very low contrast, authentic fine fabric thread detail suitable for an elegant investigator's physical notebook binding. Highest available resolution, ideally 2048 by 2048. Material texture only.

Original generated files were copied into this folder. Pillow was used only for delivery resizing and WebP compression. No rasterized text or controls were added. Requested resolution and actual generated resolution differ; the table records the delivered originals accurately.

The compact paper derivative is 3,714 bytes; the desktop paper is 150,300 bytes. CSS selects the compact derivative on small screens, so the large paper is not required there.
