# Ghost encyclopedia listing views and field references

Implemented locally on 14 September 2026. No commit, push, or GitHub Pages deployment was performed for this change.

## Delivered behaviour

- Cards, Compact list and Detailed comparison show the same 30 catalog ghosts. The selected view survives reloads.
- Search includes full evidence names and the new movement/timing notes. Comparing up to three selected ghosts works across views and searches; clearing selection restores the full comparison table.
- Encyclopedia entries use reference data independently of the current investigation's eliminated candidates. Existing evidence matching and saved investigations are preserved.
- Every ghost has footstep conditions, speed values, an approximate BPM preview, movement notes and timing references. Conditional profiles cover temperature, sanity, age, distance, electronics, state and objects. The Mimic lets users select the imitated ghost for audio and for timing.
- Ghost speed, Blood Moon, map size, hunt duration setting and the cursed-hunt extension are configurable. Hunt lengths exclude grace time and kill extensions. Obambo's aggressive-start hunt length is shown separately.
- Incense prevention, hunt cooldown and hunt-length buttons start the existing shared timer. Timer labels identify the ghost and purpose, persist through reloads, and keep immediately paused timers visible.
- Audio starts only on user input. One footstep stream plays at a time, ends after 12 seconds, and stops on view/search/condition changes, navigation and document hiding. Volume and stop controls are under Footstep audio. Browser audio failures leave the references usable.

## Audio and source boundaries

The sound is an original synthesized heel/scuff impact. It is a rhythm teaching aid, not a recording of the game or a unique voice for each ghost. The cadence approximation uses the community model `interval = 1 / effectiveSpeed - 0.075` seconds; no third-party audio, images, or player code are bundled. In-game cadence can vary with frame rate, turning and other conditions. The Myling's distance-dependent audibility is described in text, not reproduced by reducing playback volume.

The movement dataset is separate from the existing catalog and has a review date. Unknown future catalog IDs receive a clear unreviewed state instead of invented default mechanics. Links are shown in each ghost's references:

- [Hunt rules](https://phasmophobia.fandom.com/wiki/Hunt) and [Incense](https://phasmophobia.fandom.com/wiki/Incense): shared timing, speeds, modifiers and exceptions.
- [The Twins](https://phasmophobia.fandom.com/wiki/The_Twins): current additive speed offsets (1.5 / 1.9 m/s and 2.605 / 3.005 m/s chase caps).
- [Hantu](https://phasmophobia.fandom.com/wiki/Hantu), [Moroi](https://phasmophobia.fandom.com/wiki/Moroi), [Thaye](https://phasmophobia.fandom.com/wiki/Thaye), [Obambo](https://phasmophobia.fandom.com/wiki/Obambo), [Aswang](https://phasmophobia.fandom.com/wiki/Aswang), [Kormos](https://phasmophobia.fandom.com/wiki/Kormos), and [The Mimic](https://phasmophobia.fandom.com/wiki/The_Mimic): conditional profiles.
- [Community identification reference](https://phasmophobia.fandom.com/wiki/Guides/Identifying_ghosts): additional Gallu, Dayan and Myling details.
- [Deildegast speed reference](https://phasmo.guru/ghostspeeds/deildegast) and [community identification guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3635613545): object-dependent speed and hunt-cycle reset.
- [Unofficial Phasmophobia Cheat Sheet](https://tybayn.github.io/phasmo-cheat-sheet/): cadence model and limitations.

These are community reference facts checked during development, not measurements from a controlled in-game test.

## Validation performed

- `npm test`: 218 passed, including seven new mechanics checks. Covers catalog coverage, timing distinctions, current Twins offsets, conditional extremes, hunt settings, cadence and invalid preferences.
- TypeScript and Vite production build passed, including a separate build for `/ghost-hub/` in `artifacts/encyclopedia/site`.
- `npm run test:encyclopedia` passed against that production build at `http://127.0.0.1:4176/ghost-hub/`. The test is also included in the existing `test:browser` chain for future CI runs.
- Browser interactions cover all 30 entries in all views, full-name evidence search, empty search, comparison limits, speed modifiers, actual Web Audio sample scheduling, single-stream playback, all 30 direct dossiers, case preservation, Mimic selection, timer pause/resume/reload/navigation and disposal on navigation.
- Desktop, 390px and 320px checks found no page-level horizontal overflow. The comparison table has its own horizontal scroll region. Both themes, Casebook, 200% text and blocked storage were checked.
- Twelve scoped axe scans covering all three views, two themes and desktop/mobile reported no violations. This is automated coverage, not a claim of exhaustive accessibility certification.
- Separate production smoke verified service-worker offline reload, all 30 cached entries, offline audio/dossiers, unavailable-audio feedback and keyboard timer activation. No browser exceptions were reported.

Evidence: `artifacts/encyclopedia/browser-results.json`, `production-offline-results.json`, and the desktop/mobile screenshots in the same directory. Browser audio checks inspect real scheduled buffers and timing; no claim is made about a human speaker/headphone listening review.

The existing atlas work, previous encyclopedia planning documents and other in-progress workspace changes were not included in this implementation's source edits. The wider pre-existing browser suite was not rerun end-to-end; the focused encyclopedia suite exercised the shared timer and Casebook integration.
