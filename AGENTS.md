# Project Instructions

## Stack

- Use Vite + React + TypeScript.
- Use Tailwind CSS for styling.
- Use Bun for dependency installation and project scripts.
- Use Socket.IO for real-time synchronization between screens.

## Commands

- Install dependencies with `bun add`.
- Run checks with `bun run lint` and `bun run build`.
- Keep the project buildable after each meaningful change.

## App Structure

- Build the experience as a two-screen escape room:
  - `outside`: registration and waiting screen.
  - `room`: in-room game screen.
  - `admin`: optional control/debug screen.
- Keep shared game state types and socket event names in shared modules.
- Avoid duplicating game-state logic across screens.

## Styling

- Prefer Tailwind utilities over custom CSS.
- Keep `src/index.css` limited to Tailwind imports, fonts, tokens, and true global styles.
- Use the configured fonts:
  - `font-sans`: Sanofi Sans.
  - `font-serif`: Sanofi Serif.
  - `font-display`: Bungee.

## Socket.IO

- Treat the server as the source of truth for game state.
- Use explicit event names and typed payloads.
- New clients should receive the current game state immediately after connecting.
- Keep registration, game start, game end, and reset flows deterministic.

## Development Style

- Keep changes small and focused.
- Use existing project patterns before adding new abstractions.
- Validate user-facing flows with browser checks when UI behavior changes.
