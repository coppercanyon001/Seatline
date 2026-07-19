# Seatline NYC Workflow

## Product Goal

Build a polished 3D ticket-booking preview for *The Odyssey* in New York City.
Users choose a venue, showtime, and seat, then see a smooth camera move to the
true sightline from that chair before reserving it.

## Mint Asset Rule

All visible and audible production content comes from Mint MCP. Three.js may
load, clone, scale, place, light, animate, collide with, and render Mint assets,
but may not create substitute visible meshes, textures, images, or sounds.
CSS and DOM own deterministic labels, seat controls, prices, format facts, and
accessible interaction.

## Theater Preview Rule

- Every selectable seat maps to a stable 3D position and camera target.
- The camera settles at seated eye height and looks toward the center of the
  visible Mint screen.
- The mini seat map, selected seat label, row, price, and 3D view must stay in
  sync.
- Sold and accessible-companion seats are visibly and programmatically
  distinct.
- The screen should remain fully readable from front, middle, rear, and edge
  seats without camera clipping.

## New York Data Rule

The venue directory uses a dated local snapshot derived from public exhibitor
and official film-format pages. It must clearly identify itself as a preview
dataset rather than a live inventory or checkout connection. Do not imply a
ticket has been purchased.

## Validation Rule

Verify:

- every Mint GLB and image path exists and loads;
- every available seat can be selected by pointer and keyboard;
- venue, showtime, and seat changes keep the scene synchronized;
- camera framing works across desktop and mobile;
- the reserve flow reaches a clear summary;
- production build, browser console, and network requests are clean.
