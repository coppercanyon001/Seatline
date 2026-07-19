# Seatline NYC — Mint Asset Manifest

Date: 2026-07-18  
Project: A 3D seat-sightline ticket preview for *The Odyssey* in New York City.

## Production Boundary

Every visible or audible production asset and all theater world content must
come from Mint MCP. Three.js only loads, clones, scales, places, lights,
animates, collides with, and renders those assets. CSS and DOM provide
deterministic text, layout, seat-map controls, prices, and accessibility states.

## Original Visual Contract

- Title: **Seatline NYC**
- Mood: late-night Manhattan cinema, editorial ticketing interface, warm brass
  aisle lights, charcoal walls, oxblood seating, and a mythic Aegean-blue glow.
- Materials: matte acoustic felt, dark stained wood, satin black metal, aged
  brass, and restrained velvet.
- Forms: readable silhouettes, premium but not photoreal, clean bevels, no
  logos, sponsors, embedded text, people, food, posters, or copyrighted film
  imagery.
- Gameplay-camera target: crisp at seated eye level, with the screen and seat
  backs readable from front, middle, rear, and side positions.
- Shared floor baseline: `Y = 0`; authored geometry will be normalized and
  grounded by measured bounds at runtime.
- Forbidden: procedural substitute geometry, runtime identity tinting,
  generated text, baked spectators, official theater branding, and copied
  *Odyssey* key art.

## New York Listing Snapshot

The interface uses a dated local snapshot based on public venue and official
film-format information, not a live ticketing or checkout API.

| Venue | Public listing detail used | Preview auditorium |
| --- | --- | --- |
| AMC Lincoln Square 13 | 1998 Broadway; *The Odyssey* listed; IMAX presentation | Monument IMAX |
| Regal Times Square | 247 W 42nd St.; *The Odyssey* listed | Midtown Grand |
| Alamo Drafthouse Downtown Brooklyn | 445 Albee Square W; *The Odyssey* listed | Brooklyn Table Cinema |

Official film facts used in deterministic UI: July 17, 2026 release, R rating,
2h 52m runtime, and presentation shot entirely with IMAX film cameras.
Showtimes, prices, availability, auditorium numbers, and remaining-seat counts
are clearly labeled as preview data.

## Planned Production Families

### Theater Architecture Pack

Expected format: static GLB, nonzero bounds, web-ready materials, `+Y` up,
front centered on `-Z`, screen opening centered on the front wall.

| Semantic asset | Acceptance criteria | Intended runtime path | Status |
| --- | --- | --- | --- |
| Monument IMAX shell | Tall 1.43:1 opening, steep stepped risers, two aisles, no chairs or screen | `public/models/seatline/monument-imax-shell.glb` | Accepted |
| Midtown Grand shell | Wide premium room, moderate rake, two aisles, no chairs or screen | `public/models/seatline/midtown-grand-shell.glb` | Accepted |
| Brooklyn Table shell | Intimate dine-in room, shallow rake, center aisle, no chairs or tables | `public/models/seatline/brooklyn-table-shell.glb` | Superseded: rejected in live camera QA because stray foreground geometry crossed the screen volume |
| IMAX screen | Freestanding tall projection surface with satin-black frame | `public/models/seatline/imax-screen.glb` | Accepted |
| Wide screen | Freestanding 1.90:1 projection surface with satin-black frame | `public/models/seatline/wide-screen.glb` | Superseded: rejected after live QA exposed foreground/face corruption under the production camera |

### Seating and Fixture Pack

Expected format: static GLB, `+Y` up, front toward `-Z`, centered floor pivot,
nonzero bounds, readable from a 55–70 degree perspective camera.

| Semantic asset | Acceptance criteria | Intended runtime path | Status |
| --- | --- | --- | --- |
| Oxblood cinema recliner | Premium individual recliner, compact arms, no logos | `public/models/seatline/cinema-recliner.glb` | Accepted |
| Cognac dine-in chair | Individual recliner with attached side table, no food or text | `public/models/seatline/dine-in-recliner.glb` | Accepted |
| Brass aisle beacon | Low shielded floor light, warm lens, compact silhouette | `public/models/seatline/aisle-beacon.glb` | Accepted |

### Screen Artwork

Expected format: landscape PNG or JPG, no text or official key art.

| Semantic asset | Acceptance criteria | Intended runtime path | Status |
| --- | --- | --- | --- |
| Mythic sea tableau | Original bronze-age ship on a moonlit Aegean sea, cinematic silhouette, no recognizable actors | `public/images/seatline/mythic-sea-tableau.png` | Accepted |

## Structural Validation Contract

- Each GLB must have a valid GLB header, JSON chunk, nonzero accessor bounds,
  at least one mesh, at least one material, and parse in Three.js.
- Shells must not contain chairs, people, text, or projection screens.
- Chairs must have a stable floor-facing pivot after measured-bound
  normalization and face the screen without runtime material recoloring.
- Screen geometry must expose a usable front surface; the Mint screen artwork
  will be applied only to that Mint-authored geometry.
- The image must have valid dimensions, readable contrast in the production
  renderer, and no generated text.
- No pending, partial, rejected, or superseded item may appear in the runtime
  asset map.

## Runtime Map

The authoritative semantic-to-local path map lives in
`app/seatlineMintAssets.ts`.

## Generation Log

| Family | Mint source | Decision |
| --- | --- | --- |
| Eight-item theater architecture, screen, seating, and fixture kit | [Mint chat](https://mint.gg/chat/ph73qz63cvmbfgwec1s869g9mn8aty69) | Complete family accepted after preview and GLB validation |
| Original mythic sea tableau | [Mint chat](https://mint.gg/chat/ph75b3hd7v1yzr4bn3xth8mhz18avr6g) | Accepted after downloaded PNG inspection |

The Brooklyn shell preview included an authored blank screen surface despite the
request for an empty opening. Recording-based layer isolation later confirmed
that additional foreground fragments crossed the dedicated screen volume and
could not be corrected with a safe depth offset. The shell is therefore
superseded and absent from the runtime asset map. Brooklyn now reuses the
validated Mint Midtown shell at its smaller room dimensions, with the distinct
Mint dine-in chair family and Brooklyn seat layout preserved.

The dedicated wide-screen export also produced block and triangle artifacts
under multiple camera angles. RPX and dine-in rooms now reuse the validated
Mint IMAX screen mesh, compressed vertically to the wide presentation ratio,
with the same Mint mythic-sea artwork. The rejected wide-screen file remains
local for provenance but is absent from the runtime asset map.

## Completed Structural Validation

- All eight model files have valid GLB headers, declared byte lengths, JSON
  chunks, one scene, one node, one mesh, one material, three textures, zero
  animations, and nonzero accessor bounds.
- GLB sizes range from 513,564 bytes to 851,436 bytes.
- The screen artwork is a valid 1,376 × 768 RGB PNG at 1,677,513 bytes.
- Every runtime path in `app/seatlineMintAssets.ts` exists locally.
- Shells and chairs are normalized from measured bounds, then grounded against
  the visible Mint riser surface using downward Three.js raycasts.
- Live camera QA rejected the first unrotated shell orientation and the first
  hard-coded seat rake. The production route rotates the coherent shell family
  once and samples the authored risers so chairs and eye points remain above
  the floor.
- Recording-based QA superseded the Brooklyn shell after layer isolation proved
  its foreground fragments were the source of persistent screen corruption.
- The same QA pass superseded the wide-screen export and validated the
  vertically scaled Mint IMAX screen as the clean production route for all
  auditorium formats.

## Completed Runtime Validation

- Production build and rendered-page tests pass.
- Desktop browser QA covered centered and side-seat views, all three theater
  switches, showtime state, overview/return controls, selection metrics, and
  the booking summary.
- Mobile QA at 390 × 844 confirmed one-column venue controls, touch-sized
  showtimes, the 3D view, the complete seat map, selection metrics, and reserve
  action without horizontal page overflow.
- Browser QA reports no console errors or missing production assets.
