# Ghost Hub

Public site target: https://mrrusticz.github.io/ghost-hub/

Repository: https://github.com/MrRusticZ/ghost-hub

## September 14 release configuration

The GitHub Pages frontend includes the evidence book, local Ghost Detective, 30 ghost dossiers, 21 equipment references, seven cursed possessions, known-bug references, a 17-location atlas with player-supplied floor images, journal, field tools, voice commands and shareable case links.

Local release checks passed: 38 automated tests, 46 desktop/mobile route checks and 12 additional browser scenarios. GitHub Actions repeats these gates before publishing.

**Service status:** public chat, private appeals, community submissions, hosted AI answers and scheduled researched news are not connected in this static-only release. The reviewed news archive is available. No provider credentials or paid services are enabled by default. See `.env.example` and the setup documentation below before enabling a backend or research. Never place secrets in `VITE_` variables.

---

# Ghost Hub

An atmospheric, source-linked Phasmophobia field companion. Evidence and behaviour filtering, a Ghost Detective, ghost dossiers, maps/planning, equipment, guides, news, tools, journal, reviewed voice commands and an optional real community service.

**Status:** built and checked locally. A public GitHub Pages deployment, hosted community backend and paid AI/research configuration are still required for the complete online launch. Nothing here claims that those external services are already live.

## Use locally

Requires Node.js 24 or newer and npm.

```powershell
npm ci
npm start
```

Open http://127.0.0.1:5173/. This starts both Vite and the local community service on port 4387. Stop both with Ctrl+C. The first local service start creates private owner credentials in `runtime/owner-password.txt`; open that local file to sign in at `#/admin`. Never commit or share it.

For separate terminals use `npm run dev` and `npm run server`. The core field tools do not require an AI key. Local chat uses limited development screening; do not expose development mode as a public room.

## What's included

- Distinct routed pages and detail views, mobile navigation, original house artwork, subtle fog/reveals, reduced-motion support and locally bundled fonts.
- Thirty reference ghost dossiers; evidence-count handling, forced evidence, Mimic extras, behaviour support, explanations and next-test guidance.
- Seventeen map locations/variants with persistent personal planning markers. These are not verified floorplan images.
- Search, equipment and guide libraries, source-linked launch reports, local journal import/export, timers and BPM tapping.
- A conservative local Detective and an optional server-grounded AI mode. No fake live AI or invented confidence percentages.
- Voice/typed command review for evidence, sanity, timers, maps, navigation and snapshots. Browser microphone support varies.
- Real SQLite-backed guest chat, findings, server authentication, screening, limits, owner moderation and audit.
- A disabled-by-default scheduled research publisher with source validation and a separate review step.

## Setup and deploy to GitHub Pages

1. Create or connect the dedicated Ghost Hub repository. Do not use an unrelated website repository. This workspace has not been pushed yet.
2. Publish this project's source and lockfile on `main` using GitHub Desktop or your normal Git workflow. `.gitignore` excludes runtime secrets, `.env`, dependencies, build output, local artifacts and ZIP files.
3. Open repository **Settings > Pages > Build and deployment > Source > GitHub Actions**.
4. Open **Actions > Deploy Ghost Hub > Run workflow > main > Run workflow**, or push to `main`.
5. Wait for the tests, build and browser checks, then open the URL shown by the deploy job. For a project repository it will normally be `https://OWNER.github.io/REPOSITORY/`.
6. Visit the actual deployed URL from another device and check a direct `#/evidence` link. That external check has not yet been performed.

`vite.config.ts` derives the repository base from `GITHUB_REPOSITORY` unless `GH_PAGES_BASE` is supplied. The deployment workflow uses the Pages-provided base, including root/custom-domain cases. Hash routing avoids missing-page errors on a static host.

GitHub Pages hosts the frontend, not the chat database or API secrets. See [GitHub's Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages).

## Connect the public community service

The supplied Node service and `server/Dockerfile` need a separate HTTPS host with a persistent `/app/runtime` volume. The container has not been built or deployed in this session. Do not use an ephemeral filesystem for chat state.

Set `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT=4387` and `DATA_DIR=/app/runtime`. Supply a strong persistent `SESSION_SECRET`, a scrypt `ADMIN_PASSWORD_HASH`, and `MODERATION_API_KEY` through the host's secret manager. The locally generated `runtime/local-secrets.json` demonstrates the required secret/hash format; keep these values private and generate separate production credentials when configuring the host.

Set `ALLOWED_ORIGINS` to the exact frontend origin, for example `https://OWNER.github.io`, not a repository path and not `*`. The service requires contextual moderation in production and fails closed when screening is unavailable. Only enable `TRUST_PROXY=true` behind a trusted ingress that replaces forwarded headers and blocks direct access to the origin.

In GitHub open **Settings > Secrets and variables > Actions > Variables > New repository variable**. Add `VITE_API_BASE` containing the public API prefix, for example `https://YOUR-SERVICE-DOMAIN/api`, and redeploy. This endpoint is public configuration. **Never place secrets in any `VITE_` variable.**

Validate real guest delivery, moderation, owner access, retention, backups/restore and the emergency pause before inviting the public. Anonymous guest restrictions are evadable; there is no hardware scan or hardware-ban promise.

## Optional grounded AI

Configure `OPENAI_API_KEY`, `OPENAI_MODEL` and `DAILY_AI_REQUEST_LIMIT` on the service host. Choose a model your account can use with structured outputs. The default application limit is 50 Detective requests per UTC day; also configure provider-side spending controls.

The server recomputes candidates and refuses a client/server reference-version mismatch. Without a working AI service the Detective remains a clearly labelled local field guide. No paid provider calls were made during this implementation.

## Automatic news and patch reports

The research workflow checks approved Steam and Kinetic sources every three hours when enabled. It matches stories, requires supporting source excerpts, reviews the proposed report separately and commits only approved report JSON. It does not copy whole articles or automatically alter ghost mechanics.

1. Run `node scripts/research.mjs --collect-only` to check public-source access without an AI call or publication.
2. In GitHub **Settings > Secrets and variables > Actions > Secrets**, add `OPENAI_API_KEY`.
3. Under **Variables**, add `RESEARCH_MODEL` and `RESEARCH_REVIEW_MODEL` with supported model IDs. Set provider spending controls before enabling paid execution.
4. Add variable `RESEARCH_ENABLED` with value `true`, then manually run **Actions > Research Phasmophobia updates** and inspect its audit artifact before relying on its schedule.
5. Ensure repository policy permits the bot to commit the two report-data files on `main`. A successful research workflow triggers the deploy workflow through `workflow_run`, so bot-token push-trigger restrictions do not silently prevent deployment.

Keep the variable disabled until the first real paid run and failure cases have been reviewed. Two official platforms confirm an announcement, not independent gameplay testing. Reddit and player findings are currently linked/queued, not automatically harvested or promoted to facts.

## Reference updates and recovery

`public/data/manifest.json` is the catalog entry point. Its version must match `hub-catalog.json`; both local and remote bundles pass the same schema checks. `news.json` is versioned separately as the report archive. Settings accepts an optional HTTPS raw data-folder URL such as `https://raw.githubusercontent.com/OWNER/REPO/refs/heads/main/public/data`.

A failed remote load falls back to hosted local data, then to the embedded bundle, with a visible reason. Successful version information is retained for troubleshooting. Current case and journal state survive navigation and refresh, including migration of the old misspelled journal storage key.

The production service worker enables offline reference reuse after a successful first load/cache installation. Chat, live AI and submissions still require a connection. Back up important journal entries through Export; browser storage is not a cloud backup.

## Checks and implementation notes

```powershell
npm test
npm run build
npm run check
```

See `VALIDATION.md` for the 30-test result, 35 route/viewport checks, seven recovery/offline checks, five real chat UI checks, evidence artifacts and browser-test commands. The deployment workflow runs browser checks before publishing; its actual hosted run remains unverified until a repository is connected.

The active frontend is in `src/hub/`; `src/App.tsx` mounts it. `shared/deduction.mjs` is reused by the browser and server. `server/` contains the authoritative API; `scripts/research*.mjs` contain the gated publisher. Legacy scaffold files are preserved but are not active application components. Old public data is archived outside the deployed directory.

Read `GHOST_HUB_PLAN.md` for the full product/architecture roadmap and launch gates, and `ASSETS.md` for artwork, font and source provenance. Ghost Hub is unofficial and is not endorsed by Kinetic Games.
