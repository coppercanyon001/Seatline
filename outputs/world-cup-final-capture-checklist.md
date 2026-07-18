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
- [ ] Charged shot with visible power meter.
- [ ] Argentina pressure and a goalkeeper save.
- [ ] Spain goal and scoreboard update.
- [ ] Golden-goal HUD.
- [ ] Spain championship result.
- [ ] Rematch button returning to kickoff.
- [ ] Mint stadium/prop preview montage.
- [ ] Character and animation folders.
- [ ] `worldCupMintAssets.ts` semantic asset map.
- [ ] Root-motion normalization code.
- [ ] AI and goalkeeper update sections.
- [ ] Build-log entries for the splat pivot and failed batches.
- [ ] Final deployed URL.

## Existing Capture Assets

The folder `outputs/world-cup-final-tutorial-assets/` contains eight Mint asset
previews and four final browser captures:

- `09-final-menu.png`
- `10-live-match.png`
- `11-goal-spain.png`
- `12-spain-champions.png`

## Deterministic Capture Route

Open `/?qa=1`, start the match, then use:

- `G` for a Spain goal;
- `H` for an Argentina goal;
- `X` for a 1–1 clock-expiry setup;
- `V` for a 2–1 Spain championship.
