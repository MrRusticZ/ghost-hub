# Ghost Hub assets and source policy

## Cursed possession reference media (14 September 2026)

The cursed collection bundles 30 credited game-reference assets: seven object photographs, ten tarot faces, seven map-specific location examples, two broken-object photographs, and four silent gameplay animations. `src/hub/cursed-media.json` records the source file page, original URL, delivered URL, uploader, source upload date, dimensions, byte count, SHA-256 and animation status for every file in `src/hub/assets/cursed/`.

These are original game captures from the Phasmophobia community wiki, delivered as WebP by its image CDN. They have not been AI generated or retouched. Credits link to the original file pages. Game imagery belongs to Kinetic Games; uploader attribution does not imply an open licence. These limited illustrations support identification and commentary in this unofficial wiki and are excluded from any source-code licence.

The four animations play only after a deliberate button press and include stop controls. Insym's archived v0.9 guide remains on YouTube, with seven timestamped chapters, a click-to-load privacy-enhanced player, and a direct-link fallback. No creator video or audio is republished as a local asset. Historical dates and version differences are disclosed beside the media. See [the cursed reference and validation record](docs/cursed-possessions-upgrade.md).

## Original artwork

`public/assets/haunted-house.png` is original atmospheric artwork generated for this project with the built-in image-generation tool on 13 September 2026. It is a 1536 by 1024 image, not a Phasmophobia screenshot or floorplan.

Art direction: cinematic, realistic isolated rural house at night; charcoal and grey-green mist; weathered timber; a restrained warm tungsten porch light; broad dark negative space for readable text; no people, lettering, neon, cyberpunk elements or imitation game HUD.

The generated source was inspected and copied into the repository as the named runtime asset. `public/favicon.svg` is an original simple ghost-outline mark.

## Fonts and icons

The interface uses Barlow Condensed, DM Sans and Lora, bundled locally through Fontsource. Icons come from Lucide. License notices for these and the principal bundled frontend libraries are preserved under `public/licenses/`.

## Game reference material

The encyclopaedia uses credited, original-host journal emblems, evidence images, gameplay animations and creator video embeds. The complete media URLs, creators, dates and captions are in `src/hub/ghostDossiers.json`; the review and usage details are in [the media release record](docs/encyclopaedia-media-release.md). These third-party assets are not included in Ghost Hub's source-code licensing, and no raw game audio is published.

Phasmophobia belongs to Kinetic Games. Ghost Hub is unofficial and independent. Guides and summaries use original wording and link to source material. External wiki/Reddit discussions remain on their original platforms; complete posts and articles have not been copied into this project. The creator-attributed map reference sheets used by the atlas are documented below.

Personal planning boards are labelled separately from community reference maps. Do not substitute generated or approximate geometry for a reference floorplan. Any future map artwork needs explicit provenance, usage rights and a review against the supported game version.

## Map atlas reference artwork (14 September 2026)

The atlas now includes 18 unmodified PNG reference sheets by **Fantismal**, retrieved directly from the creator's [reference album](https://imgur.com/a/iEI0tJo). Original credits remain in the source images. The interface credits and links the creator beside the map and in the directory. `docs/atlas-map-sources.json` records each original URL, dimensions and upload timestamp.

Reuse basis: [Fantismal's public permission](https://www.reddit.com/r/PhasmophobiaGame/comments/xpy0l8/sunny_meadows_reference_map/), in the reply to Onemario1234 requesting use in a guide: “Yeah, absolutely you can use these maps in guides and stuff with credit.” No ownership or general open-source license is claimed for this artwork.

The artwork is served as build assets for reliable loading and offline availability. CSS viewport crops focus individual floors without changing the image files or generating geometry. “Full sheet” shows the intact original, including its legend, credit and version/date. Source files remain separate from Ghost Hub code licensing.

Tanglewood is the creator's 3 March 2026 / v0.16.0.0 sheet, and Willow is the 21 July 2026 / v0.18.0.0 sheet. Other sheets display their individual reference dates/versions; these dates are not a claim of current-game runtime verification. The three newer restricted contracts (Prison, Brownstone and Point Hope) explicitly show a **full-site reference** warning, because their restricted layouts are not included in this downloaded album. Sunny Meadows provides the five creator-drawn restricted-wing variants.

Legacy freeform markers and uploaded images are kept under “My board”; reference-map markers are stored separately so adding a real floorplan cannot reinterpret old marker positions. Marker backups support v1 imports and use v2 exports to retain map surface, marker type and restricted-wing identity.

### Selectable room schematics

`src/hub/atlasPlans.ts` and `src/hub/AtlasFloorPlan.tsx` provide ten simplified SVG schematics for Tanglewood, Willow, Edgefield and Ridgeview, redrawn against the above attributed sheets. They preserve source-space coordinates for marker alignment and expose room selection. These are explicitly labelled **Schematic**; the original PNGs remain available as **Original colour** and **Full sheet**. They do not invent furniture or spawn placements and are not represented as extracted game geometry. Creator credit and source links are shown with the drawings. Coverage, source versions and validation limits are recorded in `docs/atlas-schematics.md`.
