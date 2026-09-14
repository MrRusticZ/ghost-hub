# Cursed possessions: reference and validation record

Implemented 14–15 September 2026. The existing `#/cursed` collection and seven `#/cursed/:id` routes now share a dedicated dossier system. The same components also work inside the existing Casebook presentation. No authentication, database, investigation-state or map editing system was replaced.

## Delivered reading experience

- An illustrated collection with Gallery, Quick reference and Watch & learn views; multiword search; purpose filters; visible result counts; and an explicit reset when there are no matches.
- Seven full dossiers with recognition imagery, use steps, sanity/capacity facts, failure conditions, practical field notes, and section navigation. The item switcher keeps the other six objects accessible without returning to the index.
- Ten tarot faces and outcomes, category filters, and independent-draw probability estimates for Death, The Hanged Man and The High Priestess.
- Fifteen practical Ouija phrases with costs, response interpretation, text-interface availability, and sanity response bands. The deliberate hunt is explicitly marked as a hunt rather than an ordinary zero-cost answer.
- Ten Monkey Paw wish groups, including five weather choices, with benefits beside consequences, search, category filters, wish budgets, and optional tag locations.
- A mirror sanity planner using the greater of the activation minimum and duration cost, with an explicit breaking-point result.
- Thirty local reference assets: 26 stills and four genuine animated WebP gameplay captures. Native image enlargement supports Escape, modal focus and return focus. Motion requires an explicit Play action and has a Stop control.
- Seven timestamped chapters from Insym's guide. YouTube is contacted only after Load is selected; autoplay is disabled and a direct YouTube link remains available.
- Map selection opens the existing atlas with the selected map query. Location photographs are examples, not substitutes for the atlas's dated reference sheets.
- Light, dark and Casebook presentation support, responsive grids, labelled table scroll regions, keyboard controls, reduced-motion CSS and print treatment.

## Research ledger

Mechanics were retrieved through the live community wiki's MediaWiki API on 14 September 2026. Search-engine extracts were used to find material, then checked against live pages. Original wording is used for explanations. These are sourced reference findings, not gameplay verification of every interaction in the current build.

| Item | Reviewed revision | Revision date |
| --- | --- | --- |
| [Haunted Mirror](https://phasmophobia.fandom.com/wiki/Haunted_Mirror?oldid=21290) | 21290 | 29 June 2025 |
| [Ouija Board](https://phasmophobia.fandom.com/wiki/Ouija_Board?oldid=23282) | 23282 | 29 April 2026 |
| [Music Box](https://phasmophobia.fandom.com/wiki/Music_Box?oldid=22940) | 22940 | 14 March 2026 |
| [Summoning Circle](https://phasmophobia.fandom.com/wiki/Summoning_Circle?oldid=24663) | 24663 | 14 September 2026 |
| [Voodoo Doll](https://phasmophobia.fandom.com/wiki/Voodoo_Doll?oldid=23852) | 23852 | 19 June 2026 |
| [Tarot Cards](https://phasmophobia.fandom.com/wiki/Tarot_Cards?oldid=24650) | 24650 | 13 September 2026 |
| [Monkey Paw](https://phasmophobia.fandom.com/wiki/Monkey_Paw?oldid=24659) | 24659 | 13 September 2026 |

Shared conditions were checked against [Cursed Possession](https://phasmophobia.fandom.com/wiki/Cursed_Possession), [Hunt](https://phasmophobia.fandom.com/wiki/Hunt) and [Crucifix](https://phasmophobia.fandom.com/wiki/Crucifix).

The [official 0.19.0.1 patch, 10 September 2026](https://store.steampowered.com/news/externalpost/steam_community_announcements/1843481262691864), was verified through Steam's news API. Its relevant fixes cover the knowledge wish removing valid evidence, Ouija interaction after opening the journal during an answer, and the Monkey Paw spawn in Prison Restricted. This is linked in the page's source disclosure.

### Conflicts and version-sensitive facts

- The live Music Box article gives approximately 2.6% sanity per second within 3 m; the broader Sanity article still gives 2.5% within 2.5 m. The dossier explicitly discloses this disagreement. A conflicting Yokai appearance-range entry is not offered as a reliable ghost test.
- Current Monkey Paw reference boundaries are 5 wishes at 0–1× reward, 4 at over 1–2×, and 3 above 2×. Older guide thresholds are not silently reused.
- The trap wish is described as a standard hunt with reported protection abnormalities. The UI does not incorrectly label all wishes as identical cursed hunts.
- The Hermit now lists 90 seconds, and does not guarantee protection from hunts or events.
- A mirror activation uses `max(20, 7.5 × active seconds)`, not an added 20% charge plus drain.
- The circle's ordinary five-second appearance has no extra grace second; low-sanity and existing-hunt exceptions are separate.
- A cursed hunt's extra duration carries to later hunts; their other initiation rules do not automatically become cursed.
- The tarot deck-exhaustion extension and life-wish failures are explicitly identified as reported issues, not guaranteed intended mechanics.

### Media provenance

`src/hub/cursed-media.json` is the asset ledger. Its 30 entries record both identity and byte-level integrity. The wiki's delivered WebP files are bundled so stills do not depend on third-party hotlink availability. All 26 still images together are below 2.1 MB; animations load into the visible page only when requested. The existing service worker may pre-cache build assets for offline reference.

Insym's [All Cursed Possessions Explained](https://www.youtube.com/watch?v=O17MdnntqoE) was checked through its public description and YouTube oEmbed metadata. Chapters start at 1:13 (mirror), 6:59 (doll), 13:56 (music box), 21:10 (circle), 30:45 (board), 55:39 (tarot) and 1:06:42 (paw). The creator identifies the recording as v0.9; the page presents it as archival visual guidance. Source upload dates on photographs do not verify the game build in which they were captured.

## Validation

Targeted tests in `tests/cursed.test.ts` verify preservation of all seven routes, valid map/media references, all 30 file hashes and WebP signatures, four real animations, complete tarot probability distribution, wish uniqueness, mirror minimum/duration costs, independent-deck odds, and combined item search.

Final verification: `npm run check` passed all **231 tests**, with zero failures, and completed TypeScript checking and the production Vite build. Vite reports its advisory about the shared application JavaScript bundle exceeding 500 kB (approximately 598 kB uncompressed / 178 kB gzip); it is not a build failure. The build log is retained locally in `artifacts/cursed-final-check.log`.

Browser checks used the running local Vite app through the supported browser controls. Responsive checks used same-origin frames at explicit device widths because the browser's viewport override did not change its actual viewport. These exercise the real route and CSS, not a separate mockup.

- Multiword search returned the matching mirror; an unmatched search exposed Reset filters; Recovery selected Tarot Cards and Monkey Paw.
- Quick reference rendered seven rows. At a 390 px frame, the table scrolled inside a 335 px region while the document remained 375 px wide, without page overflow. The 768 px frame likewise had equal document/client width of 753 px.
- The mirror clip switched to its animated asset and exposed Stop, then returned to its still poster.
- Enlarging a photograph opened a native modal, focused Close, closed on Escape, and returned focus to its originating photo button.
- The media deep link positioned its section below the sticky navigation (approximately 85 px from the viewport top).
- The YouTube privacy-enhanced player loaded with the correct creator and video title. This verifies player availability, not uninterrupted network playback for every visitor.
- The mirror slider's zero-sanity boundary reported a break. Tarot showed ten cards, two Danger results, and 1% / 10% / 2% probabilities for one draw.
- Ouija search for bone returned one 20% row. Monkey Paw search for revive returned the life wish from ten total wish groups.
- The map selector opened `#/maps?map=willow` with 13 Willow Street selected.
- Light mode and Casebook layouts were visually inspected. Casebook retained seven gallery cards, preserved its presentation in item links, and displayed all ten tarot outcomes.
- A 320 px frame exposed the existing body's 320 px minimum plus a desktop scrollbar. A cursed-page-scoped override removed that overflow; document and client widths both measured 305 px afterward. Tarot cards remained readable in one column, and the photo modal fitted within 284 px.
- All seven dossiers were opened. The additional Music Box, Summoning Circle and Voodoo Doll photo sections loaded their actual object and location images and retained equal document/client widths on desktop.

## Implementation boundaries

The content, media components, page components and stylesheet are separate files under `src/hub/`. `ReferencePages.tsx` re-exports the replacement page while preserving the known-bugs page. No package dependencies were added. The source acquisition staging page was removed before the final build. Research downloads and the responsive QA harness remain ignored local artifacts, not published pages.
