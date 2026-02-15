# Dungeon Renderer Hotspots

Pixi rendering is intentionally organized so that `updateFrame` stays readable and effect logic stays localized.

## Where To Put New Code

- `src/app/components/dungeon/renderer/updateFrame.ts`
  - Frame orchestration only: build maps, sync unit nodes, call specialized helpers.
- `src/app/components/dungeon/renderer/updateFrame/attackVfx.ts`
  - Attack VFX pooling + rendering (melee/ranged/magic).
- `src/app/components/dungeon/renderer/updateFrame/floatingText.ts`
  - Floating combat text pooling + fade-out.
- `src/app/components/dungeon/renderer/updateFrame/layout.ts`
  - Overlay labels + world scaling/pivot/position.

## Notes

- Keep pooling logic inside the dedicated helper modules.
- Avoid importing app/store logic here; this layer should remain render-only.

