# Final Whistle: Spain vs Argentina

An original Mint-first 3D arcade football final. Lead Spain through a fast
3-v-3 match plus goalkeepers against Argentina in a miniature night stadium.

All visible and audible production assets—the pitch, stands, goals, props,
players, animation, crowd, whistle, impacts, and victory audio—were created
through Mint. Three.js is used only for assembly, lighting, transforms,
animation playback, collision checks, camera work, AI, and game logic.

## Gameplay

- Move with `WASD` or the arrow keys; hold `Shift` to sprint.
- Press `J` to pass and switch to the receiver.
- Hold `K` or `Space` to charge a shot, then release.
- Press `L` to tackle and `Q` to switch Spain players.
- Play a 150-second final; a draw goes to golden goal.
- Use the touch-sized movement and action controls on mobile.

## Mint Asset Policy

The stadium splat experiment was rejected because its preview could not be
inspected against the project’s orientation, collider, pitch-clearance, and
camera gates. The final game uses verified solid Mint modules.

See [MINT_ASSET_MANIFEST.md](./MINT_ASSET_MANIFEST.md) for accepted production
families, failed passes, provenance, and validation. See
[GAME_WORKFLOW.md](./GAME_WORKFLOW.md) for the Mint-only production rules.

## Local Development

Requirements: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Build and test:

```bash
npm run build
npm test
```

Open `/?qa=1` for deterministic capture shortcuts:

- `G`: Spain goal
- `H`: Argentina goal
- `X`: tied clock-expiry setup
- `V`: Spain championship result

## Project Structure

```text
app/WorldCupFinal.tsx              Scene, gameplay, AI, camera, audio, and animation
app/worldCupMintAssets.ts          Authoritative Mint runtime map
public/models/world-cup-final/     Mint stadium, props, and player rigs
public/animations/world-cup-final/ Mint animation clips
public/audio/world-cup-final/      Mint match audio
MINT_ASSET_MANIFEST.md             Provenance and verified behavior
outputs/world-cup-final-tutorial.md
outputs/world-cup-final-narration-script.md
outputs/world-cup-final-capture-checklist.md
```

## Tutorial Pack

The `outputs/` folder contains a live production diary, a finished step-by-step
tutorial, a narration script, a video capture checklist, eight Mint asset
previews, and four final browser screenshots.

## Open-Source Gaming Notes

The code is licensed under MIT. Generated assets may have separate rights under
their Mint generation terms. Verify the asset rights for your use case before
redistributing or selling asset packs.
