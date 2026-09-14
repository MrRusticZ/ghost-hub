# Equipment library upgrade — 15 September 2026

The existing equipment index and all 21 equipment routes now use a searchable photo gallery, a numeric quick-reference table and individual guides with all three tiers. The same components support the classic hub and Casebook. Existing route names and investigation data are preserved.

## Interface

- 63 tier photographs, one equipment-wall reference and a dedicated icon for each tool.
- Tier-aware gallery, category counts, starter-kit and non-electronic filters, multiword and legacy-name search, numeric price/unlock sorting, clear/reset actions and a useful empty state.
- Three-tier comparisons with unlock levels, purchase price, contract limits, consumption/electronics status, original field instructions, caveats and related tools.
- Native image dialog with Escape, close button, focus restoration and individual credits. Lazy-loaded, locally bundled images avoid third-party image requests during normal reading.
- Container-responsive layouts, contained keyboard-focusable tables, visible focus states, light/dark themes and reduced-motion support.

## Research and provenance

Reviewed the live community wiki's Equipment page and each tool's article through its public MediaWiki API. `src/hub/equipment-specs.json` stores the article revision, factual infobox values and exact current tier image assignment. Every guide links to that pinned revision. The equipment overview was revision 24244. This is reference verification, not an assertion that each mechanic was reproduced in the game.

Notable corrections include the current UV flashlight/glowstick order despite older image filenames, Sound Recorder Tier II's level 39 unlock, the ghost-only Tier III motion sensor, distinct head-gear functions, and finite contract fuel versus reusable purchases. Incense burning, blindness and hunt prevention are explained as different timers. Upgrade fees are explicitly separate from the displayed per-unit purchase prices.

All 64 WebP assets are unmodified game-reference images obtained from the community wiki's image CDN. The ledger `src/hub/equipment-media.json` records original and delivered URLs, original file page, uploader, upload date, dimensions, bytes and SHA-256. The complete set is 1,453,832 bytes. Game imagery belongs to Kinetic Games; uploader credit does not imply an open licence. These limited identification and commentary references are excluded from source-code licensing. Individual credits are available in the image viewer; the equipment wall is credited beside its image. Historical upload dates are disclosed.

## Validation

The six equipment tests cover all 21 preserved routes, 63 distinct tier records, eight starter tools, tier-dependent filters, legacy-name searches, numeric sorts, current UV image identity, reusable equipment semantics and byte-for-byte integrity of all 64 bundled images.

Browser checks exercised gallery/table switching, all 21 guide routes, tier selection, starter/non-electronic filters, search aliases, empty-state reset, price sorting, section navigation, the image dialog and Escape/focus return. Responsive frames used actual 320, 390 and 768 px widths, including Casebook. Their document widths remained contained (305, 375 and 753 px after scrollbars); wide reference tables scroll within their own keyboard-accessible region. Light and dark themes were visually inspected. The phone image dialog fit within the available width.

The publication workflow also runs the repository's full unit/build and browser suites, including offline loading, accessibility, Casebook, maps, encyclopedia and community checks, before deploying. Public media verification compares deployed files against all 64 source-ledger SHA-256 hashes; release status is reported after that workflow completes.
