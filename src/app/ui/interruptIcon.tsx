import { memo } from "react";

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const InterruptIcon = memo(() => (
    <svg className="ts-collapse-icon" viewBox="0 0 20 20" aria-hidden="true">
        <use href={`${UI_ICON_PATH}interrupt.svg#icon`} />
    </svg>
));

InterruptIcon.displayName = "InterruptIcon";
