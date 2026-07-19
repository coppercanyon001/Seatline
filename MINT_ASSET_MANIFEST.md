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
- Five outfield players plus one goalkeeper per side.
- Spain can move, sprint, pass, play a led through ball, tackle, switch player,
  and charge shots.
- Argentina pressures, passes, shoots, and uses a goalkeeper.
- 150-second match, golden goal on a draw, result, and instant rematch.
- Wide broadcast camera, assisted target selection, off-ball support runs,
  contextual switching, a possession readout, stamina, and real field restarts.
- Keyboard and touch-sized controls.

## World Decision

The stadium splat experiment reached preview-ready in
[Mint chat](https://mint.gg/chat/ph781qq61mpygb3a7jrvgba13h8ara97),
but the artifact response had no inspectable preview and the browser session
could not review it without a separate Mint sign-in. The workflow forbids
approving a splat without visual orientation, scale, collider, pitch-clearance,
and camera-envelope checks.

Decision: **reject before final generation and pivot to solid Mint modules**.

The production stadium uses one authoritative Mint pitch, a crowdless modular
Mint grandstand family, two Mint goals, and four Mint corner flags. No
procedural world geometry is used.

## Accepted Production Families

| Family | Mint source | Local artifacts | Status |
| --- | --- | --- | --- |
| Core pitch and goals | [Mint chat](https://mint.gg/chat/ph74x6mhqdn6pe9a6hqytkdvrx8asjdk) | `public/models/world-cup-final/pitch.glb`, `goal.glb` | Accepted |
| Empty grandstand kit | [Mint chat](https://mint.gg/chat/ph74a7xnk3ckj3z08rn1mwr9c58ar5ve) | `public/models/world-cup-final/straight-stand.glb`, `corner-stand.glb` | Accepted |
| Match props | [Mint chat](https://mint.gg/chat/ph72h5kerwdw0nzdfnwe2a75fh8arvrg) | `corner-flag.glb`, `trophy.glb`, `confetti.glb` | Accepted |
| Sideline kit | [Mint chat](https://mint.gg/chat/ph782z5v5cdp4b99j77czrag9x8arrh2) | `team-dugout.glb`, `pitchside-board.glb`, `equipment-station.glb` | Accepted |
| Gameplay readability kit | [Mint chat](https://mint.gg/chat/ph7762ym68xwf9x17cm497y4hx8atsqt) | `player-selection-ring.glb`, `ball-locator.glb` | Selection ring and ball locator accepted |
| Classic match ball replacement | [Mint chat](https://mint.gg/chat/ph7cs7g4v4xhyycsjzkdqr2xch8asans) | `public/models/world-cup-final/football.glb` | Accepted |
| Outfield roster | [Mint chat](https://mint.gg/chat/ph797348b0e47k2hstbtrz19fd8asama) | `players/spain-outfield.glb`, `players/argentina-outfield.glb` | Accepted |
| Goalkeeper roster | [Mint chat](https://mint.gg/chat/ph7bhc6jvfkaemc0vpxvbpx31n8arjb9) | `players/spain-goalkeeper.glb`, `players/argentina-goalkeeper.glb` | Accepted |
| Outfield animation pass | Mint animation catalog batch | Six clips per outfield rig: idle, run, kick, tackle, hit, victory | Accepted |
| Goalkeeper animation pass | Mint animation catalog batch | Six clips per goalkeeper rig: idle, run, kick, save, hit, victory | Accepted |
| Four-person supporter cast | [Mint chat](https://mint.gg/chat/ph7ewj7v35n5mg5mqthgtz04tx8ashcq) | Four fan rigs under `public/models/world-cup-final/fans/` | Accepted |
| Seated supporter animation pass | [Mint chat](https://mint.gg/chat/ph7ewj7v35n5mg5mqthgtz04tx8ashcq) | Per-fan seated idle and seated cheer clips under `public/animations/world-cup-final/fans/` | Accepted |
| Match audio | Mint audio generation | `crowd-ambience.mp3`, `referee-whistle.mp3`, `ball-kick.mp3`, `goal-roar.mp3`, `save-impact.mp3`, `victory-sting.mp3` | Accepted |

The authoritative code map is `app/worldCupMintAssets.ts`.

## Superseded and Rejected Passes

| Pass | Mint source | Decision |
| --- | --- | --- |
| Ten-item stadium and prop batch | [Mint chat](https://mint.gg/chat/ph73v3p1xj6saec33ydvrjvgy18arxaa) | Seven items failed. The whole partial pass was discarded. |
| Four-character roster batch | [Mint chat](https://mint.gg/chat/ph7783fe4atx20mvnhnhkn3tvd8ar2v1) | Final generation failed. The complete pass was discarded. |
| Stadium splat experiment | [Mint chat](https://mint.gg/chat/ph781qq61mpygb3a7jrvgba13h8ara97) | Rejected before approval because the preview could not be inspected. |
| Original candy-gold football | [Mint chat](https://mint.gg/chat/ph72h5kerwdw0nzdfnwe2a75fh8arvrg) | Superseded by a smaller, visually unambiguous black-and-white match ball. |
| Original populated stand modules | [Mint chat](https://mint.gg/chat/ph74x6mhqdn6pe9a6hqytkdvrx8asjdk) | Straight and corner stands were superseded because spectators were baked into each single mesh. |
| Single multi-person supporter row | [Mint chat](https://mint.gg/chat/ph70gt1d6w6zh545sjxqvcfn1d8as9c9) | Superseded by individually rigged people so every fan could stay seated and animate. |
| Supporter sprite experiment | [Mint chat](https://mint.gg/chat/ph77wt59cj3m1mx4cvega7arw98askkj) | Rejected after inspection found a baked checkerboard instead of usable transparency. |
| Low-profile pitch replacement | [Mint chat](https://mint.gg/chat/ph7762ym68xwf9x17cm497y4hx8atsqt) | Preview accepted, then rejected in live QA because the GLB unfolded into reflective panels at runtime. The verified original Mint pitch remains authoritative. |

No runtime path references a partial, failed, or rejected pass.

## Structural Validation

- All production world/prop/player/fan GLBs have a valid GLB header, declared
  length, JSON chunk, nonzero bounds, one mesh, and valid accessor ranges.
- Each of the four player models contains one skinned mesh, one skin, 26 named
  nodes, one material, and authored textures.
- All 24 animation GLBs contain one animation with 72 valid channels; no channel
  targets are missing.
- Node order, joint order, and animation target names match exactly between each
  production rig and all six of its clips.
- Each of the four supporter models contains one skin. Every selected seated
  clip contains one animation targeting 24 named rig nodes, with zero missing
  targets across all eight runtime supporter clips.
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
- The grounding revision measured the scaled pitch slab's actual top bound at
  runtime and uses that value for every player, goalkeeper, goal, flag, trophy,
  and ball baseline. Browser screenshots confirm complete legs and feet remain
  above the turf during play.
- The replacement classic football is a valid 842,968-byte GLB with one mesh,
  one material, three textures, nonzero bounds, and a visually inspected white
  surface with black panels.
- Four hundred fifty-eight clones from four dedicated Mint fan rigs fill four
  long-stand rows and three rows behind each goal. Only seated motions are loaded:
  every spectator crossfades from seated idle into a varied seated cheer when
  either team scores.
- The three sideline-kit GLBs identify as valid glTF binary models and their
  Mint previews were inspected before runtime placement.
- Browser QA confirmed the smaller classic ball, inward-facing openings and
  outward net depth on two identically constructed goals, the packed four-sided
  supporter cast, score-triggered cheering, screen-relative movement, the stable
  wide broadcast view, Mint selection/ball markers, throw-ins, corners, goal
  kicks, desktop touch-control suppression, and zero console errors.

## Runtime Layout

- Shared pitch surface baseline: the measured top bound of the scaled Mint pitch
  slab, rather than the slab's bottom or imported origin.
- Playable bounds: approximately `X ±15`, `Z ±10.8`.
- Spain attacks toward positive X; Argentina attacks toward negative X.
- Character gameplay roots move deterministically in XZ.
- Five outfield homes per team establish distinct central, wide, and defensive
  lanes; only one defender presses while teammates preserve spacing.
- The smaller black-and-white Mint football remains a separate mesh and is
  attached, passed, shot, saved, restarted, and scored by the gameplay simulation.
- The verified original Mint pitch remains in production after the low-profile
  replacement failed its live mesh gate. The accepted selection and ball rings
  are separate Mint meshes positioned by Three.js transforms.
- Both goal assets face into the pitch so their net depth extends outside the
  field of play.
- Fourteen blank pitchside boards line the touchlines; two dugouts and two
  equipment stations occupy the near technical area without entering playable
  bounds.
- Stadium stands are reused instances from the accepted crowdless Mint family.
- The far and end sections stay close to the pitch while the near grandstand is
  placed behind the broadcast camera, creating a larger bowl without blocking
  the realistic zoomed-out field view.
- Trophy and confetti are accepted Mint props revealed only for Spain's win.
