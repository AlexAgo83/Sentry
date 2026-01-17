# Sentry

Sentry is a TypeScript + React idle game with a PWA-first setup and a modern fantasy UI.

## Features

* Multi-player roster with skills, recipes, and actions.
* Offline catch-up and recap summary on return.
* Local persistence via localStorage adapter.
* PWA support (manifest + service worker).
* Modern fantasy UI shell with performance telemetry.

## Tech Stack

* TypeScript
* React
* Vite
* Vitest
* SweetAlert2

## Project Structure

* `src/app`: React UI (components, hooks, styles).
* `src/core`: Game loop, state, runtime, serialization, types.
* `src/data`: Definitions for skills, recipes, and actions.
* `src/store`: Lightweight store for the game state.
* `src/adapters`: Persistence adapters (localStorage).
* `styles`: Global styles shared by the UI.
* `public`: PWA assets (manifest, service worker, icons).
* `logics`: Product workflow and planning artifacts.
* `logics/request`: Incoming requests or ideas.
* `logics/backlog`: Core product items.
* `logics/tasks`: Execution plans derived from backlog items.

## Codex Instructions

Codex should load project-specific instructions from `logics/instructions.md`.

## Setup

1. Clone the repository: `git clone https://github.com/AlexAgo83/Sentry.git`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Scripts

* `npm run dev`: Start the Vite dev server with debug logging.
* `npm run live`: Start the Vite dev server.
* `npm run build`: Build for production.
* `npm run preview`: Preview the production build.
* `npm run tests`: Run the test suite with Vitest.
* `npm run coverage`: Run coverage with Vitest.

## Troubleshooting

If you encounter any issues, check the console logs for errors.

## Contributing

Contributions are welcome. Please submit a pull request with a clear description of the changes and follow the project's coding conventions.

## License

This project is licensed under the MIT License.

