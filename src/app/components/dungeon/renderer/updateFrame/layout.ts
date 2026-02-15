import type { DungeonArenaFrame } from "../../arenaPlayback";
import { getAutoFitScale } from "../drawing";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../constants";
import type { PixiRuntime } from "../types";

export const updateFrameLayout = (
    runtime: PixiRuntime,
    frame: DungeonArenaFrame,
    viewportWidth: number,
    viewportHeight: number
) => {
    const overlayLabel = frame.bossPhaseLabel ?? frame.floorLabel ?? "";
    runtime.phaseLabel.visible = overlayLabel.length > 0;
    runtime.phaseLabel.text = overlayLabel;
    runtime.phaseLabel.position.set(viewportWidth / 2, viewportHeight / 2);

    runtime.world.scale.set(getAutoFitScale(viewportWidth, viewportHeight, frame.units));
    runtime.world.pivot.set(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    runtime.world.position.set(viewportWidth / 2, viewportHeight / 2);
};

