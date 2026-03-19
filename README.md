# Lodu Royale

Lodu Royale is now rebuilt as a **modern modular web game foundation** instead of a one-file static prototype.

## What's improved

- Multi-file architecture with separate UI composition, board rendering, constants, and game engine modules.
- Centralized gameplay rules for dice rolls, movement, captures, home lanes, extra turns, and win state.
- Cleaner structure for scaling toward animation systems, backend APIs, multiplayer rooms, and future game modes.
- Premium dashboard layout inspired by current casual board-game UX expectations.

## Project structure

- `src/app.js` – application layout, UI sections, and event wiring.
- `src/components/board.js` – reusable board renderer.
- `src/game/constants.js` – board geometry and player constants.
- `src/game/engine.js` – gameplay rules and state transitions.
- `src/styles.css` – full visual system.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
