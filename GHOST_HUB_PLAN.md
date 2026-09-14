# Ghost Hub: product, architecture and launch plan

Reviewed 14 September 2026. This document separates the working local release from the full product vision and the remaining public-launch gates. It does not claim that a GitHub deployment, paid AI call or in-game mechanics test has happened.

## 1. The vision

Ghost Hub is an independent Phasmophobia investigation companion and knowledge portal. Its promise is simple: describe what happened, understand what it means, and find a useful next test quickly.

It combines a field notebook, a searchable reference library, an explanatory Detective, a source-linked research desk and a welcoming community. It is not a copied cheat sheet, an ungrounded chatbot, or an unattended feed of rewritten headlines.

The visual direction is restrained supernatural horror: weathered architecture, soft fog, warm porch light, charcoal and moss, aged paper and practical typography. No neon grids, cyberpunk styling, forced sound, jump scares or flashing effects. Motion supports orientation and atmosphere; reduced-motion preferences take priority.

## 2. The principal player journey

1. Open the hub and resume the current case, or type a phrase into the main search.
2. Select the actual evidence allowance: standard, Nightmare, Insanity or zero evidence.
3. Record confirmed evidence separately from missing or genuinely ruled-out evidence.
4. Add a behavioural observation, such as unusual electrical activity or an uncertain salt crossing.
5. See which candidates remain, why each remains, and which test can best distinguish them.
6. Ask the Detective for an explanation without losing the current investigation.
7. Save the case, copy the candidate list, consult a guide, or share an observation with the community.

The primary success measure is time to a useful next test, not how often the system confidently names a ghost. A cautious, explainable answer is preferable to a fast false elimination.

## 3. Page map and current implementation

| Area | Current working experience | Important boundary |
| --- | --- | --- |
| Overview | Atmospheric dashboard, behaviour search, shortcuts, research reports, guides and current case | No invented live-user or activity counters |
| Evidence book | Seven evidence controls, 0-3 evidence modes, searchable telltales, undo/reset, explanations and candidate copying | Ambiguous observations rank/support; they do not eliminate |
| Ghost Detective | Natural-language phrase matching, suggestion review, candidate context, next-test guidance, optional grounded AI endpoint | Local mode is explicitly labelled; it is not a general-purpose AI researcher |
| Ghost encyclopaedia | 30 source-linked ghost dossiers, evidence combinations, selected tests/cautions and comparison | Behaviour coverage is selective, not a complete independently tested mechanics wiki |
| Map atlas | 17 locations/variants, location notes, floor/area selection and persistent personal markers | The board is NOT a verified floorplan; accurate licensed layouts are a remaining content project |
| Equipment | Searchable equipment cards and detail pages with practical checks and tier summaries | Exact numeric range/duration coverage needs a dedicated versioned audit |
| Guides and mechanics | Original, linked guides on starting, missing evidence, hunts/events, sanity, speed and useful observations | More advanced topic collections remain planned |
| News and reports | Source-linked archive, categories, report detail, current launch summaries and automation freshness status | Automatic publishing stays disabled until configured and checked |
| Field tools | Persistent timer, opt-in audible cue, visual completion, footstep BPM tapping and checklist | BPM is not presented as calibrated ghost speed; audio depends on browser activation |
| Field journal | Auto-saved draft, snapshots, restore, JSON import/export, manual sanity and result | Local-device storage, not cloud/team synchronisation |
| Voice console | Push-to-talk where supported, typed fallback, explicit command preview and confirmation | Browser speech recognition varies; real microphone transcription is not part of the automated checks |
| Community portal | Curated wiki, developer, Steam, Reddit and other reference destinations | External discussions remain on their original platforms |
| Global chat | Guest nicknames, real server-backed messages, mute/report, screening and paused/read-only mode | Public use needs the separate hosted service and responsible moderation |
| Submit a finding | Structured observation, version, conditions, supporting link and optional credit | A submission is a research lead, never an automatically accepted fact |
| Search | Cross-library keyword search and observation shortcuts | Semantic/vector search is not yet implemented |
| Settings | Atmosphere, sound, remote reference configuration, connection states and data controls | A configured endpoint is distinguished from an available AI service |
| About, sources and privacy | Project independence, source credit, editorial standards, retention and rules | Deployment providers' own logs/policies must be added at public launch |
| Owner moderation | Server-authorised sign-in, review queue, approve/hide, timeout/lift, pause, finding review, audit and logout | One owner role today; individual moderator accounts and appeals tooling are future work |

These are distinct routed views and detail pages, not sections in one long landing page. Hash-based URLs survive refresh on GitHub Pages without a server rewrite. Public article prerendering and per-article social metadata are later SEO improvements.

## 4. Frontend architecture

The active application lives in `src/hub/`. React, TypeScript, Vite and shared validated models provide the shell and separate page components. The older scaffold remains outside the active application; misleading old public JSON was preserved in `archive/legacy-data/`, not shipped as current data.

The shell owns the current case, undo history, preferences, data source state, navigation and notifications. Section error boundaries offer recovery instead of taking down the entire hub. Device storage is namespaced and schema-checked. The old misspelled journal key and known evidence labels migrate safely.

The reference path is remote manifest when explicitly configured, then hosted local manifest, then the embedded validated bundle. Failures produce a visible banner and detailed reason. Manifest/catalog versions must match. The last successfully loaded version is recorded locally.

A build-versioned service worker precaches the app, fonts and reference data. Offline reuse requires a successful first load and cache installation. News retrieval, AI, chat and submissions are not available offline. First-ever visits cannot magically work without a network or local server.

## 5. Deduction and Detective safety

The shared deduction module is used by both the browser and server. It considers possible evidence sets at the selected evidence count, forced evidence where applicable, extra Mimic orbs and explicitly supported diagnostic conflicts.

Supporting observations never become hard rule-outs. Missing evidence remains unknown. The natural-language parser is deliberately conservative about negation, questions, unsuccessful attempts and conflicting statements. Players review suggestions before applying them. There are no invented probability percentages or universal sanity cutoffs.

The optional AI endpoint receives the question and selected case context, recomputes candidates on the server, and receives only relevant reference facts. It cannot authorise state changes or execute tools. Citation URLs are restricted to the supplied references. A catalog-version mismatch falls back to local guidance rather than mixing old and new rules.

Next improvements are condition-aware follow-up questions, a larger versioned observation vocabulary, source-level freshness for every rule, better explanations for eliminated candidates, and an evaluation set drawn from real player phrasing. Expansion must preserve the distinction between association, diagnostic evidence and independently replicated tests.

## 6. Automatic research and publication

```text
Scheduled GitHub Action
  -> approved Steam and Kinetic sources
  -> URL, size, date and source-contract checks
  -> same-story matching and change digests
  -> bounded structured report draft
  -> known-source and exact-excerpt validation
  -> separate AI review of all public claims
  -> hold failures / publish supported announcement analysis
  -> versioned JSON commit
  -> deployment workflow with build and browser checks
```

The supplied schedule is every three hours. It is a GitHub workflow, not an automation running inside this conversation. No API key or recurring paid execution has been enabled during this build.

Reports have original summaries, practical player implications labelled as analysis, source links, dates and explicit uncertainties. Drafts exceeding 180 public words fail validation. Source redirects remain allowlisted, and source text is treated as untrusted input. Two official posts establish announcement consistency; they do not count as two independent gameplay experiments. A second AI review is another check, not independent source evidence or a guarantee against mistakes.

The live collector check read 15 Steam entries and 10 Kinetic articles and matched six stories with no source-fetch failures. Collection-only mode intentionally did not publish a report or change the scheduled-publication freshness timestamp.

Current automation covers official announcement analysis only. Reddit, creator videos, wiki revisions and community submissions are not secretly being harvested. Add them through approved APIs/feeds, usage permissions, stable attribution and source-specific trust rules. Reposts must be deduplicated to the same underlying claim.

Community findings must pass a separate evidence process before entering reports. News must never silently rewrite ghost evidence or diagnostic rules. Future mechanics updates should generate reviewed data-change proposals with regression tests, then merge only when the supporting conditions are established.

Failure policy: preserve the last good report set, retain an audit, show honest freshness, and alert the owner through GitHub workflow notifications. Add an external stale-feed monitor after public hosting is chosen. Do not claim that scheduled GitHub runs are real-time or guaranteed to run exactly on the minute.

## 7. Backend and community architecture

GitHub Pages hosts static files; it cannot run the persistent chat database or protect AI credentials. The supplied separate Node 24 service uses SQLite, parameterised statements, transactions, server-side validation and bounded requests. A container definition is included for an HTTPS host with a persistent volume. Its production deployment has not yet been executed.

Guest access uses a random browser token stored as a hash on the server. Security limits use a keyed IP digest. Ghost Hub does not read PC serial numbers, scan hardware or promise hardware bans. Guests can evade identity-based restrictions by changing credentials or network, so bans are one layer, not a complete anti-abuse system.

The service limits joins, messages, duplicate posts, reports, findings, owner logins and AI calls. Messages are plain text. Links and suspicious markup can be held for review. Contextual moderation is required in production; provider failure does not silently allow an unscreened message. Reports alone do not ban users. The owner can reverse decisions and pause posting.

Public launch requires an explicit HTTPS-origin allowlist, strong persistent secret, owner password hash, moderation configuration and protected database storage. Reverse-proxy IP forwarding may be enabled only when the trusted ingress replaces the header and direct origin access is blocked. CORS is not bot authentication.

The reference service expires chat and guest credentials after 30 days, findings/audits after up to 90 days, and rate records after their windows. Hosting logs have separate retention. Add backups, restore drills, uptime alerts and a concrete appeal channel before inviting a larger audience.

## 8. Launch order and acceptance gates

### Gate A: usable local release

Implemented and checked: installation/build, desktop/mobile routes, evidence logic, recovery paths, journal migration, reviewed typed commands, timers, actual guest chat and owner moderation. The local hub is usable now. Automated checks prove these tested behaviours, not every real-game rule or every browser/device combination.

### Gate B: public reference website

Create or connect the dedicated Ghost Hub repository, push this project, choose Settings > Pages > Build and deployment > Source > GitHub Actions, then run the deployment. Confirm the real public URL and a second-device visit. The connector currently exposes an unrelated repository only, which has deliberately not been changed.

The deployment workflow calculates the repository base path and runs unit/integration tests, TypeScript/build checks and real browser checks before publishing. Its actual GitHub run is still an external acceptance gate, not a local test result.

### Gate C: public community and optional AI

Provision the service host and persistent volume, set secrets outside git, restrict origins, enable contextual moderation, add provider spending controls, set the public `VITE_API_BASE`, and redeploy the frontend. Test two external users, moderation, expiry, backups and the emergency pause over real HTTPS. Verify a real grounded AI answer and provider failure before labelling AI available.

### Gate D: unattended announcement reports

Configure writer/reviewer models and the API secret, run a manual paid dry run, inspect generated drafts and rejection cases, then enable the scheduled publisher. Confirm that its commit triggers a successful Pages deployment and that a stale/failed source leaves the public site intact. Branch-protection policies must permit the intended bot update flow.

### Gate E: the deeper reference product

Prioritise licensed, reviewed interactive floorplans; complete equipment and cursed-possession references; ghost-speed/sanity condition tables with patch provenance; and a broader Detective vocabulary. Add a known-bugs library with affected/fixed versions so game bugs are less likely to be mistaken for ghost tells.

### Gate F: mature community intelligence

Add dedicated moderator identities/roles, appeals, finding review/reproduction records, claim-level provenance, better bot challenges, opt-in shared case rooms and eventually structured discussions. Anonymous global chat stays simple. Regional chats, unrestricted posting and automatic promotion of popular opinions into facts are not launch requirements.

## 9. Quality bar for future releases

1. A valid evidence combination retains its ghost at every supported evidence count.
2. An ambiguous observation never produces a hard exclusion or a fabricated certainty percentage.
3. Remote/source failures preserve useful local functionality and explain what happened.
4. Every public report is traceable, bounded, dated and correction-friendly.
5. No secret reaches a frontend build, screenshot, public JSON file or git commit.
6. Untrusted messages remain text; authentication and moderation remain server-authoritative.
7. Major routes work at desktop and mobile widths with keyboard access and reduced motion.
8. Public-launch claims require actual deployment and external-browser evidence.

See `VALIDATION.md` for the checks performed and their limitations, and `README.md` for the exact launch steps.
