# Final Whistle: Spain vs Argentina — Live Tutorial Build Log

Date started: 2026-07-18  
Format: tutorial-ready production diary  
Goal: Build and publish a polished Mint-first 3D arcade football final.

## Tutorial Promise

This log records the decisions that matter to another builder:

- the original game brief and quality bar;
- the complete Mint asset contract before gameplay coding;
- exact Mint generation chats and production prompts;
- what failed, how it was diagnosed, and why a route was rejected;
- artifact retrieval and structural validation;
- the Three.js runtime architecture;
- gameplay, controls, AI, audio, responsive UI, and match-state design;
- browser screenshots and QA findings;
- deployment and the final playable link.

The finished tutorial pack will also include:

- a concise step-by-step tutorial;
- a narration script with suggested on-screen beats;
- a capture checklist for a short build video;
- final gameplay screenshots and a demo sequence.

## Chapter 1 — Define the Product Before Generating Assets

Working title: **Final Whistle: Spain vs Argentina**

Original visual language:

- colorful broadcast-night miniatures;
- rounded candy-gloss surfaces;
- warm gold final-night lighting;
- Spain authored in red, yellow, and navy;
- Argentina authored in sky blue, white, and black;
- no official crests, sponsors, tournament graphics, or real-player likenesses.

Core loop:

- control Spain in a fast 3-v-3 match plus goalkeepers;
- move, sprint, pass, tackle, and charge shots;
- Argentina pressures, passes, shoots, and defends;
- 150-second final with score, golden-goal extra time, win/loss, and rematch;
- keyboard and touch controls.

The complete production contract lives in `MINT_ASSET_MANIFEST.md`.

## Chapter 2 — Mint Preflight

Mint identity, generation, approval, and artifact-retrieval scopes were verified
before starting billable work. The connected account reported the asset pipeline
ready with 58,594 usage credits available.

Lesson: global MCP registration, OAuth health, and the current task's tool
session are separate states. The previous task required reauthentication and a
Codex restart before `who_am_i` became ready.

## Chapter 3 — Generate the World and Complete Asset Families

### Stadium splat experiment

Mint chat: <https://mint.gg/chat/ph781qq61mpygb3a7jrvgba13h8ara97>

The prompt requested a contained, upright stadium bowl with a completely clear
pitch footprint, no players, no goals, no readable text, and generous
broadcast-camera clearance.

Decision: **rejected before final generation**.

Reason: the world reached preview-ready status but returned no inspectable
preview image through the artifact response, and the Mint web preview was not
available in the current browser session without a separate sign-in. The
project workflow requires a real visual review before approving a splat. Rather
than spend credits blindly or force an unverified world into gameplay, the
build pivoted immediately to solid Mint modules.

Tutorial lesson: a splat can fail operationally before it fails visually. If
preview, scale, orientation, collider, or camera fit cannot be verified, use the
solid-asset route.

### First stadium and prop pack

Mint chat: <https://mint.gg/chat/ph73v3p1xj6saec33ydvrjvgy18arxaa>

The ten-item batch partially succeeded: the pitch, corner flag, and football
completed while seven models failed. The entire pass was marked incomplete and
none of its partial outputs will be used in production.

Lesson: do not mix a partial asset-family pass into the runtime just because
some items look useful. Split the retry into smaller coherent families.

### Solid stadium retry

Mint chat: <https://mint.gg/chat/ph74x6mhqdn6pe9a6hqytkdvrx8asjdk>

Four required items:

1. authoritative marked pitch;
2. straight grandstand;
3. matching corner grandstand;
4. football goal.

Status: complete and accepted.

### Match-prop retry

Mint chat: <https://mint.gg/chat/ph72h5kerwdw0nzdfnwe2a75fh8arvrg>

Four required items:

1. football;
2. corner flag;
3. original championship trophy;
4. celebration streamer burst.

Status: complete and accepted.

## Chapter 4 — Generate a Rig-Compatible Player Roster

### First four-character roster

Mint chat: <https://mint.gg/chat/ph7783fe4atx20mvnhnhkn3tvd8ar2v1>

The combined four-character pack failed during final generation. The full pass
was discarded.

### Complete outfield pair retry

Mint chat: <https://mint.gg/chat/ph797348b0e47k2hstbtrz19fd8asama>

Characters:

- Spain outfield hero;
- Argentina outfield rival.

Status: complete, imported, structurally validated, and animated.

### Complete goalkeeper pair retry

Mint chat: <https://mint.gg/chat/ph7bhc6jvfkaemc0vpxvbpx31n8arjb9>

Characters:

- Spain goalkeeper;
- Argentina goalkeeper.

Status: complete, imported, structurally validated, and animated.

Lesson: when a large character family stalls or fails, preserve one style
contract and retry in smaller complete passes. Never use a static preview or a
partial rig batch in gameplay.

## Chapter 5 — Generate the Match Audio

The complete Mint audio set reached final output readiness:

- 30-second loopable crowd ambience;
- referee whistle;
- ball kick;
- goal roar;
- goalkeeper save impact;
- original victory sting.

All six MP3 files were retrieved into `public/audio/world-cup-final/` and passed
basic file-format validation. Duration, audible-content, and in-browser playback
checks remain part of final QA.

## Chapter 6 — Validate Before Runtime Integration

All world, prop, character, and animation GLBs passed structural validation.
Every rig and clip has the same 26-node skeleton and joint order. All 24 clips
have valid targets and nonzero duration.

The run clips include authored hip translation. The runtime preserves vertical
motion but fixes horizontal hip translation to its first keyframe so a run
cycle cannot pull a gameplay character away from its physics root.

Lesson: animation compatibility is more than “the file loads.” Compare node
order, skin joints, clip targets, duration, and root translation before wiring
gameplay.

## Chapter 7 — Build the Authoritative Runtime Map

`app/worldCupMintAssets.ts` is the only production asset map. It references
accepted complete passes and gives every artifact a semantic role. Failed and
partial generation outputs never enter this map.

## Chapter 8 — Assemble the Stadium From the Camera

The production world uses:

- one authoritative Mint pitch;
- reusable straight and corner Mint grandstands;
- two Mint goals;
- four Mint corner flags;
- one separate Mint football;
- Mint trophy and confetti props for the championship state.

The first browser review showed a strong stadium composition but players were
too small for the broadcast view. Player height was increased and the gameplay
camera moved lower and closer. The second review made team silhouettes and the
ball readable without losing the goal, midfield, or nearby stands.

## Chapter 9 — Implement the Match

The gameplay runtime now includes:

- 3-v-3 outfield players plus one goalkeeper per team;
- Spain movement, sprint, pass, charged shot, tackle, and player switch;
- possession, loose-ball friction, bounce, goal-mouth detection, and kickoffs;
- Argentina pressure, support positioning, passing, shooting, and tackles;
- goalkeeper tracking, saves, possession, and distribution;
- idle, run, kick, tackle, hit, save, and victory animation routing;
- 150-second clock, score, golden goal, victory/defeat, and rematch;
- crowd loop, whistle, kick, goal, save, and victory audio;
- keyboard and touch-sized controls.

## Chapter 10 — Browser QA and Tutorial Captures

The production build compiled successfully. Desktop browser QA exercised:

- menu and start;
- live play and passing;
- a Spain goal and score update;
- golden goal after a drawn clock;
- Spain victory and rematch;
- browser console inspection with no runtime errors.

Saved tutorial captures:

- `09-final-menu.png`
- `10-live-match.png`
- `11-goal-spain.png`
- `12-spain-champions.png`

These are stored in `outputs/world-cup-final-tutorial-assets/` with the eight
Mint asset-preview images captured earlier.

## Chapter 11 — Publish the Validated Build

The exact validated source was committed, pushed, packaged from a clean
worktree, saved as a production version, and deployed privately.

Playable game:
<https://grandmas-grocery-trip.mrpopper.chatgpt.site>

The existing Sites address retains its original slug, while the site title and
the game's page metadata now read **Final Whistle: Spain vs Argentina**.

## Chapter 12 — Grounding, Ball Readability, and Stadium Scale Revision

The first published version revealed that the players and ball were positioned
against `Y = 0`, which was the bottom of the Mint pitch slab rather than its
visible top. The scaled slab is approximately 1.4 world units thick, explaining
why legs and the football were buried.

The revision now:

- measures the Mint pitch's top bound after scaling;
- anchors every gameplay player and goalkeeper to that surface;
- anchors the ball, goals, flags, trophy, and confetti to the same baseline;
- enlarges the Mint football and gives it a restrained tracking light;
- expands the stadium into a flush inner bowl and second outer ring;
- adds 20 rigged Mint Spain and Argentina supporters to the seating;
- routes accepted idle and victory clips so the winning supporters cheer.

The first enlarged-bowl screenshot exposed a dark gap between the pitch and
stands. The inner ring was moved flush with the pitch while the outer ring was
kept for scale.

New browser captures:

- `13-grounded-expanded-stadium.png`
- `14-goal-crowd-cheer.png`

Browser QA confirmed visible feet, a readable ball, goal scoring, victory state,
and no runtime errors.

## Chapter 13 — Classic Ball, Goal Orientation, and Full-Crowd Cheer

The next visual review found three specific readability problems: the football
was too large and too colorful, the goal nets extended into the pitch, and the
stands needed to feel fully populated.

Mint generated a replacement classic football in
[this asset chat](https://mint.gg/chat/ph7cs7g4v4xhyycsjzkdqr2xch8asans).
Its inspected preview has a white leather surface with black panels and no
logos, text, or accent colors. The valid 842,968-byte GLB replaced the original
candy-gold ball at the existing runtime path, and its gameplay scale was reduced
from `0.68` to `0.46`.

The two Mint goal instances were rotated 180 degrees so each frame still opens
toward the field while its net depth extends outside the playing area.

The crowd layout grew from 20 to 74 rigged Mint-character clones:

- three seating rows along each touchline;
- two seating rows behind each goal;
- accepted idle animation during play;
- accepted victory animation on every spectator after either team scores.

New production captures:

- `15-classic-ball-preview.webp`
- `16-small-classic-ball-correct-goals.png`
- `17-full-crowd-goal-cheer.png`

The final browser pass confirmed the compact black-and-white ball, corrected
goal orientation, populated four-sided stands, a score-triggered crowd state,
and zero console errors.
