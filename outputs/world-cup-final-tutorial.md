# Build a Mint-First 3D Football Final

This tutorial recreates the production workflow behind **Final Whistle: Spain
vs Argentina**, an original browser football game built with Mint-generated
world, character, animation, prop, and audio assets, then assembled and played
with Three.js.

## What We Built

- A stylized night final with Spain and Argentina color identities.
- Three outfield players and one goalkeeper per team.
- Movement, sprint, passing, charged shots, tackling, saves, goals, and kickoffs.
- Argentina AI with pressure, support, shooting, passing, and goalkeeper logic.
- A 150-second clock, golden goal, victory/defeat, and rematch.
- Keyboard and touch controls.

The complete source is centered in:

- `app/WorldCupFinal.tsx`
- `app/worldCupMintAssets.ts`
- `app/globals.css`
- `MINT_ASSET_MANIFEST.md`

## 1. Write the Product Contract First

Before generating anything, define:

1. the original art direction;
2. the team palette and silhouette rules;
3. the gameplay loop;
4. the complete asset families;
5. the camera and floor assumptions;
6. explicit rejection criteria.

For this game, the contract prohibited official logos, sponsors, tournament
branding, real-player likenesses, procedural replacement geometry, and partial
asset passes. The camera needed a readable goal, ball, nearby teammates, and
opponents in one elevated broadcast view.

Why this matters: without a contract, each generation can look good alone while
failing to work as a coherent game.

## 2. Preflight Mint Before Spending Credits

Verify the connected Mint account can:

- generate assets;
- approve review-mode work;
- retrieve final artifacts;
- access the animation catalog.

Record the preflight result in a build log. Do not begin a large batch until the
pipeline reports ready.

## 3. Try the Splat, but Give It a Fast Acceptance Gate

The first world experiment asked Mint for a contained stadium bowl with:

- an unobstructed rectangular pitch footprint;
- upright orientation and predictable ground;
- no players, goals, or readable text;
- enough clearance for an elevated follow camera.

The preview could not be inspected in the active session, so it was rejected
before final generation. This is the important lesson: a splat does not need to
look visibly broken to fail. If orientation, scale, collider, playable space, or
camera fit cannot be verified, pivot.

The fallback used solid Mint modules: one pitch, straight and corner stands,
goals, and corner flags.

## 4. Generate Complete, Coherent Families

Generate small families with one shared style contract:

- stadium kit;
- match props;
- outfield character pair;
- goalkeeper pair;
- audio set.

The first ten-item stadium pack partially failed, and the first four-character
pack failed. Both passes were discarded completely. Smaller retries succeeded.

Why discard partial passes? A runtime should never silently mix incompatible
versions just because a few artifacts finished.

## 5. Animate Every Production Character

Outfield rigs received:

- idle;
- run;
- football kick;
- slide tackle;
- hit reaction;
- victory cheer.

Goalkeepers received:

- idle;
- run;
- football kick;
- leap-and-catch save;
- hit reaction;
- victory cheer.

Validate more than file existence:

- the rig and animation node lists match;
- skin joint order matches;
- animation targets all exist;
- duration is nonzero;
- the model has a skinned mesh;
- the clip does not create destructive root drift.

Mint’s clips contained useful vertical hip movement plus horizontal root
translation. The game clones each clip and fixes the Hips track’s X and Z values
to the first keyframe while retaining Y. This keeps the body motion but lets
gameplay own world movement.

## 6. Build One Authoritative Asset Map

Create a semantic map only after every family is complete:

```ts
export const WORLD_CUP_MINT_ASSETS = {
  world: {
    pitch: "/models/world-cup-final/pitch.glb",
    football: "/models/world-cup-final/football.glb",
  },
  characters: {
    spainOutfield: {
      model: "/models/world-cup-final/players/spain-outfield.glb",
      animations: {
        idle: "/animations/world-cup-final/spain-outfield/idle.glb",
        run: "/animations/world-cup-final/spain-outfield/run.glb",
      },
    },
  },
} as const;
```

Never reference failed experiments directly from gameplay code.

## 7. Assemble the Stadium From the Gameplay Camera

Load, clone, uniformly scale, ground, and place Mint modules with Three.js.
Use one authoritative pitch. Reuse only compatible modules from the same Mint
family.

The first live review revealed that the overall stadium looked strong while the
players were too small. The fix was not new character generation. Character
height increased from roughly 1.7 to 2.24 game units and the camera moved lower
and closer. This preserved the stadium composition while improving gameplay
readability.

## 8. Keep Gameplay Roots Separate From Visual Rigs

Each player has:

- a gameplay root position and facing;
- a cloned Mint rig;
- a Three.js animation mixer;
- semantic actions;
- a home position;
- action locks and cooldowns.

Movement updates the gameplay root. Animations play inside that root. The Mint
football is a separate mesh that can be attached for dribbling or released with
velocity for passes and shots.

## 9. Layer the Match Systems

Build in this order:

1. player movement and field clamping;
2. loose ball and possession;
3. pass and charged shot;
4. goal detection and kickoff reset;
5. opponent pressure and support positions;
6. goalkeeper tracking and saves;
7. tackling and hit reactions;
8. clock, golden goal, result, and rematch;
9. audio and UI feedback;
10. touch controls.

This order keeps each layer testable.

## 10. Add Deterministic QA Shortcuts

The local `?qa=1` route enables:

- `G`: Spain goal;
- `H`: Argentina goal;
- `X`: force a 1–1 match with one second left;
- `V`: force a 2–1 Spain victory.

These shortcuts make screenshots and state testing repeatable without changing
normal gameplay.

## 11. Test the User Journey, Not Just the Build

The final QA covered:

- successful production compilation;
- menu and user-gesture start;
- passing and possession change;
- score update after a goal;
- golden-goal activation;
- victory and rematch;
- browser console with no runtime errors;
- tutorial screenshots for all major states.

The four final screenshots are:

- `outputs/world-cup-final-tutorial-assets/09-final-menu.png`
- `outputs/world-cup-final-tutorial-assets/10-live-match.png`
- `outputs/world-cup-final-tutorial-assets/11-goal-spain.png`
- `outputs/world-cup-final-tutorial-assets/12-spain-champions.png`

Two revision screenshots record the grounding and stadium correction:

- `outputs/world-cup-final-tutorial-assets/13-grounded-expanded-stadium.png`
- `outputs/world-cup-final-tutorial-assets/14-goal-crowd-cheer.png`

The final refinement assets record the ball replacement and full crowd:

- `outputs/world-cup-final-tutorial-assets/15-classic-ball-preview.webp`
- `outputs/world-cup-final-tutorial-assets/16-small-classic-ball-correct-goals.png`
- `outputs/world-cup-final-tutorial-assets/17-full-crowd-goal-cheer.png`

## Revision Lesson: Ground to the Surface, Not the Origin

The Mint pitch is a thick slab. Scaling it to field width made the slab roughly
1.4 game units tall, but the first runtime treated its bottom as the playing
surface. Players and the football were therefore buried.

The corrected runtime measures `Box3.max.y` after the pitch is scaled and
positioned, then derives the player and ball baselines from that measured top.
This is more reliable than a hand-tuned lift and automatically follows future
pitch scale changes.

The stadium revision also uses two rings of the accepted Mint stand modules.
The inner ring remains flush with the pitch edge and the outer ring supplies
the larger bowl.

## Revision Lesson: Readability and Event-Wide Animation

A gameplay prop can be structurally valid and still communicate the wrong
thing. The original candy-gold ball read as an oversized fantasy object, so a
new Mint pass produced a visually explicit white-and-black football. Keeping
the same semantic runtime path made the replacement low risk; reducing the
runtime scale completed the readability fix.

Goal direction is easiest to review by looking at the net depth, not only the
front posts. Each goal should open toward the pitch while the net volume extends
behind the goal line. Rotating both goal instances 180 degrees corrected that
relationship.

The first full-crowd pass used 74 clones of the accepted outfield rigs. It
proved the event routing, but it did not satisfy the final art direction:
supporters needed their own identities, every motion needed to stay seated, and
the grandstand could not contain baked people.

The production crowd therefore uses four new fan rigs and 458 runtime clones.
Four rows fill each long grandstand and three rows fill both ends. Every clone
owns an animation mixer, starts with its fan-specific seated idle clip, and
crossfades to a varied seated celebration when the scoring event fires. Routing
that event to `"all"` produces the requested whole-stadium reaction without
ever switching to a standing clip.

## Final Revision: Crowdless Architecture and Broadcast Mechanics

The old stand assets were single meshes with old spectators baked into their
geometry. They could not be cleaned in Three.js without violating the
Mint-only world rule, so Mint generated matching empty straight and corner
grandstands. This is a useful production lesson: if an unwanted element is
inseparable from an authored asset, replace the asset family instead of hiding
the problem with more layers.

The final camera follows the reference at a realistic broadcast scale. A
44-degree field of view, elevated sideline position, and reduced X tracking
keep almost the whole pitch visible while still following the phase of play.
The near grandstand sits behind the camera so its canopy never blocks the
field; the far and end sections remain visible and filled with the seated cast.

The football mechanics now include assisted passes, led through balls on `I`,
support runs, contextual switching, and a possession indicator. These are
original systems built for this game; the goal is a familiar broadcast-football
rhythm without copying proprietary interface or assets.

Final captures:

- `outputs/world-cup-final-tutorial-assets/20-empty-straight-stand-preview.webp`
- `outputs/world-cup-final-tutorial-assets/21-empty-corner-stand-preview.webp`
- `outputs/world-cup-final-tutorial-assets/22-final-wide-empty-stands-seated-crowd.png`
- `outputs/world-cup-final-tutorial-assets/23-final-all-fans-seated-cheer.png`

## Final Revision: Technical Areas and Camera-Relative Input

The last stadium pass combined visual composition and control correction.
Both goal instances keep the same model and scale, but their mirrored
rotations make the mouths face the field and place the net depth outside the
goal lines.

The stand scale increased only enough to strengthen the seating silhouette.
A larger experiment made the canopies cross the camera, so browser QA drove a
safer value. The supporter grid grew to 458 clones across four long-side rows
and three end rows. Lower row baselines keep every fan seated within the
grandstand structure, while the existing score event still crossfades every
mixer into its fan-specific seated cheer.

Mint supplied a final three-model sideline family:

- an empty six-seat dugout;
- a blank modular pitchside board;
- a stocked ball, cone, towel, and bottle station.

Three.js scales, rotates, and repeats those accepted assets outside the
playable touchlines. Fourteen boards cover both sides, while two dugouts and
two equipment stations define the near technical area.

The old input vector treated command names as world axes, which made the
broadcast camera feel rotated. The corrected mapping is screen-relative:
`W`/up moves toward the top of the display, `S`/down toward the bottom, and
`A`/`D` left and right. Pass and shot aiming read the same vector.

Additional tutorial assets:

- `outputs/world-cup-final-tutorial-assets/24-team-dugout-mint-preview.webp`
- `outputs/world-cup-final-tutorial-assets/25-pitchside-board-mint-preview.webp`
- `outputs/world-cup-final-tutorial-assets/26-equipment-station-mint-preview.webp`

## Full-Send Gameplay and Readability Pass

The recorded-play review exposed a systems problem rather than one isolated
bug: the ball and controlled player were hard to distinguish, the camera
followed both field axes and felt floaty, automatic switching had no visible
identity, three outfielders collapsed into clusters, and out-of-bounds shots
bounced off invisible walls.

The final pass expanded each team to five outfield lanes plus a goalkeeper.
Only one defender presses; the remaining players blend their authored home
positions with the ball position. Pairwise spacing now resolves at a wider
minimum distance. Spain still switches contextually to a receiving player, but
a Mint gold ring makes that handoff obvious.

Mint also produced a blue-and-white loose-ball locator and a low-profile pitch
candidate in [this generation](https://mint.gg/chat/ph7762ym68xwf9x17cm497y4hx8atsqt).
The two markers passed live QA. The pitch preview looked correct, but its GLB
unfolded into reflective panels in the browser. The runtime capture documents
the failure, and production pivots back to the previously verified Mint pitch.
This is why preview approval and in-engine approval are separate gates.

The broadcast camera now uses a 44-degree lens, higher fixed elevation, no
vertical-field tracking, and only a subtle horizontal bias. The whole field and
both goals remain visible while play moves. Sprint consumes a DOM stamina
meter, desktop touch controls are hidden, and possession changes receive short
status callouts.

Out-of-bounds logic now awards:

- throw-ins to the team that did not touch the ball last;
- goal kicks when the attacking team sends the ball over the end line;
- corners when the defending team makes the last touch.

Final pass assets and evidence:

- `27-professional-pitch-v2-preview.webp`
- `28-player-selection-ring-preview.webp`
- `29-ball-locator-preview.webp`
- `30-final-stable-match.png`
- `31-final-goal-cheer.png`
- `32-final-champions.png`
- `33-rejected-pitch-runtime.png`

## Reusable Lessons

- Lock the game and asset contract before generation.
- A splat is optional; a verified playable world is mandatory.
- Reject incomplete families instead of mixing partial outputs.
- Validate rigs and clips structurally before browser integration.
- Neutralize animation drift at the clip layer, not with position hacks.
- Compose the environment from the gameplay camera.
- Capture every failed route; those decisions are often the best tutorial.

## Play the Finished Game

The validated production build is available at:

<https://grandmas-grocery-trip.mrpopper.chatgpt.site>
