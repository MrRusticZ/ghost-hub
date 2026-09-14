# Detective and Casebook Preview — implementation and verification

Local preview: http://127.0.0.1:5173/#/casebook/detective

Classic remains the default at `#/`. This implementation has not been published or substituted for the public site. Existing backend configuration, permissions, sharing formats and release gates remain in place.

## Delivered experience

- A persistent Casebook frame with six bookmarks, Contents, fourteen ordered chapters and named previous/next controls. All existing reference, detail, community, utility and owner destinations can be reached inside the book. The equivalent classic link retains route queries and the same investigation.
- Immediate client-side hash navigation. The 160 ms decorative page-edge animation cancels when another destination is selected. Reduced-motion and the existing effects preference disable it.
- Dark and light themes across both interfaces. The top-right button names its action; the saved preference is applied before rendering. Existing users begin in dark mode.
- Original paper and cloth material assets, responsive layout, real text and the existing icon vocabulary. See `design/casebook/README.md` for source dimensions and generation provenance.
- Shared Detective conversation and draft in IndexedDB, shared evidence, case replacement boundaries, and route-specific presentation state. Browser Back/Forward restores route and reading position. Large inactive chapters are unmounted; offscreen ghost cards use browser rendering containment.
- Root-owned timer lifecycle, map floor/image/zoom/marker continuity, preserved typed Voice commands, microphone cleanup on leaving, and preserved community submission/chat drafts. Credentials remain outside chapter-state storage.

## Local Detective

`src/hub/detectiveEngine.ts` separates interpretation, dialogue decisions, grounded replies and proposals. It uses the existing catalogue and curated topic copy with reference URLs and content version. This is a deterministic local guide, not an LLM or an autonomous researcher.

Replies address the observation first, ask at most one question, and provide at most three supported reply choices. Pending questions handle short answers, uncertainty, corrections and explanations; changed case assumptions clear that context. Repeated failed clarification offers a different route instead of continuing to interrogate the player. Equipment questions remain explanations rather than evidence reports. The labelled tests include supported contractions, aliases, misspellings, negation, hypothetical statements, conflicting reports and topic changes.

Case recommendations use compatible candidates, selected evidence count and attempted tests. They do not invent identity probabilities. Reference detail and source links are optional expansions. The guide's local capabilities appear in one accessible information panel.

Proposals list selectable changes and require an explicit Add to case action. Confirmed evidence cannot be silently overwritten by an inconclusive report. Replacements need explicit review. Application validates the current case ID and fingerprint again; old, already applied or changed-context proposals are inactive. Corrections and retracted reports also retire earlier pending proposals, while informational questions leave them available. Undo uses the existing investigation history. Diagnostic observations collect their required condition confirmation before being offered.

## State and failure handling

| State | Owner and persistence |
|---|---|
| Evidence, investigation, journal | Existing Hub state and validated local storage formats |
| Dialogue, messages, draft, case boundary | Workspace provider; separate `ghost-hub-workspace` IndexedDB database |
| Chapter filters, selections and positions | Chapter state and session storage; browser-memory fallback |
| Theme, last chapter, effects and sound | Existing small preference storage |
| Timer deadline and completion | Timer provider above routed pages; existing timer persistence |
| Floor images | Existing atlas IndexedDB storage; object URLs cleaned up on leaving |

The conversation save status reflects actual completion. If IndexedDB fails, the Detective remains usable in memory and displays “Not saved · kept in this tab.” Export remains available. Importing, restoring or resetting a case separates earlier conversation history and invalidates old proposals. External investigation storage events refresh case state and discard incompatible undo history.

Only core installed assets are guaranteed offline. The production service-worker manifest includes the bundled knowledge, fonts and material assets. An installed Casebook can reload offline; an uninstalled first visit cannot. Community connection states and browser speech-provider limitations remain explicit. No hosted-AI request is issued by either Detective view.

## Verification evidence

Final local verification on 14 September 2026:

| Check | Result |
|---|---|
| Automated tests and production build | 211 tests passed; build passed |
| Labelled Detective evaluation | 130 utterances and 24 multi-turn conversations passed |
| Route/interface/theme/viewport matrix | 228 combinations passed |
| Direct destinations and refreshes | 189 checks passed |
| Casebook automated accessibility | 40 axe scans; zero detected violations |
| Full browser regression command | Passed, including classic, compatibility, community, Casebook and atlas suites |
| Local Detective processing | 0.22 ms p95 on the recorded reference machine |
| Warm chapter navigation | 32.7 ms p95 in the explicitly software-rendered lab run; default headless GPU results remain variable as documented below |
| Tested production snapshot versus final dist | All 49 files byte-identical |

Clean actual-render captures are `artifacts/casebook/preview-dark-4k.png`, `preview-light-4k.png`, `preview-dark-mobile.png` and `preview-light-mobile.png`. This is local verification, not a public deployment or a claim that the hardware-independent performance target is universally met.

Run `npm run check` for unit checks and the production build. With Vite on 5173, the existing community test service on 4387 and the production preview on 4173, run `npm run test:browser`. The production build must use the same base path as the production preview. The release workflow already starts these services and now includes `npm run test:casebook` in its browser gate.

Current evidence is written to:

- `artifacts/casebook/final-check.log`: all automated tests and production build.
- `artifacts/casebook/dialogue-evaluation.json`: the 130 passed utterance labels, 24 passed dialogue labels, timing and source hashes.
- `artifacts/casebook/final-browser.log`: classic, compatibility, community and Casebook browser gates.
- `artifacts/casebook/results.json`: route/theme/viewport matrix, continuity journeys, automated accessibility checks and navigation timings with machine metadata.
- `artifacts/casebook/edge-results.json`: storage failure, microphone cleanup, map upload/navigation, journal restoration and production offline checks.
- `artifacts/casebook/*-{dark,light}-{3840,2560,1920,820,390,320}.png`: actual browser captures of Evidence and Detective. Desktop captures use the exact viewport size; narrow captures include the full page.

The conversation corpus contains 130 distinct labelled utterances and 24 multi-turn conversations, plus separate safety, context and instructional-question regression tests. These measure the specified cases, not general intelligence or ghost-identification accuracy. All evidence-safety assertions must pass.

Direct-link checks also exercise 189 destinations and refreshes, including reference detail pages and explicit map/search queries. The route matrix covers 228 combinations of destinations, interfaces, themes and desktop/mobile widths. Forty axe scans cover the core chapters, remaining chapter families, Search, Share, Settings, About and classic Detective across both themes. The additional production audit is recorded in `artifacts/casebook/remaining-accessibility.json`. Zero detected violations is an automated-check result, not a certification of complete WCAG conformance or screen-reader usability. Additional manual visual inspection covers mobile density and actual 4K composition.

Navigation timing measures hash change to active chapter commit and two animation frames at 1920 × 1080 in headless Edge with explicit software rendering (`--disable-gpu`) using the optimized production build, a completed offline installation, a fresh case and six warmup chapter visits on the recorded local machine. It includes rendering, not just React execution. The target is p95 below 200 ms; local dialogue processing targets p95 below 100 ms. These lab timings are separate from field INP, and no real-user INP or player satisfaction score is claimed.

## Scope and remaining external validation

All fourteen chapter destinations use the preview frame and retain their existing application functionality. The encyclopedia remains the existing dossier system; no missing game facts, floorplans or media were invented. This upgrade does not independently validate all bundled game mechanics. Connected service regressions use the existing local test backend; they do not prove a hosted service is configured or available publicly.

Actual player feedback is still needed to assess whether the Detective feels more welcoming and whether the book navigation is more enjoyable. Browser audio completion depends on browser permission and suspension policy; mobile device and assistive-technology testing should accompany a public release. Classic replacement remains a separate decision.

## Reproducing the local release checks (PowerShell)

Build once for the production preview path:

```powershell
$env:GH_PAGES_BASE='/ghost-hub/'
npm run check
Remove-Item Env:GH_PAGES_BASE
```

Keep these three processes running in separate terminals from the project directory:

```powershell
npm run dev -- --strictPort
```

```powershell
npm run server
```

```powershell
$env:PREVIEW_BASE='/ghost-hub/'
node scripts/preview-production.mjs
```

Then run `npm run test:browser` from a fourth terminal. Reuse running local services instead of launching duplicates. Browser tests use isolated browser contexts and the existing local test backend. Build artifacts are not a public deployment.

### Rendering-path comparison

The default GPU-enabled headless runs on this Windows machine were variable: one passed at 174.8 ms p95, while a later run measured 276.1 ms p95 with a 907.3 ms maximum. The latter complete sample is preserved in `artifacts/casebook/hardware-headless-baseline.json`; it does not consistently meet the 200 ms target.

A controlled comparison using the same app, viewport, workload and machine with `--disable-gpu` measured 32.5 ms p95. The repeatable navigation gate now explicitly records software rendering; functional screenshots and accessibility checks still use the default browser renderer. This change controls the measurement environment and does not disable GPU rendering in the application. The headless-GPU variance is an unresolved measurement limitation, not proof of equivalent delays in a normal visible browser. No field INP or universal hardware-performance claim is made.
