# Ghost Hub status

## 2026-10-09 - Release candidate

The recorded-footstep, journal-artwork and match-workflow changes below are prepared for the requested GitHub Pages release. Deployment must pass the repository's automated build and browser gates. The dated sections below describe validation before publication; the deployment workflow and its exact commit establish the publication result.

Release scope: twelve original footstep recordings/six surfaces, shared journal emblems, Evidence timer/notes, investigation shortcuts and mobile navigation fixes. Existing unrelated prototypes and local documentation are excluded. Audio attribution and the source-specific rights limitations remain documented in ASSETS.md; publication is not a claim of publisher endorsement or a new media licence.

Release gate correction: the first GitHub run stopped when the optional wiki image host returned errors. The extended browser check now deliberately fails the exact twenty-four credited journal-image URLs and requires every unavailable-artwork fallback, while preserving fatal checks for all other failed resources. This tests the existing outage behavior without making publisher availability a prerequisite for validating the application's own offline assets.

## 2026-10-09 - Real recorded footsteps and journal artwork

State: implemented and validated locally; uncommitted, not publicly deployed. Base revision remains `8eb1fd9`.

- Removed the synthesized footstep generator and the development-only audio override. Development and compiled previews now use twelve original downloaded game recordings, with six selectable floor surfaces, unchanged pitch and the existing ghost-speed cadence model.
- Added visible surface/volume/stop controls, a loading state and honest failure/retry behavior. Original recordings are bundled at the correct Pages path and cached for offline use. Local preview MP3 responses use `audio/mpeg`.
- Shared the twenty-four existing credited journal emblems with Evidence candidate cards. Six ghosts with no verified official emblem have an explicit unavailable-artwork state. Their original-host image URLs remain in use; CDN downloads were denied, and no substitute images were fabricated.
- Recorded exact audio sources, retrieval timestamps, byte counts and SHA-256 values in `src/hub/ghost-reference-media.json`; updated ASSETS and marked the older audio notes superseded. Preserved prior workflow work and unrelated files.

Validation: 237 tests; TypeScript; Pages-base build; actual browser decoding/hashes of all twelve samples; unchanged pitch and correct cadence; six surface choices; stop/retry/loading cancellation; offline reload; 320/390/1440 layouts and three audio-control accessibility scans. Existing encyclopedia (thirty ghosts, twelve scans), dossier (thirty dossiers/thirty-seven media, twenty-four scans) and field-workflow suites (twenty-five layouts/eight scans) passed. No captured runtime errors. Evidence: ignored `artifacts/footsteps/`.

Remaining: human listening/current-game comparison; the pre-existing bundle-size advisory; six unverified official emblems; public redistribution permission for Kinetic game audio. The reference site's permission does not transfer to Ghost Hub. No public release was performed. See `docs/real-footsteps-2026-10-09.md`.

## 2026-10-08 - Match workflow and mobile navigation

State: implemented and validated locally; uncommitted, not published.
Base revision: `8eb1fd9ccfaae8ed701b70bf669ba7a36fb58181`. Package: `1.0.0`.

### Changes

- Added investigation shortcuts for Evidence, Detective, Maps, Tools and Notes. They become a fixed, safe-area-aware bottom bar on smaller screens and display the shared timer's status.
- Added a collapsible timer and quick-notes panel to the Evidence book using the existing TimerProvider and investigation session. There is no second timer or notes store, and no storage-schema migration.
- Enlarged mobile evidence controls, condensed the mobile Evidence heading, collapsed behaviour details by default on new mobile sessions, and added a focused jump to remaining ghosts.
- Corrected the mobile navigation drawer: hidden links are inert, an open menu contains keyboard focus, Escape/close restores focus, selecting a destination closes the menu, background scrolling is locked, and resizing back to desktop restores access.
- Added `test:field` to the existing browser validation gate. Existing prototypes, reference data, game rules and optional service configuration were preserved.

### Validation

- 237 existing automated tests passed; TypeScript passed.
- Production build passed with `GH_PAGES_BASE=/ghost-hub/`.
- All nine existing browser scripts passed: general routes, storage/offline cases, isolated chat integration, Casebook journeys/edge cases/accessibility, atlas, encyclopedia and dossiers.
- New workflow suite passed against both development and production preview: six workflow groups, 25 layouts at 320/390/768/1024/1440 pixels, eight scoped accessibility scans, zero captured runtime errors.
- Verified shared notes, evidence, timer pause/resume/completion/reset, reload persistence, Casebook destinations, keyboard focus, same-route menu closure and responsive resizing.
- Reviewed desktop/mobile screenshots. Home component, shared base styles, session schema and deduction engine retained their SHA-256 hashes. Homepage screenshot dimensions match; pixel-identical rendering is not claimed.
- `git diff --check` passed. Check logs, reports and screenshots are in ignored `artifacts/field-workflow/`.

### Remaining

- The existing Vite warning for a JavaScript bundle above 500 kB remains; code splitting is separate work.
- Physical-phone, human screen-reader and in-game use acceptance remain unverified.
- No public release was performed. Next: review the local preview, then publish the accepted revision under a separately authorized release.

### Environment note

The legacy workspace path is a compatibility junction. The physical path contains an ampersand; npm-generated Windows command shims failed there. Validation used the equivalent direct Node entry points (`node --import tsx --test tests/*.test.ts`, `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/vite/bin/vite.js build`, and each browser script). No toolchain files were changed.
