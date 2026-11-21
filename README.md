# Spot the Difference — Moonlit Harbor, Clockwork Garden, Lantern Festival

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/giandisruw/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/giandisruw/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game that plays offline in a desktop
browser from its own static files. Two near-identical pictures side by side,
click the differences, watch the counter fall.

## The game

Three original scenes, 8 differences each (24 in total):

- **Moonlit Harbor** — a lighthouse bay at night: a missing star, the lamp's
  colour, a recolored roof, an extra seagull, a moved boat, a dark window,
  a missing buoy, missing chimney smoke.
- **Clockwork Garden** — a garden of gears and tulips: clock hands, a recolored
  tulip, a missing butterfly, an extra bee, fountain water, a missing bird,
  an extra cloud, a bench cushion.
- **Lantern Festival** — a night market of paper lanterns: a lantern's colour,
  a missing firework, an extra cat, banner stripes, an awning's colour, a dark
  bulb, an extra balloon, a missing kite.

Both panels are the same scene drawn procedurally on canvas; the right panel
applies every difference. Every scene, name and sound is original.

## How to play

- **Click** a difference on either panel to mark it (gold ring + chime).
  +100 points per find.
- **Wrong click:** −25 points and −3 seconds, with a red X flash.
- **H** — hint: marks one unfound difference (3 per level, 12 s cooldown,
  −50 points). **R** — restart the level. **1 / 2 / 3** — jump to a level.
  **Enter** — start. **M** — mute.
- **Timer:** 150 seconds per level, with a countdown bar that changes colour
  as time runs out. Clearing a level pays +5 points per second left.

## Run it

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```

No build step, no network requests: every file the game loads lives under
`game/`. Sounds are WebAudio oscillators — no audio files.

Staged screenshot states (used for `screenshots/`): `?shot=start`,
`?shot=play`, `?shot=play2`, `?shot=end` (add `&seed=1`).

## Layout

- `main.ts` — hand-in program: copies `game/` and `screenshots/` to
  `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json`
  with `buildDossier` from `vendor/makefun-game.ts`.
- `game/index.html` + `game/src/` — the game, split by job: `main.js` (state
  machine, loop, self-test), `scenes.js` (scene + difference data),
  `render.js` (procedural canvas painters), `differences.js` (hit-testing,
  scoring), `input.js` (pointer/keyboard), `audio.js` (WebAudio sounds),
  `hud.js` (top bar, buttons, overlays), `shots.js` (staged states).
- `screenshots/` — real renders of the game's own code in headless Chrome.
- `vendor/makefun-game.ts` — the kit's copy, unchanged.

Built for the make.fun bounty "Make the best spot the difference game":
https://make.fun/bounty/best-spot-the-difference-game-20261121-0451

Referral code: 0txwmf1m
