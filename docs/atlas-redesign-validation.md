# Map atlas redesign validation — 14 September 2026

## Delivered

- The subsequent room-schematic pass adds 54 selectable rooms across ten floors of Tanglewood, Willow, Edgefield and Ridgeview, with source-aligned markers and a desktop workspace whose notes scroll independently. See `atlas-schematics.md` for its coverage, validation and limits.
- Professional monitor refinement: compact neutral interface, square annotation markers, restrained line icons, and a default monochrome layout display. A four-stage SVG display filter flattens chromatic room fills while retaining neutral walls and text; the original source files remain unchanged.
- Original colour can be selected at any time; the full reference sheet always retains its original colours. Personal uploaded images are unfiltered. Monitor is explicitly a layout view; original colour is needed for colour-coded restrictions and spawn symbols.
- Dedicated location directory, floor-focused map workspace and marker inspector, scoped to the existing Maps route and compatible with Casebook.
- 18 original Fantismal reference sheets bundled through Vite, with creator credits and source versions/dates. Covers 13 ordinary locations and five Sunny Meadows restricted-wing variants.
- Current downloaded Tanglewood (3 March 2026) and Willow (21 July 2026) reworks; individual Point Hope floors; Grafton attic and both cabin floors at Maple Lodge.
- Search, floor selection, full reference sheet, pan, zoom/fit, expanded view, marker categories, visibility, position/label edits, removal, import/export and local floor-image storage.
- Existing untyped/v1 markers remain personal-board notes. Reference markers are distinct, and Sunny Meadows variants have isolated markers.

## Completed checks

- `GH_PAGES_BASE=/ghost-hub/ npm run check`: all 206 existing tests passed; TypeScript and the production build passed.
- `ATLAS_TEST_URL=http://127.0.0.1:5175/ npm run test:atlas`: all interaction scenarios passed with no page errors. Checks real marker coordinates, zoom/pan, floor/wing isolation, reloads, valid and invalid imports, exports, local images, ten Point Hope floors, mobile/tablet layouts, Casebook, expanded view and image-error handling.
- Automated axe checks scoped to the atlas: zero WCAG A/AA violations in dark and light themes. This is not a complete accessibility certification.
- Production served at `http://127.0.0.1:4175/ghost-hub/`: correct subpath assets, all 18 sheets in the service-worker manifest, offline reload, offline switch to Willow, and offline marker save/reload passed.
- Visual inspection: desktop and mobile screenshots, both themes, all focused source crops; corrected clipped room labels and separated the Point Hope floors.
- `git diff --check`: no whitespace errors.

Screenshots and browser results are in the ignored `artifacts/atlas/` folder. Repeatable interaction/accessibility checks are in `scripts/atlas-browser-check.mjs`, registered as `npm run test:atlas` and included in `test:browser`.

The monitor refinement was rechecked with `npm run check`, the atlas browser suite, and the production/offline check. Additional assertions verify display-preference persistence, unchanged marker coordinates and map bounds across display changes, original-colour full sheets, and unfiltered uploaded images. Desktop, mobile, light theme, Brownstone, Sunny Meadows, Point Hope and Woodwind monitor previews were inspected. `artifacts/atlas/production-desktop.png` shows the production rendering, including the SVG filter loaded from the bundled stylesheet.

## Limits and release state

- These are attributed community references; no in-game/runtime validation of every room or spawn is claimed. Each sheet exposes its source version/date. Consult the contract for available hiding spaces and spawns.
- Prison Restricted, Brownstone Restricted and Point Hope Restricted show an explicit full-site-reference warning; the creator's downloaded album does not include those three August 2026 restricted layouts.
- Images are precached after the service worker finishes installing. Marker exports do not contain uploaded personal floor images.
- The redesign is available in the local preview. No commit, push, or public GitHub Pages deployment was performed. The workspace already contained other uncommitted work, which has been preserved.
