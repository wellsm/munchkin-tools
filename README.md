# Game Tools

Mobile-first web companion for tabletop game sessions. Current games:

- **Munchkin** — player cards with level, item bonus, classes, races; live strength totals; combat tab vs monster with team buffs.

## Development

    npm install
    npm run dev       # Vite dev server
    npm run test      # Vitest
    npm run build     # production build

## Adding a new game

1. Create `src/games/<id>/` with its own store, types, components.
2. Add a route in `src/app.tsx`.
3. Register the game in `src/games/registry.ts`.
