# Munchkin Tools

Mobile-first companion app for the [Munchkin](https://munchkin.game/) card game. Tracks your heroes — name, gender, level, gear, race, class — and does the combat math so you can stop juggling paper sheets at the table.

**Live:** <https://munchkin-tools.wellsm.dev>

## Features

- **Hero sheets** with level, gear, strength, gender, race, class, avatar color
- **Combat calculator** — party vs monster, helper support, modifiers for both sides
- **Races:** Human, Elf, Dwarf, Halfling, Orc, Gnome
- **Classes:** Warrior, Wizard, Cleric, Thief, Bard, Ranger
- **Offline mode** — everything runs locally in your browser, no account needed
- **Online rooms** — play with friends on different devices, host-controlled combat
- **QR invites** — point your camera at another player's code, join the room
- **Identity on device** — reusable name/avatar across rooms, no sign-up
- **English and Portuguese** — toggle with the flag buttons on the landing
- **Keep Awake** toggle so the screen doesn't dim mid-session
- **Light and dark themes**

## How to use

### Landing

Open the app and you'll see two sections:

- **Local** — single button, starts an offline game immediately
- **Online** — lets you create or join a room with other players

Top-right shows your **identity pill** — tap it to set your display name or reset your identity (new player ID). Top-left has a **language selector** (🇺🇸 / 🇧🇷). Bottom has quick links for support and suggestions.

### Offline mode

One device, one local game. Open **Local → Criar partida / Create match** and you're in.

Three tabs at the bottom:

- **Heroes** — add, edit, remove heroes. Tap a hero to edit name, gender, level, gear, races, classes, avatar color.
- **Combat** — only available with 3+ heroes. Pick the main combatant, optionally add a helper, use +/- buttons to adjust monster level and modifiers on both sides. The banner at the top shows party total vs monster total. "Finish" resolves winners (level up) and fallen heroes (reset level). "Fled" ends combat with no level changes.
- **Settings** — max heroes in the party, max level ceiling, theme, language, keep-awake toggle, plus a **Danger Zone** reset that wipes all heroes.

Everything persists in `localStorage`. Refreshing or closing the tab keeps your state; only Danger Zone clears it.

### Online mode

Online rooms are real-time — every connected player sees the same state instantly.

**First time on a new device**, the app may prompt for an **access code**. This is a simple anti-abuse gate I can toggle on/off via the Convex dashboard. If it's on, the host of the game shares the code with you; enter it once and it's remembered.

**Creating a room**:
1. Tap **Online → Criar sala / Create room**
2. Enter your display name
3. You're dropped into the waiting room as host

**Joining a room**:
- Tap **Entrar em sala / Join room**, type the 6-char room code + your name
- OR tap **Escanear QR / Scan QR**, point your camera at the host's invite code

**Waiting room:**
- Host sees a **Start** button once enough players are ready
- Each player has a Ready/Not Ready toggle and can change their avatar color
- **Host-only** actions: approve join requests, remove players
- A **Crown** icon marks the host in every player list. A ring marks yourself.

**In-game:**
- **Heroes tab** — list of everyone's heroes. Host can edit anyone; others edit only their own. Stats and class/race chips are inline on the row.
- **Combat tab** — only the **host** picks the main combatant, then only the main combatant or their helper can change modifiers/finish/flee. This matches the game's rule that the fighter decides things mid-combat.
- **Share button** (bottom-right on Heroes) — share the invite link or QR
- **Notification bell** (top-right when in a room) — enables browser push for turn updates

Join requests after the game has started queue for host approval; the host sees a badge on the notification button and can accept/deny.

### Settings

Same shape in offline and online (online has some host-gated items):

- **Max heroes** — party size ceiling (3 to 8)
- **Max level** — per-session cap; heroes above it get demoted
- **Theme** — dark / light
- **Language** — English / Português
- **Keep Awake** — prevents the screen from sleeping (uses Wake Lock API; unsupported browsers hide the toggle)
- **Support the project** — Buy Me a Coffee link + Send a suggestion form
- **Danger Zone** — remove all heroes (offline) or leave the room (online)

### Suggestions

Tap **Enviar sugestão / Send a suggestion** (bottom of Landing or inside Settings) to drop me feedback — bugs, ideas, anything. Leaving name and contact is optional; if you want a reply, include a way to reach you (email, Discord, `@instagram`).

## Support the project

If Munchkin Tools saved you some paperwork at the table, a coffee helps cover hosting so it stays free for everyone:

**☕ <https://buymeacoffee.com/wellingtonsm>**

You can also drop suggestions in the BMC message field while you're there.

## Tech stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind 4, shadcn/ui, Radix UI, Zustand, React Router 7
- **Backend:** [Convex](https://convex.dev) — real-time DB, queries, mutations, crons
- **i18n:** typed dictionaries (EN, PT)
- **Deploy:** static container behind nginx, hosted on EasyPanel

Monorepo layout:

    apps/web              # Vite app (public UI)
    packages/convex       # Convex functions, schema, crons
    packages/utils        # shared helpers

## Development

Requires Node 20+.

```bash
npm install
cd packages/convex && npx convex dev   # first time only; creates a dev deployment
# copy the URL it prints into apps/web/.env.local as VITE_CONVEX_URL=...
cd ../..
npm run dev                             # runs web + convex concurrently
```

Other commands:

```bash
npm run build         # production build of every workspace
npm run test          # runs vitest in apps that have tests
npm run lint          # eslint
```

See `apps/web/README.md` for Convex setup details and `packages/convex/README.md` for the access-code gate.

### Docker build

From the repo root, passing your Convex URL as a build arg:

```bash
docker build \
  -f apps/web/Dockerfile \
  --build-arg VITE_CONVEX_URL=https://your-deployment.convex.cloud \
  -t munchkin-tools \
  .
docker run --rm -p 8080:80 munchkin-tools
```

## Feedback

- Issues and ideas: the in-app **Send a suggestion** form (goes straight to the Convex `suggestions` table)
- Or a coffee with a note on <https://buymeacoffee.com/wellingtonsm>

Munchkin is © Steve Jackson Games. This project is an unofficial fan-made companion and is not affiliated with SJG.
