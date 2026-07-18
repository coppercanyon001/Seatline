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

## Reusable Lessons

- Lock the game and asset contract before generation.
- A splat is optional; a verified playable world is mandatory.
- Reject incomplete families instead of mixing partial outputs.
- Validate rigs and clips structurally before browser integration.
- Neutralize animation drift at the clip layer, not with position hacks.
- Compose the environment from the gameplay camera.
- Capture every failed route; those decisions are often the best tutorial.
