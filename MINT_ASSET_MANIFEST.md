# Final Whistle: Spain vs Argentina — Mint Asset Manifest

Date: 2026-07-18  
Project: An original stylized 3D arcade football final: Spain vs. Argentina.

## Production Rule

Every visible or audible production asset and all world content comes from Mint
MCP. Three.js only loads, clones, scales, places, lights, animates, collides
with, and renders those assets. CSS and DOM provide deterministic game text,
layout, meters, buttons, and accessible controls.

## Original Visual and Gameplay Contract

- Colorful broadcast-night miniature stadium with rounded candy-gloss forms.
- Spain uses authored red, yellow, and navy; Argentina uses authored sky blue,
  white, and black.
- Goalkeepers use authored neon green and violet.
- No official crests, sponsors, tournament graphics, real-player likenesses,
  embedded text, photorealism, static runtime characters, or procedural
  substitute meshes.
- Fast 3-v-3 outfield football plus one goalkeeper per side.
- Spain can move, sprint, pass, tackle, switch player, and charge shots.
- Argentina pressures, passes, shoots, and uses a goalkeeper.
- 150-second match, golden goal on a draw, result, and instant rematch.
- Keyboard and touch-sized controls.

## World Decision

The stadium splat experiment reached preview-ready in
[Mint chat](https://mint.gg/chat/ph781qq61mpygb3a7jrvgba13h8ara97),
but the artifact response had no inspectable preview and the browser session
could not review it without a separate Mint sign-in. The workflow forbids
approving a splat without visual orientation, scale, collider, pitch-clearance,
and camera-envelope checks.

Decision: **reject before final generation and pivot to solid Mint modules**.

The production stadium uses one authoritative Mint pitch, reusable Mint straight
and corner stand modules, two Mint goals, and four Mint corner flags. No
procedural world geometry is used.

## Accepted Production Families

| Family | Mint source | Local artifacts | Status |
| --- | --- | --- | --- |
| Solid stadium kit | [Mint chat](https://mint.gg/chat/ph74x6mhqdn6pe9a6hqytkdvrx8asjdk) | `public/models/world-cup-final/pitch.glb`, `straight-stand.glb`, `corner-stand.glb`, `goal.glb` | Accepted |
| Match props | [Mint chat](https://mint.gg/chat/ph72h5kerwdw0nzdfnwe2a75fh8arvrg) | `football.glb`, `corner-flag.glb`, `trophy.glb`, `confetti.glb` | Accepted |
| Outfield roster | [Mint chat](https://mint.gg/chat/ph797348b0e47k2hstbtrz19fd8asama) | `players/spain-outfield.glb`, `players/argentina-outfield.glb` | Accepted |
| Goalkeeper roster | [Mint chat](https://mint.gg/chat/ph7bhc6jvfkaemc0vpxvbpx31n8arjb9) | `players/spain-goalkeeper.glb`, `players/argentina-goalkeeper.glb` | Accepted |
| Outfield animation pass | Mint animation catalog batch | Six clips per outfield rig: idle, run, kick, tackle, hit, victory | Accepted |
| Goalkeeper animation pass | Mint animation catalog batch | Six clips per goalkeeper rig: idle, run, kick, save, hit, victory | Accepted |
| Match audio | Mint audio generation | `crowd-ambience.mp3`, `referee-whistle.mp3`, `ball-kick.mp3`, `goal-roar.mp3`, `save-impact.mp3`, `victory-sting.mp3` | Accepted |

The authoritative code map is `app/worldCupMintAssets.ts`.

## Superseded and Rejected Passes

| Pass | Mint source | Decision |
| --- | --- | --- |
| Ten-item stadium and prop batch | [Mint chat](https://mint.gg/chat/ph73v3p1xj6saec33ydvrjvgy18arxaa) | Seven items failed. The whole partial pass was discarded. |
| Four-character roster batch | [Mint chat](https://mint.gg/chat/ph7783fe4atx20mvnhnhkn3tvd8ar2v1) | Final generation failed. The complete pass was discarded. |
| Stadium splat experiment | [Mint chat](https://mint.gg/chat/ph781qq61mpygb3a7jrvgba13h8ara97) | Rejected before approval because the preview could not be inspected. |

No runtime path references a partial, failed, or rejected pass.

## Structural Validation

- All 12 production world/prop/player GLBs have a valid GLB header, declared
  length, JSON chunk, nonzero bounds, one mesh, and valid accessor ranges.
- Each of the four player models contains one skinned mesh, one skin, 26 named
  nodes, one material, and authored textures.
- All 24 animation GLBs contain one animation with 72 valid channels; no channel
  targets are missing.
- Node order, joint order, and animation target names match exactly between each
  production rig and all six of its clips.
- Clip durations are nonzero: idle 4.033s, run 0.767s, kick 1.667s, tackle
  1.567s, hit 1.667s, goalkeeper save 2.733s, and victory 9.367s.
- Mint clips carry authored hip translation. Runtime normalization preserves
  vertical body motion while fixing horizontal hip translation to its first
  keyframe, preventing animation-driven drift from fighting gameplay physics.
- All six audio files identify as valid MPEG/MP3 files. The crowd asset is
  approximately 30 seconds and loops; one-shots are routed through user-gesture
  playback.
- Production build completed successfully.
- Desktop browser QA loaded every asset, rendered WebGL, exercised menu,
  passing, goal, golden-goal, victory, and rematch states, and reported no
  runtime errors.

## Runtime Layout

- Shared pitch surface baseline: `Y = 0`.
- Playable bounds: approximately `X ±15`, `Z ±10.8`.
- Spain attacks toward positive X; Argentina attacks toward negative X.
- Character gameplay roots move deterministically in XZ.
- The Mint football remains a separate mesh and is attached, passed, shot,
  bounced, saved, and scored by the gameplay simulation.
- Stadium stands are reused instances from the accepted compatible Mint family.
- Trophy and confetti are accepted Mint props revealed only for Spain's win.
