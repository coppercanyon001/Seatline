# Reef Rivals Game Workflow

## Screenshot-First Debugging Rule

When a visual problem is reported, ask the user for a current screenshot before starting a long debugging or regeneration loop whenever that screenshot could materially narrow the cause. Use the screenshot to distinguish asset defects, grounding, scale, camera, lighting, loading, and placement problems.

Skip the request only when the current browser view already provides equivalent visual evidence or when the fix is already unambiguous from supplied media.

## Mint Asset Rule

All visible and audible production content must come from Mint MCP. Three.js may arrange, animate, collide with, light, and render Mint assets, but may not create substitute visual assets.

## Character Rule

Gameplay characters must use rigged Mint models with active animation clips. Validate idle, throw, hit, and victory poses in the browser. If a model visibly deforms, locks into a T-pose, or produces a broken action, retry the Mint animation before accepting the character.

## Playability Rule

Verify each round from the gameplay camera, test both player and rival damage, exercise limited ammunition, and confirm that victory, defeat, upgrades, sound, and touch-sized controls remain reachable.
