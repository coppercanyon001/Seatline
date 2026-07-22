# Seatline NYC — Mint Asset Manifest

Date: 2026-07-18  
Project: A 3D seat-sightline ticket preview for *The Odyssey* in New York City.

## July 22 Preview Calibration

The July 21 revision keeps the accepted Version 2 Mint assets unchanged and
corrects only their data-driven runtime placement. The premium cinema recliner
used at Lincoln Square and Times Square now uses its authored zero-degree
forward axis; the separate dine-in recliner in Downtown Brooklyn retains its
independently verified 180-degree calibration. Downtown Brooklyn's accepted
wide blank screen is placed on a venue-specific higher and slightly closer
anchor so the neutral projection surface remains clearly framed in the seated
camera. No image, emissive material, video, procedural surface, or replacement
asset was added. The deterministic preview schedule now begins July 22, 2026.

## Screen Layer Correction

The July 21 screenshot review exposed two distinct screen-layer failures.
Lincoln Square's Version 2 tall blank screen and Downtown Brooklyn's Version 2
wide blank screen both reproduced dark triangular surface corruption in the
production camera. Runtime inspection measured those two exports at nearly the
same `1.416:1` and `1.448:1` geometry despite their different intended formats.
Lincoln Square and Downtown Brooklyn therefore reuse the earlier validated Mint
IMAX screen at its measured `1.481:1` authored ratio. Runtime placement scales
that accepted mesh to each venue's target ratio, places it ahead of the shell,
and targets the geometric center from the seat camera. Times Square retains its
current wide-screen route. All projection surfaces remain blank, neutral,
non-emissive Mint geometry.

## Wall-Mounted Screen Finish

The final July 21 screenshot pass mounts every blank projection surface at its
venue's authored front-wall anchor and enlarges it to cover the intended wall
opening. All three rooms now reuse the validated Mint IMAX screen mesh, scaled
data-first to either the 1.43:1 or 1.90:1 target ratio. Runtime render ordering
gives the Mint screen authoritative ownership of the front-wall projection
area while keeping every Mint chair and aisle fixture visibly in front. No new
geometry, material, texture, image, video, or procedural surface was added.

## Times Square Surface Definition

The follow-up July 21 pass keeps the same validated blank Mint screen in Times
Square but separates it more clearly from the front wall. Its venue data now
gives the screen a deeper physical profile, a slightly forward wall mount, and
enough surrounding wall reveal for the projection surface to read as a real
screen instead of an empty frame. The Mint screen casts its own restrained
architectural shadow; its authored material remains blank and unmodified.

## Wide-Screen Wall Fit

The next July 21 review reduces the Times Square and Downtown Brooklyn screen
widths so the authored front walls remain visible around each projection
surface. Both screens are embedded shallowly into their wall planes with a
thin physical profile, removing the freestanding-panel read while preserving
the Mint screen's blank material and frame. A venue-specific render clip hides
only the source model's lower freestanding support hardware below the mounted
screen edge. Lincoln Square remains unchanged.

## Version 2 Full-Auditorium Contract

The July 20 revision replaces the sparse modular presentation with one
cohesive Mint-authored interior family. The film screen remains blank in every
camera view; no still, trailer frame, emissive artwork, or projected image is
applied at runtime.

- **Architectural language:** premium contemporary New York cinema with matte
  charcoal acoustic panels, dark walnut bands, oxblood upholstery, satin-black
  metal, restrained aged-brass details, and low warm aisle illumination.
- **Full-room ownership:** each venue shell owns its complete visible floor,
  stepped risers, side walls, rear wall, ceiling, acoustic treatment, portals,
  handrails, and architectural lighting housings as one contained 3D asset.
- **Camera envelope:** the room is open only at the invisible rear camera cut;
  seated eye-level views must never reveal a void outside the authored room.
- **Separate interactive seating:** shells contain no chairs. Matching Mint
  chair assets remain individually cloned so seat selection and camera anchors
  stay exact.
- **Separate blank screens:** tall and wide screen assets own their frames and
  neutral unlit projection surfaces. Runtime code may position and scale them,
  but may not apply film artwork, emissive imagery, video, or procedural color.
- **Orientation:** `+Y` up, audience-to-screen semantic forward is local `-Z`,
  floor baseline at `Y = 0`, centered origin, nonzero bounds.
- **Forbidden:** people, food, logos, text, posters, film imagery, baked chairs,
  baked screens, exterior facades, floating fragments, disconnected panels,
  foreground walls that cross the sightline, or open black voids.

### Version 2 Production Family

Expected format: eight static PBR GLBs generated together as one coherent Mint
interior pack.

| Semantic asset | Acceptance criteria | Intended runtime path | Status |
| --- | --- | --- | --- |
| Lincoln monument IMAX auditorium | Complete tall enclosed room, steep risers, two aisles, tall front opening, no chairs or screen | `public/models/seatline-v2/lincoln-imax-auditorium.glb` | Accepted |
| Times Square premium auditorium | Complete wide enclosed room, moderate rake, two aisles, broad front opening, no chairs or screen | `public/models/seatline-v2/times-square-premium-auditorium.glb` | Accepted |
| Brooklyn table auditorium | Complete intimate enclosed dine-in room, shallow rake, center aisle, wide front opening, no chairs, tables, or screen | `public/models/seatline-v2/brooklyn-table-auditorium.glb` | Accepted after clean-shell regeneration |
| Oxblood premium recliner | Matching compact cinema recliner, front toward `-Z`, no logos | `public/models/seatline-v2/premium-recliner.glb` | Accepted |
| Oxblood dine-in recliner | Matching recliner with attached walnut side table, front toward `-Z`, no food or text | `public/models/seatline-v2/dine-in-recliner.glb` | Accepted with wider Brooklyn row pitch |
| Tall blank projection screen | Neutral unlit 1.43:1 surface with slim satin-black frame | `public/models/seatline-v2/tall-blank-screen.glb` | Accepted after landscape-ratio regeneration |
| Wide blank projection screen | Neutral unlit 1.90:1 surface with slim satin-black frame | `public/models/seatline-v2/wide-blank-screen.glb` | Accepted |
| Recessed brass aisle beacon | Low shielded warm fixture matching both room and chair family | `public/models/seatline-v2/aisle-beacon.glb` | Accepted |

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
| Version 2 full-auditorium, blank-screen, chair, and fixture family | [Mint chat](https://mint.gg/chat/ph7321qhj6j50psavngyacga9n8azqsr) | Seven family members accepted; the first Brooklyn shell and portrait IMAX screen were rejected |
| Clean Brooklyn auditorium correction | [Mint chat](https://mint.gg/chat/ph7cj71g5n0t3b4hynh55z4qxs8az32y) | Accepted after preview, GLB, centered-seat, edge-seat, and overview checks |
| Landscape 1.43:1 blank IMAX screen correction | [Mint chat](https://mint.gg/chat/ph7b27fprz6qz93486rbjjzjd98ayc8z) | Accepted at measured 1.416:1 geometry; original portrait interpretation rejected |
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

Version 2 supersedes those runtime compromises. The first generated Brooklyn
candidate was rejected because it baked a projection surface and a stray black
foreground object into the room. The accepted correction preserves the shared
walnut-and-charcoal family without either defect. The first Version 2 IMAX
screen was also rejected because Mint interpreted 1.43:1 as portrait; the
accepted correction measures 1.416:1 in its final GLB and remains landscape.
The mythic-sea image remains eligible for deterministic poster art in the DOM,
but is no longer loaded into or projected on the 3D screen.

## Completed Structural Validation

- All eight Version 2 runtime GLBs have valid GLB headers and declared byte
  lengths, one scene, one node, one mesh, one material, three embedded textures,
  zero animations, and nonzero accessor bounds.
- Version 2 GLBs range from 557,356 to 941,972 bytes.
- The corrected IMAX screen measures `0.998 × 0.705 × 0.111` before runtime
  normalization, for a verified landscape X:Y ratio of `1.416:1`.
- The screen artwork loader, emissive map, blue projection light, generated UV
  rewrite, and screen-material override were removed. Both screens now render
  only their Mint-authored neutral PBR surfaces and do not receive room shadows.
- The coherent shells use one measured 180-degree room calibration. Live
  camera QA established independent chair forward axes: zero degrees for the
  premium cinema recliner and 180 degrees for the dine-in recliner, so every
  seat faces its blank screen.
- The selected chair is hidden only while its occupant camera is active and is
  restored for overview mode. Brooklyn uses a 1.5 m row pitch and 0.9 m chair
  width so the deeper dine-in tables do not collide with the sightline.

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

## Lincoln Square Screen Depth Finish

- The existing validated Mint IMAX screen remains the authoritative Lincoln
  Square screen asset; no new visible asset or material was introduced.
- Its auditorium-specific wall offset was reduced from `0.28` to `0.06` world
  units so the blank screen sits deeper against the authored front wall.
- Times Square and Downtown Brooklyn screen transforms remain unchanged.

## Downtown Brooklyn Background Stability

- Live seat and overview camera checks isolated the diagonal front-wall breakup
  and wavy foreground patch to the Downtown Brooklyn auditorium shell export.
- Downtown Brooklyn now reuses the already validated Mint Times Square
  auditorium shell at Brooklyn's existing smaller room dimensions, while its
  dine-in chair family, seat layout, blank screen, and camera remain unchanged.
- The unstable Brooklyn shell remains in the local provenance catalog but is
  superseded and no longer selected by the runtime asset map.
