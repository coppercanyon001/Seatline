# Final Whistle — Tutorial Narration Script

Target length: 5–7 minutes.

## 0:00–0:25 — Cold Open

**On screen:** `09-final-menu.png`, then a quick cut to `11-goal-spain.png`.

**Narration:**  
“This is Final Whistle, an original Spain-versus-Argentina 3D football final.
The stadium, pitch, props, characters, animation, and audio were all created
through Mint. Three.js turns those assets into a playable 3-v-3 match with
goalkeepers, AI, charged shots, golden goal, and touch controls.”

## 0:25–0:55 — Start With a Contract

**On screen:** Highlight the visual and gameplay contract in
`MINT_ASSET_MANIFEST.md`.

**Narration:**  
“The first step was not generating a model. It was defining the product:
miniature night-stadium art, clear Spain and Argentina palettes, no official
logos or real-player likenesses, one readable broadcast camera, and complete
asset families that could be rejected as a unit.”

## 0:55–1:30 — The Splat Experiment and Pivot

**On screen:** Mint chat link, then stadium module previews 01–04.

**Narration:**  
“I tried the stadium as a splat first. The experiment reached preview-ready,
but I could not inspect orientation, scale, collider fit, or camera clearance in
the active session. That fails the acceptance gate, so I stopped before final
generation and pivoted to solid Mint modules: one pitch, reusable stands, goals,
and flags.”

## 1:30–2:10 — Failed Batches Are Part of the Process

**On screen:** Build log entries for the failed ten-item pack and failed
four-character roster; then previews 05–08.

**Narration:**  
“Two large batches failed. A ten-item stadium pack completed only three models,
and a four-character roster failed during final generation. I discarded each
whole pass and retried smaller coherent families. That prevented partial or
incompatible artifacts from leaking into the game.”

## 2:10–2:55 — Rig and Animation Validation

**On screen:** Asset map and the four character animation folders.

**Narration:**  
“Each production character received six role-specific clips. Before coding, I
compared all 26 node names, skin joints, animation targets, and clip durations.
The skeletons matched exactly. The clips did include horizontal hip
translation, so the runtime preserves vertical motion but fixes X and Z to the
first frame. The rig animates naturally while gameplay remains authoritative.”

## 2:55–3:35 — Assemble From the Camera

**On screen:** `10-live-match.png`; zoom into stands, players, pitch, and goal.

**Narration:**  
“The stadium is assembled entirely from accepted Mint models. The first browser
review showed that the characters were too small for the broadcast view. I
scaled them up and moved the camera lower and closer. The second pass kept the
stadium spectacle while making team silhouettes and the ball readable.”

## 3:35–4:35 — Build the Match in Layers

**On screen:** Source sections for movement, possession, AI, goalkeeper, and
match state; cut back to gameplay.

**Narration:**  
“Gameplay was layered in a testable order: movement, loose-ball physics,
possession, passing, charged shots, goal detection, kickoffs, opponent pressure,
goalkeeper saves, tackling, then the 150-second clock and golden goal. Every
player has a deterministic gameplay root, a cloned Mint rig, a mixer, semantic
actions, a home position, and short action locks.”

## 4:35–5:15 — QA the Whole Journey

**On screen:** `11-goal-spain.png`, golden-goal HUD, then
`12-spain-champions.png`.

**Narration:**  
“A small QA route makes hard-to-reach states deterministic. I forced both goal
states, a one-all clock expiry, and a two-one Spain victory. The final browser
pass verified passing, scoring, golden goal, victory, rematch, and a clean
console.”

## 5:15–5:40 — Close

**On screen:** Final menu, source filenames, and deployed URL.

**Narration:**  
“The reusable idea is simple: define the contract, generate complete families,
reject unverified worlds, validate every rig, and compose from the gameplay
camera. Mint makes the production assets; Three.js makes them play.”
