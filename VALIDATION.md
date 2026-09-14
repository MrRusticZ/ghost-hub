# Ghost Hub validation record

Date: 14 September 2026, Africa/Windhoek. Some machine timestamps are 13 September UTC.

## Passed locally

| Check | Evidence |
| --- | --- |
| Dependency installation | npm installation completed; the installation audit reported zero known vulnerabilities at that time |
| Unit and HTTP integration | 30 tests passed using `npm test` |
| TypeScript and production bundle | `npm run build` passed; also built with `GH_PAGES_BASE=/ghost-hub/` |
| Desktop/mobile routing | 35 route/viewport checks; no captured page runtime errors or horizontal overflow |
| Motion preference | Browser reduced-motion check passed |
| Core investigation flows | Evidence selection/reload, Detective suggestion review/apply, saved journal reload and one-second timer completion |
| Failure/recovery paths | Seven extended browser checks passed with no page runtime errors |
| Real chat UI | Five multi-browser checks against an isolated real HTTP/SQLite service passed with no page runtime errors |
| Public source collection | 15 Steam entries, 10 Kinetic articles, six matching stories, zero source-fetch failures |
| Visual inspection | Desktop and mobile dashboard captures inspected; original atmosphere artwork inspected |

The 30 automated tests cover catalog structure and evidence combinations, forced evidence, Mimic orbs, reduced-evidence negatives, diagnostic/supporting distinctions, negated language, explicit voice command parsing, source allowlists/redirects, report evidence excerpts, publication length, authentication, moderation, request limits, origins and Detective reference-version mismatch.

The seven extended browser checks cover corrupt storage, immediate remote manifest loading, failed remote fallback, malformed hosted-data fallback, old storage-key migration, reviewed typed commands and direct subdirectory loading followed by offline reload after the service worker installs.

The chat checks use two independent browser guest sessions and a separate owner session, backed by the actual server implementation, not fabricated chat responses. They cover message delivery, report handling, held/approved escaped markup, room pause/resume and server-side owner logout. No user production chat database was cleared for these checks.

## Local evidence artifacts

- `artifacts/browser-results.json`
- `artifacts/extended-browser-results.json`
- `artifacts/chat-browser-results.json`
- `artifacts/research/source-check.json`
- `artifacts/desktop-home.png`
- `artifacts/mobile-home.png`
- `artifacts/evidence-desktop.png`
- `artifacts/detective-desktop.png`

Artifacts and runtime credentials are git-ignored. The deployment workflow is configured to upload browser-check artifacts, but no actual GitHub Actions run has occurred yet.

## Problems found and addressed during checking

- Incorrect legacy reference files were removed from the public asset directory and preserved in the legacy archive.
- Type inference and build/deployment configuration issues were corrected.
- Steam's official CDN article URLs needed a narrowly scoped canonical conversion rather than relaxing the fetch allowlist.
- Negative/uncertain phrasing needed clause-aware handling so a missing EMF result did not contaminate a later positive Spirit Box observation.
- Report length needed an enforced 180-word bound, not only a prompt instruction.
- Owner sign-out needed to revoke the server session, not just clear the UI.
- The Detective needed health/configuration labels and a matching reference-version guard.
- Offline installation needed a generated bundle-asset list and a repository-subdirectory browser check.
- Browser test fixtures were narrowed so malformed-data interception did not replace Vite's imported JSON modules; storage fixtures now seed only their intended origin.

## Not proven or not connected

- A public GitHub repository push, successful hosted workflow and real public URL.
- Production container build, HTTPS ingress, persistent-volume backup/restore and operational monitoring.
- Paid AI answer generation, contextual moderation provider behaviour and paid writer/reviewer publication.
- End-to-end scheduled research commit followed by GitHub Pages deployment.
- Real microphone transcription, microphone-denial behaviour on all browsers, or audible output verified by a human listener.
- Safari/iOS, screen-reader or full automated accessibility conformance testing.
- Real in-game reproduction of every ghost mechanic or equipment value.
- Verified/licensed interactive floorplans, complete wiki breadth or cloud-synchronised team investigations.

## Reproduce the browser checks

Use Node 24 and install dependencies with `npm ci`. In one terminal run `npm start`. In a second PowerShell terminal:

```powershell
$env:GH_PAGES_BASE='/ghost-hub/'
npm run build
$env:PREVIEW_BASE='/ghost-hub/'
node scripts/preview-production.mjs
```

In a third terminal run `npm run test:browser`. Windows checks use installed Microsoft Edge. On Linux install the test browser first with `npx playwright install --with-deps chromium`.

The static preview at port 4173 intentionally has no local community endpoint in its production bundle unless `VITE_API_BASE` was configured for that build. The development site at port 5173 proxies to the local service at port 4387.
