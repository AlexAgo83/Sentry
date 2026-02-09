# Image Asset Layout

This folder is organized by usage to keep asset paths predictable and scalable.

## Structure

- backgrounds/      Action background illustrations (names match action ids)
- characters/
  - base/           Base body layers (body-*)
  - faces/          Face variants (face-XX)
  - hair/           Hair variants (hair-XX)
  - capes/          Capes
  - equipment/      Wearable gear by slot (feet/hands/head)
  - clothing/       Clothing layers (legs/torso)

- icons/
  - skills/         Skill icons (names match skill ids)
  - equipment/      Equipment item icons (names match equipment ids)
  - slots/          Slot icons (names match slot ids)
  - ui/             UI control icons (buttons, tabs, system)

- items/            Item/resource icons (names match item ids)

## Conventions

- File names use kebab-case where practical (e.g., face-01.svg).
- Item/equipment ids map 1:1 to file names used by the UI.
- Avoid creating new "misc" or "temp" folders; extend existing categories.
- Backgrounds should stay aligned with action ids (e.g., `combat.svg`).
