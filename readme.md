# Sentry

Sentry is a JavaScript idle game engine focused on simplicity and extensibility.

## Features

* Player management
* Skill system with actions and progression
* Combat, hunting, cooking, and excavation mechanics
* Recipe system
* Panel system for game UI
* Core game logic and utilities

## Tech Stack

* JavaScript
* Vite
* npm
* SweetAlert2

## Project Structure

The project is divided into several modules, including:

* `src/dataObjects`: Data object definitions for the game.
* `src/dataObjects/actions`: Action definitions.
* `src/dataObjects/entities`: Entity definitions.
* `src/dataObjects/recipes`: Recipe definitions.
* `src/dataObjects/skills`: Skill definitions.
* `src/managers`: Manager classes for handling game logic.
* `src/panels`: Panel components for the game UI.
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

