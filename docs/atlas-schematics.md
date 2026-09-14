# Atlas room schematics — 14 September 2026

The atlas now has selectable SVG room schematics for all floors of four houses:

| Location | Floors | Selectable rooms | Source reference |
| --- | --- | --- | --- |
| 6 Tanglewood Drive | Ground, basement | 12 | Fantismal, 3 March 2026, v0.16.0.0 |
| 13 Willow Street | Ground, basement | 10 | Fantismal, 21 July 2026, v0.18.0.0 |
| 42 Edgefield Road | Ground, first, basement | 16 | Fantismal, 11 November 2025, v0.15.0.0 |
| 10 Ridgeview Court | Ground, first, basement | 16 | Fantismal, 11 November 2025, v0.15.0.0 |

These are simplified architectural drawings based on the bundled creator references, not game-extracted geometry. Room outlines, selected interior partitions, openings, stairs and entrances were reviewed against the source images. Furniture and item/hiding-place spawns are not inferred. The interface labels this view **Schematic** and retains **Original colour** and **Full sheet** for the source's restrictions, symbols and complete details. Other locations retain their existing source-based map views.

`src/hub/atlasPlans.ts` contains the room data in the original sheet's pixel coordinate system. `AtlasFloorPlan.tsx` renders crisp paths, room names, numbered compact rooms, stairs, entrances and selection. Labels use a minimum screen size; small rooms can be identified from the room directory. Selection works with the mouse, touch taps and keyboard Enter/Space; room labels can be hidden.

Marker storage stays in the existing reference crop's coordinates. Rendering and pointer placement convert between that frame and the tighter schematic frame. Older observations outside the drawing's frame expand the visible frame instead of disappearing. Selecting a room and choosing **Mark this room** places an observation at its label anchor. Original images, marker backups and uploaded personal images retain their previous formats and behaviour.

The desktop workspace has a fixed height with independently scrolling location and note panels. Selecting a marker no longer stretches the map area. Smaller screens stack the panels and keep the map controls accessible.

Validation completed:

- All ten drawings visually reviewed; corrected missing interior partitions and label/stair overlaps.
- Unit checks cover all room anchors, duplicate IDs, clipped polygons, known source-to-schematic coordinate conversion and visibility of older outlying markers.
- Atlas browser checks cover pointer and keyboard room selection, room labels, room markers, source alignment, floor/variant isolation, import/export, uploads, both themes, mobile/tablet, Casebook and reference image errors.
- The full test suite, TypeScript and production build passed. Automated axe A/AA checks reported no atlas violations in either theme.
- The `/ghost-hub/` production preview passed offline schematic/reference reloads, marker persistence, and switching to previously unvisited source maps and schematics.

Evidence is in the ignored `artifacts/atlas/` folder, including `vector-desktop.png`, `vector-selected.png`, ten `plan-*.png` images, browser `results.json`, and `vector-production-results.json`.

This validates the website and its source-based diagrams. No in-game navigation or every-door collision validation is claimed. The work remains in the local preview; it has not been pushed or deployed publicly.
