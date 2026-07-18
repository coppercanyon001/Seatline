# Final Whistle — Video Capture Checklist

## Recommended Capture

- 1920×1080, 60 fps.
- Hide browser chrome for gameplay shots.
- Keep the game audio at approximately -12 dB beneath narration.
- Record clean gameplay first, then narration.
- Use 120–180% zoom for code and manifest inserts.

## Shot List

- [ ] Menu hero, 4 seconds.
- [ ] Click “Play the Final,” include whistle and crowd transition.
- [ ] Spain dribble and sprint.
- [ ] Pass and switch to the receiving player.
- [ ] Led through ball with `I` and an off-ball support run.
- [ ] Charged shot with visible power meter.
- [ ] Argentina pressure and a goalkeeper save.
- [ ] Spain goal and scoreboard update.
- [ ] Golden-goal HUD.
- [ ] Spain championship result.
- [ ] Rematch button returning to kickoff.
- [ ] Mint stadium/prop preview montage.
- [ ] Empty straight/corner stand previews, followed by the exclusive fan cast.
- [ ] Wide broadcast framing matching the realistic reference scale.
- [ ] Every visible fan performing a seated goal celebration.
- [ ] Character and animation folders.
- [ ] `worldCupMintAssets.ts` semantic asset map.
- [ ] Root-motion normalization code.
- [ ] AI and goalkeeper update sections.
- [ ] Build-log entries for the splat pivot and failed batches.
- [ ] Final deployed URL.

Production URL:
<https://grandmas-grocery-trip.mrpopper.chatgpt.site>

## Existing Capture Assets

The folder `outputs/world-cup-final-tutorial-assets/` contains the original
Mint previews and browser captures plus the final supporter and broadcast pass:

- `09-final-menu.png`
- `10-live-match.png`
- `11-goal-spain.png`
- `12-spain-champions.png`
- `13-grounded-expanded-stadium.png`
- `14-goal-crowd-cheer.png`
- `15-classic-ball-preview.webp`
- `16-small-classic-ball-correct-goals.png`
- `17-full-crowd-goal-cheer.png`
- `18-wide-broadcast-seated-crowd.png`
- `19-all-seated-goal-cheer.png`
- `20-empty-straight-stand-preview.webp`
- `21-empty-corner-stand-preview.webp`
- `22-final-wide-empty-stands-seated-crowd.png`
- `23-final-all-fans-seated-cheer.png`

## Deterministic Capture Route

Open `/?qa=1`, start the match, then use:

- `G` for a Spain goal;
- `H` for an Argentina goal;
- `X` for a 1–1 clock-expiry setup;
- `V` for a 2–1 Spain championship.
