# Recorded game footsteps

Status: implemented in the local source and production preview; uncommitted and not publicly deployed. Package remains 1.0.0, based on revision `8eb1fd9`.

Release follow-up: publication of this version was subsequently requested on 9 October. The local validation status above is historical; use the GitHub deployment workflow's exact commit and completion result to identify a published release. This request does not establish a separate publisher media licence.

## What changed

The old production player explicitly excluded the locally configured game recording and generated a synthesized heel/scuff sound. The synthetic generator and development-only switch are removed. Both development and compiled builds now import the same original audio assets.

Twelve MP3 recordings cover six choices: Standard (one), Wood (two), Carpet (two), Gravel (two), Asphalt (two), and Metal stairs (three). Recordings for a surface alternate without changing playback rate or pitch. The existing approximate speed-to-cadence calculation and ghost conditions remain unchanged; the samples are shared footstep sounds, not recordings of thirty distinct ghost voices. They do not reproduce turning, every surface transition, spatial acoustics, distance or an entire live hunt.

The floor selector, volume and stop controls remain visible; the explanation and attribution expand below them. Playback shows a loading state, only one stream can play, and previews end after twelve seconds. Surface/condition changes, Stop, hiding the document and route exit cancel playback. A download failure displays an error and allows retry; it never generates replacement audio. Pending downloads are aborted on disposal and stale requests cannot start later.

Assets are imported with Vite's `?no-inline` handling for correct repository-base URLs, deterministic asset hashes and the existing offline manifest. The local preview serves MP3 files with `audio/mpeg`.

## Provenance and publication

The original samples were fetched on 9 October 2026 from public URLs referenced by [Zero-Network's metronome asset list](https://github.com/tybayn/phasmo-cheat-sheet/blob/99254f2f7f717594abc73bdda8607bd4fd06978a/scripts-v10/metronome-v7.js). No third-party player code was copied. The complete twelve-file ledger is `src/hub/ghost-reference-media.json`: 120,179 bytes in total. The Standard sample has SHA-256 `7e25fb83c59d0a2e7356abc688d69541d93fb36b43d77e8c8beb3787172a9346` and matches the previously available local recording.

Game sound belongs to Kinetic Games. Source attribution is not an open media licence or permission to republish. [Kinetic's Gaming Content Guidelines](https://www.kineticgames.co.uk/gaming-content-guidelines) restrict publishing sound effects separately from ordinary gameplay content, and the reference site's publisher permission is site-specific. Public redistribution permission has not been established for Ghost Hub. This implementation is currently a local build and preview; review that permission before any public release containing these audio files.

## Journal artwork

The Evidence candidate cards now use the same 24 credited journal emblems as the encyclopedia, replacing the repeated generic ghost symbol. The component is shared without a circular dependency. Artwork retains the original wiki source/credit links. Six newer ghosts have no verified emblem in the reviewed wiki image metadata: Aswang, Dayan, Deildegast, Gallu, Kormos and Obambo. They show a neutral question mark with an unavailable-artwork tooltip; their dossier includes a visible explanation. No fan-made or generated emblem is called official.

Attempts to download the existing journal images from the image CDN returned HTTP 403, so they remain original-host references. No access restriction was bypassed and no broken image files were saved. Normal interface and evidence symbols remain Lucide; they are not claimed as game artwork.

## Validation

- 237 automated tests passed and TypeScript passed. The Pages-base production build passed, retaining the existing >500 kB JavaScript advisory.
- `scripts/footstep-browser-check.mjs` verifies the original SHA-256 for all twelve local files and the exact bytes decoded by the browser. All samples decode to non-silent audio. Their native playback rate is 1; cadence and alternating surface variants are checked. No synthetic AudioBuffers are constructed.
- Browser checks cover no autoplay, surface changes, volume, stop, automatic ending, route disposal, failed-download retry and cancellation while loading. All twelve MP3s appear in the production offline manifest; playback works after an offline reload.
- Sound controls fit at 1440, 390 and 320 px with three scoped accessibility scans and no captured runtime errors. Existing encyclopedia checks passed for all thirty dossiers, three listing views, Casebook, twelve accessibility scans and timer integration. Dossier checks passed across thirty dossiers, thirty-seven media entries and twenty-four accessibility scans; external-player transport is fixture-controlled in that suite.
- The existing investigation/mobile workflow suite passed six groups, twenty-five layouts and eight scoped accessibility scans.

Evidence is kept in ignored `artifacts/footsteps/`. These checks verify downloaded recordings, browser decoding and playback scheduling. Human speaker/headphone audition and a controlled comparison with the installed game's current build remain unverified.

## Superseded notes

This implementation supersedes the audio behavior in `actual-footstep-local-preview-2026-09-14.md` and `ghost-listing-views-2026-09-14.md`. Those documents remain historical records. `.env.local`'s old `VITE_LOCAL_FOOTSTEP_SAMPLE_URL` value and the old ignored MP3 are no longer read by the player; existing local files were preserved.
