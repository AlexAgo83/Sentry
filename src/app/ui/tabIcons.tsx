import { memo } from "react";

export type TabIconKind =
    | "action"
    | "dungeon"
    | "stats"
    | "roster"
    | "inventory"
    | "equipment"
    | "shop"
    | "quests"
    | "hero"
    | "travel";

type TabIconProps = {
    kind: TabIconKind;
};

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const TabIcon = memo(({ kind }: TabIconProps) => {
    switch (kind) {
        case "action":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-action.svg#icon`} />
                </svg>
            );
        case "dungeon":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-action.svg#icon`} />
                </svg>
            );
        case "stats":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-stats.svg#icon`} />
                </svg>
            );
        case "roster":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-roster.svg#icon`} />
                </svg>
            );
        case "hero":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-hero.svg#icon`} />
                </svg>
            );
        case "inventory":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-inventory.svg#icon`} />
                </svg>
            );
        case "travel":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-travel.svg#icon`} />
                </svg>
            );
        case "quests":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-quests.svg#icon`} />
                </svg>
            );
        case "equipment":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-equipment.svg#icon`} />
                </svg>
            );
        case "shop":
            return (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href={`${UI_ICON_PATH}tab-shop.svg#icon`} />
                </svg>
            );
        default:
            return null;
    }
});

TabIcon.displayName = "TabIcon";
