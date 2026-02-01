import { memo } from "react";

type StatsViewIconProps = {
    className?: string;
};

const UI_ICON_PATH = `${__ASSETS_PATH__}icons/ui/`;

export const GlobalProgressIcon = memo(({ className }: StatsViewIconProps) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <use href={`${UI_ICON_PATH}stats-global.svg#icon`} />
    </svg>
));

GlobalProgressIcon.displayName = "GlobalProgressIcon";

export const HeroProgressIcon = memo(({ className }: StatsViewIconProps) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <use href={`${UI_ICON_PATH}stats-hero-progress.svg#icon`} />
    </svg>
));

HeroProgressIcon.displayName = "HeroProgressIcon";

export const HeroStatsIcon = memo(({ className }: StatsViewIconProps) => (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <use href={`${UI_ICON_PATH}stats-hero.svg#icon`} />
    </svg>
));

HeroStatsIcon.displayName = "HeroStatsIcon";
