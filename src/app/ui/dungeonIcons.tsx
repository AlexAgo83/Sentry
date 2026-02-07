import { memo } from "react";

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const AutoRestartOnIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}dungeon-auto-restart-on.svg#icon`} />
    </svg>
));

AutoRestartOnIcon.displayName = "AutoRestartOnIcon";

export const AutoRestartOffIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}dungeon-auto-restart-off.svg#icon`} />
    </svg>
));

AutoRestartOffIcon.displayName = "AutoRestartOffIcon";

export const AutoHealOnIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}dungeon-auto-heal-on.svg#icon`} />
    </svg>
));

AutoHealOnIcon.displayName = "AutoHealOnIcon";

export const AutoHealOffIcon = memo(() => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <use href={`${UI_ICON_PATH}dungeon-auto-heal-off.svg#icon`} />
    </svg>
));

AutoHealOffIcon.displayName = "AutoHealOffIcon";
