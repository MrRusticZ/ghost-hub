# Ghost encyclopaedia media release

Approved direction: the ghost-specific media review, integrated into the existing Ghost Hub rather than published as a separate prototype.

## Coverage and research

- All 30 roster entries have three observations, three field-test steps, relevant comparison links and a ghost-specific video or guide chapter.
- 37 media references: 31 contextual videos/chapters, three evidence stills and three gameplay animations. Videos open at the published ghost chapter; sound never autoplays. Animation requires an explicit start and can be stopped.
- 24 original journal emblems, credited to their wiki uploaders and Kinetic Games. The six newer ghosts have stable dossier numbers instead of invented artwork or unrelated screenshots.
- All 30 evidence triples match the current article infoboxes. The five forced-evidence entries remain Hantu/freezing, Goryo/D.O.T.S., Obake/UV, Moroi/Spirit Box and Deogen/Spirit Box. Mimic orbs remain separate from the evidence budget.
- Current behaviour sections were reviewed on 14 September 2026. Exact article revision IDs, source timestamps and evidence comparisons are recorded in `encyclopaedia-source-audit-2026-09-14.json`.
- Checked official 0.19.0.0 and 0.19.0.1 notes, including the Yurei door-sound fix and Oni singing-event sanity fix. Newer placeholder advice for Aswang, Kormos and Deildegast has been replaced. Deogen distance labels and the Mimic/Moroi blinding exception were corrected.

This is a source review, not independent game-runtime proof of every mechanic. Dates attached to videos and images are separate from the field-note review date. Historical demonstrations can show older mechanics; the adjacent current notes explain the identification conditions.

## Media provenance

Media stays on its original host. No personal screenshots, invented gameplay, isolated game sound effects, extracted game assets or creator video downloads are published by this release.

- Madixx, [The Ultimate Ghost Guide for Phasmophobia — 2026](https://www.youtube.com/watch?v=zX-gJUfQICA), 21 March 2026: published chapters for 27 ghosts. Embedded with exact start/end times.
- hydrasung: [Aswang](https://www.youtube.com/watch?v=l9kY1kyxxzY) and [Kormos](https://www.youtube.com/watch?v=MRgq9rsmDqE), 2026; public creator metadata checked.
- Lil_P66: [Deildegast guide](https://www.youtube.com/watch?v=F5LabXOPdlA), 21 July 2026.
- Justly: [Banshee call compilation in gameplay](https://www.youtube.com/watch?v=20CDZj4WkKA), 15 July 2025.
- Wiki image and animation files retain original source URLs, uploader names, dates and descriptive alternatives in `src/hub/ghostDossiers.json`. Game artwork belongs to Kinetic Games. A file's presence on the wiki is not represented as a blanket free-use licence.

## Implementation and validation

The accepted review layout sits above the existing footsteps, timers and evidence checklist. All three listing views retain their existing behaviour. A source-image failure preserves the written dossier and original-source link. Dossier changes and starting footsteps remove a loaded video; starting a media reference stops footsteps. Backgrounding the page stops playback.

`npm run check` validates the catalog, evidence engine, source coverage, chapter URL safety, mechanics and production build. `npm run test:encyclopedia` checks all 30 routes, 37 media controls, listing/search/comparison behaviour, audio and timers, desktop/390px/320px layouts, light/dark themes, reduced motion, external-image failure and accessibility. External player transport is stubbed in the deterministic media suite; real source metadata and representative original images/player behaviour are checked separately. Casebook and atlas regression suites also run before release. GitHub Pages runs the full existing browser suite before deployment.

Catalog version: **2026.09.14.1**. Review date: **2026-09-14**. Release preparation completed across midnight into 15 September 2026.
